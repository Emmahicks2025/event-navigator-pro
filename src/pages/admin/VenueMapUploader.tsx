import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Loader2, FileText, Files, Play, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StagedFile {
  file: File;
  content: string | null;
  status: 'pending' | 'loaded' | 'error';
}

interface ProcessResult {
  fileName: string;
  venueName?: string;
  status: 'matched' | 'updated' | 'skipped' | 'unmatched' | 'error';
  message: string;
}

interface InstructionsInfo {
  found: boolean;
  content: string;
  fileName: string;
}

export default function VenueMapUploader() {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [instructions, setInstructions] = useState<InstructionsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [summary, setSummary] = useState<{ matched: number; updated: number; skipped: number; unmatched: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage 1: Load files into memory (don't process yet)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newStagedFiles: StagedFile[] = [];
    let foundInstructions: InstructionsInfo | null = null;

    console.log(`Loading ${files.length} files into memory...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lowerName = file.name.toLowerCase();
      
      try {
        const content = await file.text();
        console.log(`Loaded: ${file.name} (${content.length} chars)`);

        // Check if this is an instruction file
        if (lowerName.includes('readme') || lowerName.includes('instruction') || lowerName.includes('guide')) {
          foundInstructions = {
            found: true,
            content: content,
            fileName: file.name
          };
          console.log(`Found instructions file: ${file.name}`);
        } else {
          newStagedFiles.push({
            file,
            content,
            status: 'loaded'
          });
        }
      } catch (error) {
        console.error(`Failed to read ${file.name}:`, error);
        newStagedFiles.push({
          file,
          content: null,
          status: 'error'
        });
      }
    }

    setStagedFiles(prev => [...prev, ...newStagedFiles]);
    if (foundInstructions) {
      setInstructions(foundInstructions);
    }
    setIsLoading(false);
    
    toast.success(`Loaded ${newStagedFiles.length} files. ${foundInstructions ? 'Found instructions file!' : ''}`);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear all staged files
  const clearFiles = () => {
    setStagedFiles([]);
    setInstructions(null);
    setResults([]);
    setSummary(null);
    setProgress(0);
  };

  // Stage 2: Process staged files using AI analysis
  const processFiles = async () => {
    if (stagedFiles.length === 0) {
      toast.error('No files staged for processing');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setSummary(null);

    try {
      // Fetch all venues from database
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id, name, svg_map');
      
      if (venuesError) {
        throw new Error(`Failed to fetch venues: ${venuesError.message}`);
      }

      console.log(`Found ${venues?.length || 0} venues in database`);
      console.log(`Instructions: ${instructions?.found ? 'Yes' : 'No'}`);

      const processResults: ProcessResult[] = [];
      const stats = { matched: 0, updated: 0, skipped: 0, unmatched: 0, errors: 0 };

      // Process each staged file using AI
      for (let i = 0; i < stagedFiles.length; i++) {
        const stagedFile = stagedFiles[i];
        const fileName = stagedFile.file.name;
        
        console.log(`Processing ${i + 1}/${stagedFiles.length}: ${fileName}`);
        setProgress(Math.round(((i + 1) / stagedFiles.length) * 100));

        if (!stagedFile.content) {
          processResults.push({
            fileName,
            status: 'error',
            message: 'File could not be read'
          });
          stats.errors++;
          continue;
        }

        try {
          // Use AI to analyze the file and extract SVG + venue name
          const analysisResult = await analyzeFileWithAI(
            fileName,
            stagedFile.content,
            instructions?.content || null,
            venues?.map(v => v.name) || []
          );

          if (!analysisResult.svgContent) {
            processResults.push({
              fileName,
              status: 'error',
              message: analysisResult.error || 'No SVG content found'
            });
            stats.errors++;
            continue;
          }

          // Find matching venue
          const matchedVenue = analysisResult.matchedVenueName 
            ? venues?.find(v => 
                v.name.toLowerCase() === analysisResult.matchedVenueName?.toLowerCase() ||
                normalizeVenueName(v.name) === normalizeVenueName(analysisResult.matchedVenueName || '')
              )
            : null;

          if (!matchedVenue) {
            // Try fuzzy match
            const fuzzyMatch = findBestMatch(
              analysisResult.extractedVenueName || fileName,
              venues || []
            );
            
            if (fuzzyMatch) {
              // Upload and update
              const uploadResult = await uploadSvgToVenue(fuzzyMatch, analysisResult.svgContent);
              if (uploadResult.success) {
                stats.matched++;
                stats.updated++;
                processResults.push({
                  fileName,
                  venueName: fuzzyMatch.name,
                  status: 'updated',
                  message: `SVG uploaded (${Math.round(analysisResult.svgContent.length / 1024)}KB) via fuzzy match`
                });
              } else {
                stats.errors++;
                processResults.push({
                  fileName,
                  venueName: fuzzyMatch.name,
                  status: 'error',
                  message: uploadResult.error || 'Upload failed'
                });
              }
            } else {
              stats.unmatched++;
              processResults.push({
                fileName,
                venueName: analysisResult.extractedVenueName || undefined,
                status: 'unmatched',
                message: `No matching venue found for "${analysisResult.extractedVenueName || fileName}"`
              });
            }
          } else {
            // Direct match found
            const uploadResult = await uploadSvgToVenue(matchedVenue, analysisResult.svgContent);
            if (uploadResult.success) {
              stats.matched++;
              stats.updated++;
              processResults.push({
                fileName,
                venueName: matchedVenue.name,
                status: 'updated',
                message: `SVG uploaded (${Math.round(analysisResult.svgContent.length / 1024)}KB)`
              });
            } else {
              stats.errors++;
              processResults.push({
                fileName,
                venueName: matchedVenue.name,
                status: 'error',
                message: uploadResult.error || 'Upload failed'
              });
            }
          }
        } catch (e) {
          stats.errors++;
          processResults.push({
            fileName,
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

  // AI-powered file analysis
  const analyzeFileWithAI = async (
    fileName: string,
    content: string,
    instructionsContent: string | null,
    venueNames: string[]
  ): Promise<{
    svgContent: string | null;
    extractedVenueName: string | null;
    matchedVenueName: string | null;
    error: string | null;
  }> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-svg-file', {
        body: {
          fileName,
          content,
          instructions: instructionsContent,
          venueNames
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        // Fallback to regex extraction
        return fallbackExtraction(content, fileName);
      }

      return {
        svgContent: data.svgContent,
        extractedVenueName: data.extractedVenueName,
        matchedVenueName: data.matchedVenueName,
        error: data.error
      };
    } catch (e) {
      console.error('AI analysis failed, using fallback:', e);
      return fallbackExtraction(content, fileName);
    }
  };

  // Fallback regex extraction if AI fails
  const fallbackExtraction = (content: string, fileName: string): {
    svgContent: string | null;
    extractedVenueName: string | null;
    matchedVenueName: string | null;
    error: string | null;
  } => {
    // Extract venue name from header metadata
    let venueName: string | null = null;
    const venueMatch = content.match(/Venue:\s*(.+?)(?:\n|$)/i);
    if (venueMatch) {
      venueName = venueMatch[1].trim();
    }
    
    if (!venueName) {
      const titleMatch = content.match(/Title:\s*(.+?)(?:\s*-\s*|\n|$)/i);
      if (titleMatch) {
        venueName = titleMatch[1].trim();
      }
    }
    
    // Find SVG content
    const svgOpenMatch = content.match(/<svg[^>]*>/i);
    if (!svgOpenMatch) {
      return { svgContent: null, extractedVenueName: venueName, matchedVenueName: null, error: 'No <svg> tag found' };
    }
    
    const svgStartIndex = content.indexOf(svgOpenMatch[0]);
    const svgEndIndex = content.lastIndexOf('</svg>');
    
    if (svgEndIndex === -1) {
      return { svgContent: null, extractedVenueName: venueName, matchedVenueName: null, error: 'No closing </svg> tag found' };
    }
    
    const svgContent = content.substring(svgStartIndex, svgEndIndex + 6);
    
    return {
      svgContent,
      extractedVenueName: venueName,
      matchedVenueName: null,
      error: null
    };
  };

  // Upload SVG to storage and update venue
  const uploadSvgToVenue = async (
    venue: { id: string; name: string },
    svgContent: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const safeName = venue.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const storagePath = `${safeName}.svg`;
      
      const { error: uploadError } = await supabase.storage
        .from('venue-maps')
        .upload(storagePath, new Blob([svgContent], { type: 'image/svg+xml' }), {
          upsert: true
        });

      if (uploadError) {
        return { success: false, error: `Storage upload failed: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage.from('venue-maps').getPublicUrl(storagePath);

      const { error: updateError } = await supabase
        .from('venues')
        .update({ svg_map: urlData.publicUrl })
        .eq('id', venue.id);

      if (updateError) {
        return { success: false, error: `Database update failed: ${updateError.message}` };
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Venue Map Uploader</h1>
        <p className="text-muted-foreground">
          Upload text files containing SVG venue maps. Files are staged first, then processed using AI analysis.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Stage Files for Upload
          </CardTitle>
          <CardDescription>
            Select .txt or .svg files. Include instruction/README files - they will be used to guide the AI extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.svg"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isProcessing}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Files className="mr-2 h-4 w-4" />
                  Add Files
                </>
              )}
            </Button>

            {stagedFiles.length > 0 && (
              <>
                <Button
                  onClick={processFiles}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Process {stagedFiles.length} Files
                    </>
                  )}
                </Button>

                <Button
                  onClick={clearFiles}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staged Files */}
      {stagedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Files className="h-5 w-5" />
              Staged Files ({stagedFiles.length})
            </CardTitle>
            {instructions && (
              <CardDescription className="text-green-600">
                ✓ Instructions file loaded: {instructions.fileName}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {stagedFiles.map((sf, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border bg-muted/50 text-sm"
                >
                  <span className="font-mono">{sf.file.name}</span>
                  <span className="text-muted-foreground">
                    {sf.content ? `${Math.round(sf.content.length / 1024)}KB` : 'Error'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
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

      {/* Results */}
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

// Helper functions
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
