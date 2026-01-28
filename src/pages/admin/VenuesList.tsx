import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Map } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBulkSelection } from '@/hooks/useBulkSelection';

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string | null;
  capacity: number | null;
  svg_map: string | null;
}

const VenuesList = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, city, state, capacity, svg_map')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    selectedCount,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggleItem,
    toggleAll,
    clearSelection,
    selectedIds,
  } = useBulkSelection(filteredVenues);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setVenues(venues.filter(v => v.id !== deleteId));
      toast.success('Venue deleted successfully');
    } catch (err) {
      toast.error('Failed to delete venue');
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from('venues')
        .delete()
        .in('id', ids);

      if (error) throw error;
      
      setVenues(venues.filter(v => !selectedIds.has(v.id)));
      toast.success(`${ids.length} venue(s) deleted successfully`);
      clearSelection();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete venues');
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteDialog(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Venues</h2>
          <p className="text-muted-foreground">Manage venues and their seat maps</p>
        </div>
        <Button onClick={() => navigate('/admin/venues/new')}>
          <Plus size={18} className="mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 size={14} className="mr-2" />
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-venues"
                checked={isAllSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all venues"
              />
              <label htmlFor="select-all-venues" className="text-sm text-muted-foreground cursor-pointer">
                Select All ({filteredVenues.length})
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className={isPartiallySelected ? 'opacity-50' : ''}
                  />
                </TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Map Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No venues found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVenues.map((venue) => (
                  <TableRow key={venue.id} className={isSelected(venue.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected(venue.id)}
                        onCheckedChange={() => toggleItem(venue.id)}
                        aria-label={`Select ${venue.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.city}{venue.state ? `, ${venue.state}` : ''}</TableCell>
                    <TableCell>{venue.capacity?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      {venue.svg_map ? (
                        <span className="inline-flex items-center gap-1 text-green-500">
                          <Map size={14} /> Map added
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No map</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/venues/${venue.id}`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/venues/${venue.id}/sections`)}
                          title="Manage sections"
                        >
                          <Map size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(venue.id)}
                        >
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

      {/* Single Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this venue? This will also delete all associated sections and seats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Venue{selectedCount > 1 ? 's' : ''}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected venue{selectedCount > 1 ? 's' : ''}? 
              This will also delete all associated sections and seats. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VenuesList;
