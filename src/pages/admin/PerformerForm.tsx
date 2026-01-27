import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCreatePerformer, useUpdatePerformer } from '@/hooks/usePerformers';
import { useCategories } from '@/hooks/useCategories';
import { useQuery } from '@tanstack/react-query';

const PerformerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    description: '',
    category_id: '',
  });

  const { data: categories = [] } = useCategories();
  const createPerformer = useCreatePerformer();
  const updatePerformer = useUpdatePerformer();

  // Fetch existing performer if editing
  const { data: performer, isLoading } = useQuery({
    queryKey: ['performer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('performers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch categories from database
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['db-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (performer) {
      setFormData({
        name: performer.name || '',
        slug: performer.slug || '',
        image_url: performer.image_url || '',
        description: performer.description || '',
        category_id: performer.category_id || '',
      });
    }
  }, [performer]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a performer name');
      return;
    }

    try {
      if (isEditing) {
        await updatePerformer.mutateAsync({
          id,
          ...formData,
          category_id: formData.category_id || null,
        });
        toast.success('Performer updated successfully');
      } else {
        await createPerformer.mutateAsync({
          ...formData,
          category_id: formData.category_id || null,
        });
        toast.success('Performer created successfully');
      }
      navigate('/admin/performers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save performer');
    }
  };

  const isSaving = createPerformer.isPending || updatePerformer.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/performers')}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Performer' : 'Add Performer'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update performer details' : 'Create a new performer'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border border-border p-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter performer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="performer-slug"
            />
            <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {dbCategories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter performer description"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/performers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            {isEditing ? 'Update' : 'Create'} Performer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PerformerForm;
