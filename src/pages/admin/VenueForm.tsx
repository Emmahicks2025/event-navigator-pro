import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    capacity: '',
    svg_map: '',
    map_viewbox: '',
  });

  useEffect(() => {
    if (isEditing) {
      fetchVenue();
    }
  }, [id]);

  const fetchVenue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'USA',
        capacity: data.capacity?.toString() || '',
        svg_map: data.svg_map || '',
        map_viewbox: data.map_viewbox || '',
      });
    } catch (err) {
      console.error('Error fetching venue:', err);
      toast.error('Failed to load venue');
      navigate('/admin/venues');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg')) {
      toast.error('Please upload an SVG file');
      return;
    }

    try {
      const text = await file.text();
      
      // Extract viewBox from SVG
      const viewBoxMatch = text.match(/viewBox=["']([^"']+)["']/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '';

      setFormData({
        ...formData,
        svg_map: text,
        map_viewbox: viewBox,
      });

      toast.success('SVG map uploaded successfully');
    } catch (err) {
      console.error('Error reading file:', err);
      toast.error('Failed to read SVG file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const venueData = {
        name: formData.name,
        address: formData.address || null,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        svg_map: formData.svg_map || null,
        map_viewbox: formData.map_viewbox || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Venue updated successfully');
      } else {
        const { error } = await supabase
          .from('venues')
          .insert(venueData);

        if (error) throw error;
        toast.success('Venue created successfully');
      }

      navigate('/admin/venues');
    } catch (err: any) {
      console.error('Error saving venue:', err);
      toast.error(err.message || 'Failed to save venue');
    } finally {
      setSaving(false);
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
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Venue' : 'Create Venue'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Update venue details and map' : 'Add a new venue with seat map'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Madison Square Garden"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Total capacity"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SVG Map */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Map (SVG)</CardTitle>
              <CardDescription>
                Upload an SVG file of the venue seating chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="svg_upload">Upload SVG Map</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="svg_upload"
                    type="file"
                    accept=".svg"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                </div>
              </div>

              {formData.svg_map && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div 
                    className="w-full h-64 bg-secondary rounded-lg overflow-hidden p-4"
                    dangerouslySetInnerHTML={{ __html: formData.svg_map }}
                    style={{
                      maxHeight: '300px',
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    ViewBox: {formData.map_viewbox || 'Not detected'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="svg_raw">Or Paste SVG Code</Label>
                <Textarea
                  id="svg_raw"
                  value={formData.svg_map}
                  onChange={(e) => {
                    const text = e.target.value;
                    const viewBoxMatch = text.match(/viewBox=["']([^"']+)["']/);
                    setFormData({
                      ...formData,
                      svg_map: text,
                      map_viewbox: viewBoxMatch ? viewBoxMatch[1] : '',
                    });
                  }}
                  placeholder="<svg>...</svg>"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditing ? 'Update Venue' : 'Create Venue'}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/venues')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;
