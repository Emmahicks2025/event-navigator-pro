import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Upload, FileSpreadsheet, Image, Loader2, CheckCircle2, 
  XCircle, AlertCircle, Sparkles, Download, FileText, MapPin
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface EventRow {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  doors_open_time?: string;
  venue_name?: string;
  category_name?: string;
  performer_name?: string;
  image_url?: string;
  price_from?: number;
  price_to?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

interface UploadResult {
  row: number;
  title: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

interface SvgUploadResult {
  filename: string;
  venueName: string;
  status: 'success' | 'error' | 'matched' | 'created';
  message: string;
  venueId?: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
}

const BulkUpload = () => {
  // Excel Upload State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<EventRow[]>([]);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelResults, setExcelResults] = useState<UploadResult[]>([]);
  const [excelProgress, setExcelProgress] = useState(0);

  // SVG Upload State
  const [svgFiles, setSvgFiles] = useState<File[]>([]);
  const [useAI, setUseAI] = useState(true);
  const [svgUploading, setSvgUploading] = useState(false);
  const [svgResults, setSvgResults] = useState<SvgUploadResult[]>([]);
  const [svgProgress, setSvgProgress] = useState(0);
  const [createNewVenues, setCreateNewVenues] = useState(false);
  
  // Quick Seed State
  const [seeding, setSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<{ venues: { created: number; existing: number }; performers: { created: number; existing: number }; events: { created: number; existing: number } } | null>(null);

  // Handle Excel file selection
  const handleExcelSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];

    if (!validTypes.some(type => file.type.includes(type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setExcelFile(file);
    parseExcelFile(file);
  }, []);

  // Parse Excel file
  const parseExcelFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<EventRow>(firstSheet);
      
      // Normalize column names
      const normalizedData = data.map(row => {
        const normalized: EventRow = {
          title: row.title || (row as any).Title || (row as any).EVENT_TITLE || '',
          description: row.description || (row as any).Description || '',
          event_date: row.event_date || (row as any).date || (row as any).Date || (row as any).EVENT_DATE || '',
          event_time: row.event_time || (row as any).time || (row as any).Time || '',
          doors_open_time: row.doors_open_time || (row as any).doors_open || '',
          venue_name: row.venue_name || (row as any).venue || (row as any).Venue || (row as any).VENUE_NAME || '',
          category_name: row.category_name || (row as any).category || (row as any).Category || '',
          performer_name: row.performer_name || (row as any).performer || (row as any).Performer || (row as any).artist || '',
          image_url: row.image_url || (row as any).image || (row as any).Image || '',
          price_from: parseFloat(String(row.price_from || (row as any).price || (row as any).Price || 0)) || undefined,
          price_to: parseFloat(String(row.price_to || (row as any).max_price || 0)) || undefined,
          is_featured: row.is_featured || (row as any).featured === 'true' || (row as any).featured === true,
          is_active: row.is_active !== false && (row as any).active !== 'false',
        };
        return normalized;
      });

      setExcelData(normalizedData);
      toast.success(`Parsed ${normalizedData.length} events from Excel`);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      toast.error('Failed to parse Excel file');
    }
  };

  // Upload Excel events
  const uploadExcelEvents = async () => {
    if (excelData.length === 0) {
      toast.error('No events to upload');
      return;
    }

    setExcelUploading(true);
    setExcelResults([]);
    setExcelProgress(0);

    const results: UploadResult[] = [];

    // Fetch lookup data
    const [venuesRes, categoriesRes, performersRes] = await Promise.all([
      supabase.from('venues').select('id, name, city'),
      supabase.from('categories').select('id, name, slug'),
      supabase.from('performers').select('id, name'),
    ]);

    const venues = venuesRes.data || [];
    const categories = categoriesRes.data || [];
    const performers = performersRes.data || [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      setExcelProgress(Math.round(((i + 1) / excelData.length) * 100));

      try {
        // Validate required fields
        if (!row.title || !row.event_date) {
          results.push({
            row: i + 2,
            title: row.title || 'Unknown',
            status: 'error',
            message: 'Missing required fields (title or event_date)',
          });
          continue;
        }

        // Parse and validate date
        let eventDate = row.event_date;
        if (typeof eventDate === 'number') {
          // Excel serial date
          const excelDate = XLSX.SSF.parse_date_code(eventDate);
          eventDate = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
        } else if (typeof eventDate === 'string') {
          // Try to parse various date formats
          const parsed = new Date(eventDate);
          if (!isNaN(parsed.getTime())) {
            eventDate = parsed.toISOString().split('T')[0];
          }
        }

        // Find matching venue
        let venueId = null;
        if (row.venue_name) {
          const venueMatch = venues.find(v => 
            v.name.toLowerCase().includes(row.venue_name!.toLowerCase()) ||
            row.venue_name!.toLowerCase().includes(v.name.toLowerCase())
          );
          venueId = venueMatch?.id || null;
        }

        // Find matching category
        let categoryId = null;
        if (row.category_name) {
          const categoryMatch = categories.find(c => 
            c.name.toLowerCase() === row.category_name!.toLowerCase() ||
            c.slug.toLowerCase() === row.category_name!.toLowerCase()
          );
          categoryId = categoryMatch?.id || null;
        }

        // Find matching performer
        let performerId = null;
        if (row.performer_name) {
          const performerMatch = performers.find(p => 
            p.name.toLowerCase().includes(row.performer_name!.toLowerCase()) ||
            row.performer_name!.toLowerCase().includes(p.name.toLowerCase())
          );
          performerId = performerMatch?.id || null;
        }

        // Insert event
        const { error } = await supabase.from('events').insert({
          title: row.title,
          description: row.description || null,
          event_date: eventDate,
          event_time: row.event_time || null,
          doors_open_time: row.doors_open_time || null,
          venue_id: venueId,
          category_id: categoryId,
          performer_id: performerId,
          image_url: row.image_url || null,
          price_from: row.price_from || null,
          price_to: row.price_to || null,
          is_featured: row.is_featured || false,
          is_active: row.is_active !== false,
        });

        if (error) throw error;

        let warningMsg = '';
        if (!venueId && row.venue_name) warningMsg += `Venue "${row.venue_name}" not found. `;
        if (!categoryId && row.category_name) warningMsg += `Category "${row.category_name}" not found. `;
        if (!performerId && row.performer_name) warningMsg += `Performer "${row.performer_name}" not found. `;

        results.push({
          row: i + 2,
          title: row.title,
          status: warningMsg ? 'warning' : 'success',
          message: warningMsg || 'Created successfully',
        });

      } catch (err: any) {
        results.push({
          row: i + 2,
          title: row.title || 'Unknown',
          status: 'error',
          message: err.message || 'Failed to create event',
        });
      }
    }

    setExcelResults(results);
    setExcelUploading(false);

    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      toast.success(`Uploaded ${successCount} events${warningCount > 0 ? ` (${warningCount} with warnings)` : ''}`);
    } else {
      toast.error(`${errorCount} errors, ${successCount} successful`);
    }
  };

  // Handle SVG file selection
  const handleSvgSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const svgFiles = files.filter(f => f.name.endsWith('.svg'));
    
    if (svgFiles.length === 0) {
      toast.error('Please upload SVG files');
      return;
    }

    if (svgFiles.length !== files.length) {
      toast.warning(`Filtered to ${svgFiles.length} SVG files (${files.length - svgFiles.length} non-SVG files ignored)`);
    }

    setSvgFiles(svgFiles);
    toast.success(`Selected ${svgFiles.length} SVG files`);
  }, []);

  // Extract venue name from filename
  const extractVenueName = (filename: string): string => {
    // Remove .svg extension and common prefixes/suffixes
    let name = filename.replace(/\.svg$/i, '');
    
    // Replace underscores and dashes with spaces
    name = name.replace(/[_-]/g, ' ');
    
    // Remove common suffixes like "map", "seating", "chart"
    name = name.replace(/\s*(map|seating|chart|layout|venue|arena|stadium|center|theatre|theater)\s*$/i, '');
    
    // Capitalize first letter of each word
    name = name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return name.trim();
  };

  // Match venue by name (fuzzy matching)
  const findMatchingVenue = (name: string, venues: Venue[]): Venue | null => {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Exact match first
    const exactMatch = venues.find(v => 
      v.name.toLowerCase() === name.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // Fuzzy match
    const fuzzyMatch = venues.find(v => {
      const normalizedVenue = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedVenue.includes(normalizedName) || 
             normalizedName.includes(normalizedVenue);
    });
    
    return fuzzyMatch || null;
  };

  // Upload SVG files
  const uploadSvgFiles = async () => {
    if (svgFiles.length === 0) {
      toast.error('No SVG files selected');
      return;
    }

    setSvgUploading(true);
    setSvgResults([]);
    setSvgProgress(0);

    const results: SvgUploadResult[] = [];

    // Fetch existing venues
    const { data: venues } = await supabase.from('venues').select('id, name, city');
    const venuesList = venues || [];

    for (let i = 0; i < svgFiles.length; i++) {
      const file = svgFiles[i];
      setSvgProgress(Math.round(((i + 1) / svgFiles.length) * 100));

      try {
        const svgContent = await file.text();
        let venueName = extractVenueName(file.name);
        
        // Use AI to enhance venue name detection if enabled
        if (useAI) {
          try {
            const { data, error } = await supabase.functions.invoke('detect-venue-from-svg', {
              body: { 
                filename: file.name, 
                svgContent: svgContent.substring(0, 5000), // Limit for AI processing
                existingVenues: venuesList.map(v => v.name)
              }
            });

            if (!error && data?.venueName) {
              venueName = data.venueName;
            }
          } catch (aiError) {
            console.warn('AI detection failed, using filename:', aiError);
          }
        }

        // Find matching venue
        const matchedVenue = findMatchingVenue(venueName, venuesList);

        // Extract viewBox from SVG
        const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '';

        if (matchedVenue) {
          // Update existing venue with SVG
          const { error } = await supabase
            .from('venues')
            .update({
              svg_map: svgContent,
              map_viewbox: viewBox,
            })
            .eq('id', matchedVenue.id);

          if (error) throw error;

          results.push({
            filename: file.name,
            venueName: matchedVenue.name,
            status: 'matched',
            message: `Matched and updated venue "${matchedVenue.name}"`,
            venueId: matchedVenue.id,
          });

        } else if (createNewVenues) {
          // Create new venue with SVG
          const { data: newVenue, error } = await supabase
            .from('venues')
            .insert({
              name: venueName,
              city: 'TBD',
              svg_map: svgContent,
              map_viewbox: viewBox,
            })
            .select()
            .single();

          if (error) throw error;

          // Add to venues list for subsequent matches
          venuesList.push({ id: newVenue.id, name: newVenue.name, city: newVenue.city });

          results.push({
            filename: file.name,
            venueName: venueName,
            status: 'created',
            message: `Created new venue "${venueName}" (city: TBD)`,
            venueId: newVenue.id,
          });

        } else {
          results.push({
            filename: file.name,
            venueName: venueName,
            status: 'error',
            message: `No matching venue found for "${venueName}". Enable "Create new venues" to auto-create.`,
          });
        }

      } catch (err: any) {
        results.push({
          filename: file.name,
          venueName: extractVenueName(file.name),
          status: 'error',
          message: err.message || 'Failed to process SVG',
        });
      }
    }

    setSvgResults(results);
    setSvgUploading(false);

    const matchedCount = results.filter(r => r.status === 'matched').length;
    const createdCount = results.filter(r => r.status === 'created').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      toast.success(`Processed ${matchedCount + createdCount} SVG files (${matchedCount} matched, ${createdCount} created)`);
    } else {
      toast.warning(`${errorCount} errors, ${matchedCount} matched, ${createdCount} created`);
    }
  };

  // Download sample Excel template
  const downloadTemplate = () => {
    const template = [
      {
        title: 'Example Concert',
        description: 'An amazing concert experience',
        event_date: '2026-03-15',
        event_time: '19:00',
        doors_open_time: '18:00',
        venue_name: 'Madison Square Garden',
        category_name: 'concerts',
        performer_name: 'Artist Name',
        image_url: 'https://example.com/image.jpg',
        price_from: 50,
        price_to: 500,
        is_featured: false,
        is_active: true,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    XLSX.writeFile(wb, 'events_template.xlsx');
    toast.success('Template downloaded');
  };

  // Quick Seed from spreadsheet data
  const quickSeedData = async () => {
    setSeeding(true);
    setSeedResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('seed-events-data');
      
      if (error) throw error;
      
      if (data?.results) {
        setSeedResults(data.results);
        const total = data.results.venues.created + data.results.performers.created + data.results.events.created;
        toast.success(`Seeded ${total} new records (${data.results.venues.created} venues, ${data.results.performers.created} performers, ${data.results.events.created} events)`);
      }
    } catch (err: any) {
      console.error('Error seeding data:', err);
      toast.error(err.message || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Bulk Upload</h2>
        <p className="text-muted-foreground">
          Upload events from Excel or venue maps from SVG files
        </p>
      </div>

      {/* Quick Seed Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Quick Seed: Featured Events
          </CardTitle>
          <CardDescription>
            Instantly populate your database with 25+ featured events, venues, and performers with local images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={quickSeedData} 
            disabled={seeding}
            className="w-full"
            size="lg"
          >
            {seeding ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Seeding Database...
              </>
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Seed Featured Events & Performers
              </>
            )}
          </Button>
          
          {seedResults && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{seedResults.venues.created}</p>
                <p className="text-sm text-muted-foreground">Venues Created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{seedResults.performers.created}</p>
                <p className="text-sm text-muted-foreground">Performers Created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{seedResults.events.created}</p>
                <p className="text-sm text-muted-foreground">Events Created</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <FileSpreadsheet size={16} />
            Events (Excel)
          </TabsTrigger>
          <TabsTrigger value="venues" className="flex items-center gap-2">
            <MapPin size={16} />
            Venue Maps (SVG)
          </TabsTrigger>
        </TabsList>

        {/* Excel Events Upload */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet size={20} />
                  Upload Excel File
                </CardTitle>
                <CardDescription>
                  Upload an Excel file with event data. Download the template to see the expected format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download size={16} className="mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excel-file">Select Excel File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelSelect}
                  />
                </div>

                {excelFile && (
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <FileText size={20} className="text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{excelFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {excelData.length} events parsed
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={uploadExcelEvents} 
                  disabled={excelUploading || excelData.length === 0}
                  className="w-full"
                >
                  {excelUploading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Uploading... {excelProgress}%
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Upload {excelData.length} Events
                    </>
                  )}
                </Button>

                {excelUploading && (
                  <Progress value={excelProgress} className="h-2" />
                )}
              </CardContent>
            </Card>

            {/* Preview Table */}
            {excelData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview ({excelData.length} events)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {excelData.slice(0, 20).map((row, i) => (
                        <div key={i} className="p-2 bg-secondary rounded text-sm">
                          <p className="font-medium">{row.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {row.event_date} • {row.venue_name || 'No venue'} • {row.category_name || 'No category'}
                          </p>
                        </div>
                      ))}
                      {excelData.length > 20 && (
                        <p className="text-muted-foreground text-sm text-center py-2">
                          And {excelData.length - 20} more...
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          {excelResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Results</CardTitle>
                <div className="flex gap-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    <CheckCircle2 size={14} className="mr-1" />
                    {excelResults.filter(r => r.status === 'success').length} Success
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                    <AlertCircle size={14} className="mr-1" />
                    {excelResults.filter(r => r.status === 'warning').length} Warnings
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600">
                    <XCircle size={14} className="mr-1" />
                    {excelResults.filter(r => r.status === 'error').length} Errors
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {excelResults.map((result, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          result.status === 'success' ? 'bg-green-500/10' :
                          result.status === 'warning' ? 'bg-yellow-500/10' :
                          'bg-red-500/10'
                        }`}
                      >
                        {result.status === 'success' ? (
                          <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
                        ) : result.status === 'warning' ? (
                          <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                        ) : (
                          <XCircle size={18} className="text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">Row {result.row}: {result.title}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SVG Venue Maps Upload */}
        <TabsContent value="venues" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image size={20} />
                  Upload SVG Maps
                </CardTitle>
                <CardDescription>
                  Upload multiple SVG venue maps. File names will be used to match existing venues.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    <div>
                      <p className="font-medium">AI-Powered Detection</p>
                      <p className="text-sm text-muted-foreground">
                        Use AI to improve venue name matching from SVG content
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={useAI}
                    onCheckedChange={setUseAI}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Create New Venues</p>
                    <p className="text-sm text-muted-foreground">
                      Auto-create venues if no match found
                    </p>
                  </div>
                  <Switch
                    checked={createNewVenues}
                    onCheckedChange={setCreateNewVenues}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="svg-files">Select SVG Files</Label>
                  <Input
                    id="svg-files"
                    type="file"
                    accept=".svg"
                    multiple
                    onChange={handleSvgSelect}
                  />
                </div>

                {svgFiles.length > 0 && (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium mb-2">{svgFiles.length} files selected:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {svgFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Image size={14} className="text-primary" />
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-primary font-medium">
                            {extractVenueName(file.name)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={uploadSvgFiles} 
                  disabled={svgUploading || svgFiles.length === 0}
                  className="w-full"
                >
                  {svgUploading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing... {svgProgress}%
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Upload {svgFiles.length} SVG Files
                    </>
                  )}
                </Button>

                {svgUploading && (
                  <Progress value={svgProgress} className="h-2" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">File Name Detection</p>
                      <p className="text-sm text-muted-foreground">
                        The filename (e.g., "madison_square_garden.svg") is parsed to extract the venue name
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">AI Enhancement (Optional)</p>
                      <p className="text-sm text-muted-foreground">
                        AI analyzes SVG content and filename for better venue matching
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Venue Matching</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically matches to existing venues or creates new ones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium">Map Upload</p>
                      <p className="text-sm text-muted-foreground">
                        SVG map is attached to the venue, ready for section configuration
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Naming Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use venue name as filename: <code>madison_square_garden.svg</code></li>
                    <li>• Underscores/dashes become spaces</li>
                    <li>• Suffixes like "map", "seating" are removed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SVG Results */}
          {svgResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Results</CardTitle>
                <div className="flex gap-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    <CheckCircle2 size={14} className="mr-1" />
                    {svgResults.filter(r => r.status === 'matched').length} Matched
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                    <Sparkles size={14} className="mr-1" />
                    {svgResults.filter(r => r.status === 'created').length} Created
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-600">
                    <XCircle size={14} className="mr-1" />
                    {svgResults.filter(r => r.status === 'error').length} Errors
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {svgResults.map((result, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          result.status === 'matched' ? 'bg-green-500/10' :
                          result.status === 'created' ? 'bg-blue-500/10' :
                          'bg-red-500/10'
                        }`}
                      >
                        {result.status === 'matched' ? (
                          <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
                        ) : result.status === 'created' ? (
                          <Sparkles size={18} className="text-blue-600 mt-0.5" />
                        ) : (
                          <XCircle size={18} className="text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{result.filename}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkUpload;
