import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

const SectionTypes = [
  { value: 'floor', label: 'Floor' },
  { value: 'lower', label: 'Lower Bowl' },
  { value: 'upper', label: 'Upper Bowl' },
  { value: 'pit', label: 'GA Pit' },
  { value: 'vip', label: 'VIP' },
  { value: 'suite', label: 'Suite' },
];

const SectionsManager = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (venueId) {
      fetchVenueAndSections();
    }
  }, [venueId]);

  const fetchVenueAndSections = async () => {
    try {
      const [venueRes, sectionsRes] = await Promise.all([
        supabase.from('venues').select('id, name, svg_map').eq('id', venueId).single(),
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

  const openCreateDialog = () => {
    setEditingSection(null);
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

  const openEditDialog = (section: Section) => {
    setEditingSection(section);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/venues')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Manage Sections</h2>
          <p className="text-muted-foreground">{venue?.name}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus size={18} className="mr-2" />
          Add Section
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sections Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sections ({sections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No sections yet. Add your first section.
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {section.section_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{section.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(section)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)}>
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Map Preview</CardTitle>
            <CardDescription>
              Venue seating map (edit venue to update)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venue?.svg_map ? (
              <div 
                className="w-full h-80 bg-secondary rounded-lg overflow-hidden p-4"
                dangerouslySetInnerHTML={{ __html: venue.svg_map }}
              />
            ) : (
              <div className="w-full h-80 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
                No map uploaded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
            <DialogDescription>
              Configure section details and seating layout
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
                  placeholder="e.g., 101, GA PIT"
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

            <div className="space-y-2">
              <Label htmlFor="svg_path">SVG Path (from venue map)</Label>
              <Textarea
                id="svg_path"
                value={formData.svg_path}
                onChange={(e) => setFormData({ ...formData, svg_path: e.target.value })}
                placeholder="d=&quot;M 100 100 L 200 100...&quot;"
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionsManager;
