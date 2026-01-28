import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, FileArchive, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportResults {
  venuesCreated: number;
  venuesUpdated: number;
  eventsCreated: number;
  performersCreated: number;
  mapsMatched: number;
  errors: string[];
}

export default function EventsImport() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [venueMapFiles, setVenueMapFiles] = useState<string[]>([]);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setResults(null);
    }
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setZipFile(file);
      setResults(null);
    }
  };

  const parseExcelToJson = async (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!excelFile || !zipFile) {
      toast.error('Please upload both the Excel file and the ZIP file');
      return;
    }

    setIsImporting(true);
    setProgress(10);

    try {
      // Parse Excel file
      setProgress(20);
      const eventsData = await parseExcelToJson(excelFile);
      setProgress(40);

      // Create FormData for the edge function
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('eventsData', JSON.stringify(eventsData));

      setProgress(60);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('import-events-with-maps', {
        body: formData,
      });

      setProgress(90);

      if (error) {
        throw new Error(error.message);
      }

      setResults(data.results);
      setVenueMapFiles(data.venueMapFileNames || []);
      setProgress(100);

      toast.success(`Import complete! Created ${data.results.eventsCreated} events and matched ${data.results.mapsMatched} venue maps.`);
    } catch (err) {
      console.error('Import error:', err);
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Events with Venue Maps</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Excel Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Events Excel File
            </CardTitle>
            <CardDescription>
              Upload the Excel file containing event data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => excelInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                {excelFile ? (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {excelFile.name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Click to upload Excel file
                  </span>
                )}
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* ZIP Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5" />
              Venue Maps ZIP File
            </CardTitle>
            <CardDescription>
              Upload the ZIP file containing SVG venue maps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              onChange={handleZipUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => zipInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                {zipFile ? (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {zipFile.name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Click to upload ZIP file
                  </span>
                )}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Button */}
      <Button
        onClick={handleImport}
        disabled={!excelFile || !zipFile || isImporting}
        className="w-full mb-6"
        size="lg"
      >
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Start Import
          </>
        )}
      </Button>

      {/* Progress Bar */}
      {isImporting && (
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Processing... {progress}%
          </p>
        </div>
      )}

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{results.eventsCreated}</p>
                <p className="text-sm text-muted-foreground">Events Created</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{results.venuesCreated}</p>
                <p className="text-sm text-muted-foreground">Venues Created</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{results.venuesUpdated}</p>
                <p className="text-sm text-muted-foreground">Venues Updated</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{results.performersCreated}</p>
                <p className="text-sm text-muted-foreground">Performers Created</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{results.mapsMatched}</p>
                <p className="text-sm text-muted-foreground">Maps Matched</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">{results.errors.length} errors occurred:</p>
                  <ul className="list-disc list-inside text-sm max-h-40 overflow-y-auto">
                    {results.errors.slice(0, 20).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {results.errors.length > 20 && (
                      <li>...and {results.errors.length - 20} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {venueMapFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Venue map files found in ZIP ({venueMapFiles.length}):</p>
                <div className="max-h-40 overflow-y-auto bg-muted p-3 rounded-lg">
                  <ul className="text-xs space-y-1">
                    {venueMapFiles.map((file, i) => (
                      <li key={i} className="text-muted-foreground">{file}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
