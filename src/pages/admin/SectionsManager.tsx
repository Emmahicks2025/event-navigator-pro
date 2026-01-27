import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, MousePointer, ZoomIn, ZoomOut, RotateCcw, Check, X, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Section {
  id: string;
  name: string;
  section_type: string;
  capacity: number;
  row_count: number;
  seats_per_row: number;
  is_general_admission: boolean;
  svg_path: string | null;
  sort_order: number;
}

interface Venue {
  id: string;
  name: string;
  svg_map: string | null;
  map_viewbox: string | null;
}

interface SVGElement {
  id: string;
  tagName: string;
  pathData: string | null;
  transform: string | null;
}

const SectionTypes = [
  { value: 'floor', label: 'Floor' },
  { value: 'lower', label: 'Lower Bowl' },
  { value: 'upper', label: 'Upper Bowl' },
  { value: 'pit', label: 'GA Pit' },
  { value: 'vip', label: 'VIP' },
  { value: 'suite', label: 'Suite' },
  { value: 'standard', label: 'Standard' },
];

interface SectionsManagerProps {
  venueId?: string;
  svgContent?: string;
  embedded?: boolean;
}

const SectionsManager = ({ venueId: propVenueId, svgContent, embedded = false }: SectionsManagerProps = {}) => {
  const { venueId: paramVenueId } = useParams();
  const venueId = propVenueId || paramVenueId;
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'view' | 'assign'>('assign');
  const [zoom, setZoom] = useState(1);
  const [autoDetecting, setAutoDetecting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    section_type: 'standard',
    capacity: '100',
    row_count: '10',
    seats_per_row: '10',
    is_general_admission: false,
    svg_path: '',
    sort_order: '0',
  });

  // Map section names to SVG element IDs
  const sectionElementMap = new Map<string, Section>();
  sections.forEach(section => {
    if (section.svg_path) {
      sectionElementMap.set(section.svg_path, section);
    }
  });

  // If embedded and svgContent provided, use that instead of fetching
  useEffect(() => {
    if (svgContent && venueId) {
      setVenue({ id: venueId, name: '', svg_map: svgContent, map_viewbox: null });
      fetchSections();
    } else if (venueId) {
      fetchVenueAndSections();
    }
  }, [venueId, svgContent]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('venue_id', venueId)
        .order('sort_order');
      
      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  // Setup SVG interactivity after venue loads
  useEffect(() => {
    if (venue?.svg_map && mapContainerRef.current) {
      setupSVGInteractivity();
    }
  }, [venue?.svg_map, sections, mapMode]);

  const fetchVenueAndSections = async () => {
    try {
      const [venueRes, sectionsRes] = await Promise.all([
        supabase.from('venues').select('id, name, svg_map, map_viewbox').eq('id', venueId).single(),
        supabase.from('sections').select('*').eq('venue_id', venueId).order('sort_order'),
      ]);

      if (venueRes.error) throw venueRes.error;
      setVenue(venueRes.data);
      setSections(sectionsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load venue');
      navigate('/admin/venues');
    } finally {
      setLoading(false);
    }
  };

  const setupSVGInteractivity = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // Find all clickable elements (paths, polygons, rects, circles with IDs)
    const clickableElements = svgElement.querySelectorAll('path[id], polygon[id], rect[id], circle[id], g[id]');
    
    clickableElements.forEach((element) => {
      const id = element.getAttribute('id');
      if (!id) return;

      // Check if this element is already assigned to a section
      const assignedSection = sections.find(s => s.svg_path === id);
      
      // Apply styles based on assignment status
      if (assignedSection) {
        element.classList.add('section-assigned');
        element.setAttribute('data-section-id', assignedSection.id);
        element.setAttribute('data-section-name', assignedSection.name);
      } else {
        element.classList.add('section-unassigned');
      }

      // Add cursor style
      (element as HTMLElement).style.cursor = 'pointer';
      
      // Add event listeners
      element.addEventListener('mouseenter', () => {
        setHoveredElementId(id);
        element.classList.add('section-hovered');
      });
      
      element.addEventListener('mouseleave', () => {
        setHoveredElementId(null);
        element.classList.remove('section-hovered');
      });
      
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        handleElementClick(element as SVGElement & Element);
      });
    });

    // Add styles
    const styleId = 'section-manager-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .section-assigned {
        fill: hsl(var(--primary)) !important;
        fill-opacity: 0.6 !important;
        stroke: hsl(var(--primary)) !important;
        stroke-width: 2px !important;
      }
      .section-unassigned {
        fill: hsl(var(--muted-foreground)) !important;
        fill-opacity: 0.3 !important;
        stroke: hsl(var(--border)) !important;
        stroke-width: 1px !important;
      }
      .section-hovered {
        fill-opacity: 0.8 !important;
        stroke-width: 3px !important;
        filter: brightness(1.1);
      }
      .section-selected {
        fill: hsl(var(--success)) !important;
        fill-opacity: 0.7 !important;
        stroke: hsl(var(--success)) !important;
        stroke-width: 3px !important;
      }
    `;
  }, [sections]);

  const handleElementClick = (element: Element) => {
    const id = element.getAttribute('id');
    if (!id) return;

    // Check if already assigned
    const existingSection = sections.find(s => s.svg_path === id);
    
    if (existingSection) {
      // Open edit dialog for existing section
      openEditDialog(existingSection);
    } else {
      // Create new section with this element
      const pathData = element.getAttribute('d') || element.getAttribute('points') || null;
      const transform = element.getAttribute('transform') || null;
      
      setSelectedElement({ id, tagName: element.tagName, pathData, transform });
      setFormData({
        name: id.replace(/_/g, ' ').replace(/-/g, ' '),
        section_type: 'standard',
        capacity: '100',
        row_count: '10',
        seats_per_row: '10',
        is_general_admission: false,
        svg_path: id,
        sort_order: String(sections.length),
      });
      setEditingSection(null);
      setDialogOpen(true);
    }
  };

  const openEditDialog = (section: Section) => {
    setEditingSection(section);
    setSelectedElement(null);
    setFormData({
      name: section.name,
      section_type: section.section_type,
      capacity: String(section.capacity),
      row_count: String(section.row_count),
      seats_per_row: String(section.seats_per_row),
      is_general_admission: section.is_general_admission,
      svg_path: section.svg_path || '',
      sort_order: String(section.sort_order),
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSection(null);
    setSelectedElement(null);
    setFormData({
      name: '',
      section_type: 'standard',
      capacity: '100',
      row_count: '10',
      seats_per_row: '10',
      is_general_admission: false,
      svg_path: '',
      sort_order: String(sections.length),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Section name is required');
      return;
    }

    setSaving(true);
    try {
      const sectionData = {
        venue_id: venueId,
        name: formData.name,
        section_type: formData.section_type,
        capacity: parseInt(formData.capacity) || 100,
        row_count: parseInt(formData.row_count) || 10,
        seats_per_row: parseInt(formData.seats_per_row) || 10,
        is_general_admission: formData.is_general_admission,
        svg_path: formData.svg_path || null,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingSection) {
        const { error } = await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Section updated');
      } else {
        const { error } = await supabase
          .from('sections')
          .insert(sectionData);

        if (error) throw error;
        toast.success('Section created');
      }

      setDialogOpen(false);
      setSelectedElement(null);
      fetchVenueAndSections();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;

    try {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
      setSections(sections.filter(s => s.id !== id));
      toast.success('Section deleted');
    } catch (err) {
      toast.error('Failed to delete section');
    }
  };

  const handleAutoDetect = async () => {
    if (!venue?.svg_map) {
      toast.error('No SVG map found for this venue');
      return;
    }

    setAutoDetecting(true);
    try {
      // Parse SVG locally to extract section IDs - much faster than sending to AI
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(venue.svg_map, 'image/svg+xml');
      
      // Find all interactive sections - look for groups with section data or paths with IDs
      const sectionGroups = svgDoc.querySelectorAll('[id*="section"], [id*="group"], g[data-section-id], path[id]:not([id*="path"]):not([id*="defs"]):not([id*="style"])');
      
      const detectedSections: Array<{
        svg_path: string;
        name: string;
        section_type: string;
        capacity: number;
        is_general_admission: boolean;
      }> = [];

      // Track processed IDs to avoid duplicates
      const processedIds = new Set<string>();

      sectionGroups.forEach((el) => {
        const id = el.getAttribute('id') || el.getAttribute('data-section-id');
        if (!id || processedIds.has(id)) return;
        
        // Skip style, defs, and common SVG element IDs
        if (id.includes('style') || id.includes('defs') || id.includes('svg') || 
            id.includes('parent') || id.includes('static') || id === 'sections') return;
        
        processedIds.add(id);

        // Determine section type based on ID patterns
        let sectionType = 'standard';
        let isGA = false;
        const idLower = id.toLowerCase();
        
        if (idLower.includes('pit') || idLower.includes('ga')) {
          sectionType = 'pit';
          isGA = true;
        } else if (idLower.includes('floor') || /^[a-f][-_]?(section|group)?$/i.test(id) || /^[a-f]$/i.test(id)) {
          sectionType = 'floor';
        } else if (idLower.includes('vip')) {
          sectionType = 'vip';
        } else if (idLower.includes('suite')) {
          sectionType = 'suite';
        } else if (/^1\d{2}/.test(id) || idLower.includes('lower')) {
          sectionType = 'lower';
        } else if (/^[23]\d{2}/.test(id) || idLower.includes('upper')) {
          sectionType = 'upper';
        }

        // Generate friendly name from ID
        let name = id
          .replace(/[-_](section|group)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
          .trim();
        
        // For single letters or short IDs, prefix with "Section"
        if (name.length <= 2) {
          name = `Section ${name}`;
        }

        detectedSections.push({
          svg_path: id.replace(/-group$/, '-section').replace(/_group$/, '_section'),
          name,
          section_type: sectionType,
          capacity: sectionType === 'pit' ? 500 : sectionType === 'floor' ? 200 : 100,
          is_general_admission: isGA,
        });
      });

      // Also look for text labels that might indicate sections (backup method)
      const textElements = svgDoc.querySelectorAll('text[id]');
      textElements.forEach((el) => {
        const id = el.getAttribute('id');
        if (!id || processedIds.has(id)) return;
        
        // Skip common non-section text
        if (id.toLowerCase().includes('stage') || id.toLowerCase().includes('mix')) return;
        
        // Check if there's a corresponding section path
        const sectionPath = svgDoc.querySelector(`#${id.replace(/^t/, '')}-section`) || 
                           svgDoc.querySelector(`#${id}-section`);
        if (sectionPath) {
          const sectionId = sectionPath.getAttribute('id');
          if (sectionId && !processedIds.has(sectionId)) {
            processedIds.add(sectionId);
            
            const textContent = el.textContent?.trim() || id;
            let sectionType = 'standard';
            let isGA = false;
            
            if (/^[A-F]$/i.test(textContent)) {
              sectionType = 'floor';
            } else if (/^1\d{2}/.test(textContent)) {
              sectionType = 'lower';
            } else if (/^[23]\d{2}/.test(textContent)) {
              sectionType = 'upper';
            }

            detectedSections.push({
              svg_path: sectionId,
              name: `Section ${textContent}`,
              section_type: sectionType,
              capacity: sectionType === 'floor' ? 200 : 100,
              is_general_admission: isGA,
            });
          }
        }
      });

      if (detectedSections.length === 0) {
        toast.info('No sections detected in the SVG. Try manual assignment.');
        return;
      }

      // Filter out sections that already exist
      const existingSvgPaths = new Set(sections.map(s => s.svg_path));
      const newSections = detectedSections.filter(s => !existingSvgPaths.has(s.svg_path));

      if (newSections.length === 0) {
        toast.info('All detected sections are already assigned');
        return;
      }

      // Insert new sections
      const sectionsToInsert = newSections.map((s, i) => ({
        venue_id: venueId,
        name: s.name,
        section_type: s.section_type,
        capacity: s.capacity,
        row_count: 10,
        seats_per_row: Math.ceil(s.capacity / 10),
        is_general_admission: s.is_general_admission,
        svg_path: s.svg_path,
        sort_order: i,
      }));

      const { error: insertError } = await supabase
        .from('sections')
        .insert(sectionsToInsert);

      if (insertError) throw insertError;

      toast.success(`Created ${newSections.length} sections from SVG`);
      fetchSections();
    } catch (err: any) {
      console.error('Auto-detect error:', err);
      toast.error(err.message || 'Failed to auto-detect sections');
    } finally {
      setAutoDetecting(false);
    }
  };

  const getHoveredSection = () => {
    if (!hoveredElementId) return null;
    return sections.find(s => s.svg_path === hoveredElementId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/venues')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">Visual Section Mapper</h2>
            <p className="text-muted-foreground">{venue?.name} — Click on map sections to assign them</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              onClick={handleAutoDetect} 
              disabled={autoDetecting || !venue?.svg_map}
            >
              {autoDetecting ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Sparkles size={18} className="mr-2" />
              )}
              {autoDetecting ? 'Detecting...' : 'Auto-detect Sections'}
            </Button>
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus size={18} className="mr-2" />
              Manual Add
            </Button>
          </div>
        </div>
      )}

      {embedded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Section Manager</CardTitle>
                <CardDescription>Manage venue sections and link them to the SVG map</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleAutoDetect} 
                  disabled={autoDetecting || !venue?.svg_map}
                >
                  {autoDetecting ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="mr-2" />
                  )}
                  {autoDetecting ? 'Detecting...' : 'Auto-detect'}
                </Button>
                <Button variant="outline" size="sm" onClick={openCreateDialog}>
                  <Plus size={16} className="mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted-foreground/30 border border-border" />
              <span className="text-muted-foreground">Unassigned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/60 border-2 border-primary" />
              <span className="text-muted-foreground">Assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer size={16} className="text-primary" />
              <span className="text-muted-foreground">Click any section to assign or edit</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Preview - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Venue Map</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
                  <ZoomIn size={16} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                  <RotateCcw size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {venue?.svg_map ? (
              <div className="relative">
                {/* Hover tooltip */}
                {hoveredElementId && (
                  <div className="absolute top-2 left-2 z-10 bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-foreground">
                      {getHoveredSection()?.name || hoveredElementId}
                    </p>
                    {getHoveredSection() ? (
                      <p className="text-sm text-muted-foreground">
                        {getHoveredSection()?.section_type} • Capacity: {getHoveredSection()?.capacity}
                      </p>
                    ) : (
                      <p className="text-sm text-primary">Click to assign this section</p>
                    )}
                  </div>
                )}
                
                <div 
                  ref={mapContainerRef}
                  className="w-full overflow-auto bg-secondary/50 rounded-lg p-4"
                  style={{ 
                    maxHeight: '500px',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div 
                    className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-none"
                    dangerouslySetInnerHTML={{ __html: venue.svg_map }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-80 bg-secondary rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p>No map uploaded</p>
                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/venues/${venueId}`)}>
                  Upload SVG Map
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections List */}
        <Card>
          <CardHeader>
            <CardTitle>Sections ({sections.length})</CardTitle>
            <CardDescription>Assigned venue sections</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[450px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Click on map sections to assign them
                      </TableCell>
                    </TableRow>
                  ) : (
                    sections.map((section) => (
                      <TableRow key={section.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {section.svg_path && (
                              <Check size={14} className="text-success" />
                            )}
                            {section.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {section.section_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(section)}>
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(section.id)}>
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : selectedElement ? 'Assign Section' : 'Add Section'}
            </DialogTitle>
            <DialogDescription>
              {selectedElement 
                ? `Assigning SVG element: ${selectedElement.id}`
                : 'Configure section details and seating layout'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Section Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Section 101, GA PIT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(value) => setFormData({ ...formData, section_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  value={formData.row_count}
                  onChange={(e) => setFormData({ ...formData, row_count: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats_per_row">Seats/Row</Label>
                <Input
                  id="seats_per_row"
                  type="number"
                  value={formData.seats_per_row}
                  onChange={(e) => setFormData({ ...formData, seats_per_row: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ga">General Admission</Label>
                <p className="text-sm text-muted-foreground">No assigned seats</p>
              </div>
              <Switch
                id="ga"
                checked={formData.is_general_admission}
                onCheckedChange={(checked) => setFormData({ ...formData, is_general_admission: checked })}
              />
            </div>

            {formData.svg_path && (
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm font-medium text-foreground">Linked SVG Element</p>
                <p className="text-xs text-muted-foreground font-mono">{formData.svg_path}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setSelectedElement(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Assign Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionsManager;
