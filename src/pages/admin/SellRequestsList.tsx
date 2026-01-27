import { useState } from 'react';
import { Eye, Mail, Phone, Check, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const SellRequestsList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['sell-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('sell_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('sell_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell-requests'] });
      toast.success('Status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock size={12} /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground gap-1"><Check size={12} /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><X size={12} /> Rejected</Badge>;
      case 'listed':
        return <Badge className="bg-primary text-primary-foreground">Listed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sell Requests</h1>
          <p className="text-muted-foreground">
            Review and manage ticket selling requests
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount} pending</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-foreground">{requests.length}</p>
          <p className="text-sm text-muted-foreground">Total Requests</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-success">
            {requests.filter((r: any) => r.status === 'approved').length}
          </p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-2xl font-bold text-primary">
            ${requests.reduce((sum: number, r: any) => sum + (Number(r.asking_price) * r.quantity), 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(10)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No sell requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request: any) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {request.event_name}
                  </TableCell>
                  <TableCell>{format(new Date(request.event_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="max-w-[100px] truncate">{request.city}</TableCell>
                  <TableCell>{request.section}</TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell className="font-medium">${Number(request.asking_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[100px]">{request.contact_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(request.created_at), 'MMM d')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sell Request Details</DialogTitle>
            <DialogDescription>
              Review and manage this ticket selling request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Event Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Event Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event:</span>
                    <p className="font-medium">{selectedRequest.event_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{format(new Date(selectedRequest.event_date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Venue:</span>
                    <p className="font-medium">{selectedRequest.venue_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>
                    <p className="font-medium">{selectedRequest.city}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Ticket Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Section:</span>
                    <p className="font-medium">{selectedRequest.section}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Row:</span>
                    <p className="font-medium">{selectedRequest.row_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seats:</span>
                    <p className="font-medium">{selectedRequest.seat_numbers || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{selectedRequest.quantity} tickets</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price Each:</span>
                    <p className="font-medium text-primary">${Number(selectedRequest.asking_price).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Value:</span>
                    <p className="font-medium text-primary">
                      ${(Number(selectedRequest.asking_price) * selectedRequest.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedRequest.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <a href={`mailto:${selectedRequest.contact_email}`} className="text-primary hover:underline">
                      {selectedRequest.contact_email}
                    </a>
                  </div>
                  {selectedRequest.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-muted-foreground" />
                      <a href={`tel:${selectedRequest.contact_phone}`} className="text-primary hover:underline">
                        {selectedRequest.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="flex gap-2">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedRequest.id, status: 'rejected' });
                          setSelectedRequest({ ...selectedRequest, status: 'rejected' });
                        }}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        <span className="ml-1">Reject</span>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedRequest.id, status: 'approved' });
                          setSelectedRequest({ ...selectedRequest, status: 'approved' });
                        }}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        <span className="ml-1">Approve</span>
                      </Button>
                    </>
                  )}
                  {selectedRequest.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateStatus.mutate({ id: selectedRequest.id, status: 'listed' });
                        setSelectedRequest({ ...selectedRequest, status: 'listed' });
                      }}
                      disabled={updateStatus.isPending}
                    >
                      Mark as Listed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellRequestsList;