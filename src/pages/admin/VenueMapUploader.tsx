import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessResult {
  fileName: string;
  venueName?: string;
  status: 'matched' | 'updated' | 'skipped' | 'unmatched' | 'error';
  message: string;
}

// Normalize venue names for matching
function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\.txt$/i, '')
    .replace(/\.svg$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Find matching venue from database
function findBestMatch(searchName: string, venues: { id: string; name: string }[]): { id: string; name: string } | null {
  const normalizedSearch = normalizeVenueName(searchName);
  
  // Exact match
  for (const venue of venues) {
    if (normalizeVenueName(venue.name) === normalizedSearch) {
      return venue;
    }
  }
  
  // Contains match
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    if (normalizedVenueName.includes(normalizedSearch) || normalizedSearch.includes(normalizedVenueName)) {
      return venue;
    }
  }
  
  // Fuzzy match with key words
  const searchWords = normalizedSearch.split(' ').filter(w => w.length > 2);
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    const matchCount = searchWords.filter(word => normalizedVenueName.includes(word)).length;
    if (matchCount >= 2 || (matchCount >= 1 && searchWords.length <= 2)) {
      return venue;
    }
  }
  
  return null;
}

// Extract clean SVG content from text that may have metadata header
function extractSvgContent(content: string): { svg: string | null; venueName: string | null } {
  // Extract venue name from header metadata (before SVG)
  let venueName: string | null = null;
  const venueMatch = content.match(/Venue:\s*(.+?)(?:\n|$)/i);
  if (venueMatch) {
    venueName = venueMatch[1].trim();
  }
  
  // Also try "Title:" pattern
  if (!venueName) {
    const titleMatch = content.match(/Title:\s*(.+?)(?:\s*-\s*|\n|$)/i);
    if (titleMatch) {
      venueName = titleMatch[1].trim();
    }
  }
  
  // Find the actual <svg opening tag
  const svgOpenMatch = content.match(/<svg[^>]*>/i);
  if (!svgOpenMatch) {
    return { svg: null, venueName };
  }
  
  const svgStartIndex = content.indexOf(svgOpenMatch[0]);
  
  // Find the closing </svg> tag
  const svgEndIndex = content.lastIndexOf('</svg>');
  if (svgEndIndex === -1) {
    return { svg: null, venueName };
  }
  
  // Extract only the SVG portion (from <svg to </svg>)
  const svgContent = content.substring(svgStartIndex, svgEndIndex + 6);
  
  // Validate it's proper SVG
  if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
    return { svg: null, venueName };
  }
  
  console.log(`Extracted clean SVG: ${svgContent.length} chars, venue: ${venueName || 'unknown'}`);
  return { svg: svgContent, venueName };
}

export default function VenueMapUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<{ matched: number; updated: number; skipped: number; unmatched: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processTextFiles = async (files: FileList) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setSummary(null);

    try {
      console.log(`Processing ${files.length} text file(s)...`);

      // Fetch all venues from database
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name, svg_map');
      
      if (venuesError) {
        throw new Error(`Failed to fetch venues: ${venuesError.message}`);
      }

      console.log(`Found ${venues?.length || 0} venues in database`);

      const processResults: ProcessResult[] = [];
      const stats = { matched: 0, updated: 0, skipped: 0, unmatched: 0, errors: 0 };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        setProgress(Math.round(((i + 1) / files.length) * 100));

        try {
          // Read file content
          const content = await file.text();
          
          // Extract SVG content and venue name from metadata
          const { svg: svgContent, venueName: extractedVenueName } = extractSvgContent(content);
          
          if (!svgContent) {
            console.log(`Skipping ${file.name} - no SVG content found`);
            processResults.push({
              fileName: file.name,
              status: 'error',
              message: 'No valid SVG content found in file'
            });
            stats.errors++;
            continue;
          }

          // Find matching venue - try extracted name first, then filename
          let matchedVenue = extractedVenueName 
            ? findBestMatch(extractedVenueName, venues || [])
            : null;
          
          if (!matchedVenue) {
            matchedVenue = findBestMatch(file.name, venues || []);
          }
          
          if (matchedVenue) {
            stats.matched++;

            // Upload SVG to storage
            const safeName = matchedVenue.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const storagePath = `${safeName}.svg`;
            
            const { error: uploadError } = await supabase.storage
              .from('venue-maps')
              .upload(storagePath, new Blob([svgContent], { type: 'image/svg+xml' }), {
                upsert: true
              });

            if (uploadError) {
              stats.errors++;
              processResults.push({
                fileName: file.name,
                venueName: matchedVenue.name,
                status: 'error',
                message: `Upload failed: ${uploadError.message}`
              });
              continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from('venue-maps').getPublicUrl(storagePath);

            // Update venue with SVG URL
            const { error: updateError } = await supabase
              .from('venues')
              .update({ svg_map: urlData.publicUrl })
              .eq('id', matchedVenue.id);

            if (updateError) {
              stats.errors++;
              processResults.push({
                fileName: file.name,
                venueName: matchedVenue.name,
                status: 'error',
                message: `Database update failed: ${updateError.message}`
              });
            } else {
              stats.updated++;
              processResults.push({
                fileName: file.name,
                venueName: matchedVenue.name,
                status: 'updated',
                message: `SVG uploaded (${Math.round(svgContent.length / 1024)}KB)`
              });
            }
          } else {
            stats.unmatched++;
            processResults.push({
              fileName: file.name,
              venueName: extractedVenueName || undefined,
              status: 'unmatched',
              message: `No matching venue found${extractedVenueName ? ` for "${extractedVenueName}"` : ''}`
            });
          }
        } catch (e) {
          stats.errors++;
          processResults.push({
            fileName: file.name,
            status: 'error',
            message: e instanceof Error ? e.message : 'Unknown error'
          });
        }
      }

      setResults(processResults);
      setSummary(stats);
      setProgress(100);
      
      if (stats.updated > 0) {
        toast.success(`Successfully updated ${stats.updated} venue maps!`);
      } else if (stats.errors > 0) {
        toast.error(`Processing complete with ${stats.errors} errors`);
      } else {
        toast.warning('No venue maps were updated');
      }

    } catch (error) {
      console.error('Error processing files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process files');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processTextFiles(files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Venue Map Uploader</h1>
        <p className="text-muted-foreground">
          Upload text files containing SVG venue maps. They will be automatically matched to venues in the database.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload SVG Text Files
          </CardTitle>
          <CardDescription>
            Select one or more .txt files containing SVG code. Files can include metadata headers (Venue:, Title:, URL:) - only the SVG code will be extracted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.svg"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Select Text Files
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default" className="text-sm py-1 px-3">
                Matched: {summary.matched}
              </Badge>
              <Badge variant="default" className="bg-green-600 text-sm py-1 px-3">
                Updated: {summary.updated}
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                Skipped: {summary.skipped}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                Unmatched: {summary.unmatched}
              </Badge>
              {summary.errors > 0 && (
                <Badge variant="destructive" className="text-sm py-1 px-3">
                  Errors: {summary.errors}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              Showing {results.length} processed files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {result.status === 'updated' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {result.status === 'skipped' && <Badge variant="secondary">Skipped</Badge>}
                    {result.status === 'unmatched' && <Badge variant="outline">No Match</Badge>}
                    {result.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                    <span className="font-mono text-sm">{result.fileName}</span>
                    {result.venueName && (
                      <span className="text-muted-foreground">→ {result.venueName}</span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
