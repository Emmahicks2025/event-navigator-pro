import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Ticket, DollarSign, User, Mail, Phone, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const cities = [
  'Atlanta', 'Boston', 'Chicago', 'Dallas', 'Denver', 'Detroit', 'Houston',
  'Las Vegas', 'Los Angeles', 'Miami', 'New York City', 'Philadelphia',
  'Phoenix', 'San Francisco', 'Seattle', 'Tampa Bay', 'Toronto', 'Washington DC', 'Other'
];

const sellFormSchema = z.object({
  eventName: z.string().trim().min(2, 'Event name is required').max(200, 'Event name too long'),
  eventDate: z.date({ required_error: 'Event date is required' }),
  venueName: z.string().trim().min(2, 'Venue name is required').max(200, 'Venue name too long'),
  city: z.string().min(1, 'City is required'),
  section: z.string().trim().min(1, 'Section is required').max(50, 'Section name too long'),
  rowName: z.string().trim().max(20, 'Row name too long').optional(),
  seatNumbers: z.string().trim().max(50, 'Seat numbers too long').optional(),
  quantity: z.coerce.number().min(1, 'At least 1 ticket').max(100, 'Maximum 100 tickets'),
  askingPrice: z.coerce.number().min(1, 'Price must be at least $1').max(100000, 'Price too high'),
  contactName: z.string().trim().min(2, 'Name is required').max(100, 'Name too long'),
  contactEmail: z.string().trim().email('Valid email required').max(255, 'Email too long'),
  contactPhone: z.string().trim().max(20, 'Phone number too long').optional(),
  notes: z.string().trim().max(1000, 'Notes too long').optional(),
});

type SellFormValues = z.infer<typeof sellFormSchema>;

const SellTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      eventName: '',
      venueName: '',
      city: '',
      section: '',
      rowName: '',
      seatNumbers: '',
      quantity: 1,
      askingPrice: 0,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
  });

  const onSubmit = async (data: SellFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('sell_requests').insert({
        user_id: user?.id || null,
        event_name: data.eventName,
        event_date: format(data.eventDate, 'yyyy-MM-dd'),
        venue_name: data.venueName,
        city: data.city,
        section: data.section,
        row_name: data.rowName || null,
        seat_numbers: data.seatNumbers || null,
        quantity: data.quantity,
        asking_price: data.askingPrice,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        notes: data.notes || null,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Your ticket listing request has been submitted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="pt-28 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-xl">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-success" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your submission. Our team will review your listing and get back to you within 24-48 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => { setIsSuccess(false); form.reset(); }}>
                Submit Another
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
            <Ticket className="text-primary" size={32} />
            Sell Your Tickets
          </h1>
          <p className="text-muted-foreground mt-2">
            List your tickets for sale on our secure marketplace
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Event Information
                </h2>

                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Taylor Swift - Eras Tour" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Madison Square Garden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ticket Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Ticket Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 101, Floor A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rowName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Row</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A, 12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seatNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seat Numbers</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1-4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Tickets *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="askingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asking Price Per Ticket ($) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input type="number" min="1" step="0.01" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Contact Information
                </h2>

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="John Doe" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input type="email" placeholder="you@example.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input type="tel" placeholder="(555) 123-4567" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about your tickets..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include any special details about your tickets (e.g., VIP access, parking included)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-border">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Ticket size={18} className="mr-2" />
                      Submit Listing Request
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  By submitting, you agree to our terms of service. Our team will review your listing and contact you within 24-48 hours.
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
};

export default SellTickets;