import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JSZip from 'jszip';

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
function findBestMatch(fileName: string, venues: { id: string; name: string }[]): { id: string; name: string } | null {
  const normalizedFileName = normalizeVenueName(fileName);
  
  // Exact match
  for (const venue of venues) {
    if (normalizeVenueName(venue.name) === normalizedFileName) {
      return venue;
    }
  }
  
  // Contains match
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    if (normalizedVenueName.includes(normalizedFileName) || normalizedFileName.includes(normalizedVenueName)) {
      return venue;
    }
  }
  
  // Fuzzy match with key words
  const fileWords = normalizedFileName.split(' ').filter(w => w.length > 2);
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    const matchCount = fileWords.filter(word => normalizedVenueName.includes(word)).length;
    if (matchCount >= 2 || (matchCount >= 1 && fileWords.length <= 2)) {
      return venue;
    }
  }
  
  return null;
}

// Extract SVG content from text that might contain HTML wrapper
function extractSvgContent(content: string): string | null {
  // Check if it's already clean SVG
  if (content.trim().startsWith('<svg') || content.trim().startsWith('<?xml')) {
    return content;
  }
  
  // Try to extract SVG from HTML
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  }
  
  // Check for SVG markers
  if (content.includes('<path') || content.includes('<g ') || content.includes('viewBox')) {
    return content;
  }
  
  return null;
}

export default function VenueMapUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<{ matched: number; updated: number; skipped: number; unmatched: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setSummary(null);

    try {
      console.log('Starting ZIP processing...', file.name, file.size);
      
      // Load the zip file
      const zip = new JSZip();
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded as ArrayBuffer:', arrayBuffer.byteLength);
      
      const zipContent = await zip.loadAsync(arrayBuffer);
      console.log('ZIP loaded successfully');
      
      // Get all files - use Object.keys to iterate
      const allFiles = Object.keys(zipContent.files);
      console.log('All file names in ZIP:', allFiles.slice(0, 20));
      
      const files = allFiles
        .filter(name => !zipContent.files[name].dir)
        .map(name => [name, zipContent.files[name]] as [string, JSZip.JSZipObject]);
      console.log(`Found ${files.length} non-directory files in zip`);

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
        const [fileName, fileObj] = files[i];
        console.log(`Processing file ${i + 1}/${files.length}: ${fileName}`);
        setProgress(Math.round((i / files.length) * 100));

        try {
          // Read file content
          const content = await fileObj.async('string');
          
          // Check if it contains SVG content
          const svgContent = extractSvgContent(content);
          if (!svgContent) {
            console.log(`Skipping ${fileName} - no SVG content found`);
            continue;
          }

          const baseName = fileName.split('/').pop() || fileName;
          
          // Find matching venue
          const matchedVenue = findBestMatch(baseName, venues || []);
          
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
                fileName: baseName,
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
                fileName: baseName,
                venueName: matchedVenue.name,
                status: 'error',
                message: `Database update failed: ${updateError.message}`
              });
            } else {
              stats.updated++;
              processResults.push({
                fileName: baseName,
                venueName: matchedVenue.name,
                status: 'updated',
                message: 'Successfully uploaded and linked'
              });
            }
          } else {
            stats.unmatched++;
            processResults.push({
              fileName: baseName,
              status: 'unmatched',
              message: 'No matching venue found in database'
            });
          }
        } catch (e) {
          stats.errors++;
          processResults.push({
            fileName: fileName.split('/').pop() || fileName,
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
      } else if (stats.skipped > 0) {
        toast.info('All matching venues already have maps');
      } else {
        toast.warning('No venue maps were updated');
      }

    } catch (error) {
      console.error('Error processing zip:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process zip file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processZipFile(file);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Venue Map Uploader</h1>
        <p className="text-muted-foreground">
          Upload a ZIP file containing SVG venue maps. They will be automatically matched to venues in the database.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload ZIP File
          </CardTitle>
          <CardDescription>
            Select a ZIP file containing SVG or TXT files with SVG content. File names should match venue names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
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
                Select ZIP File
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
