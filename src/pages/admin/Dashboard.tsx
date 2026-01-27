import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalEvents: number;
  totalVenues: number;
  totalOrders: number;
  totalRevenue: number;
  activeEvents: number;
  featuredEvents: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalVenues: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeEvents: 0,
    featuredEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch event counts
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: featuredCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);

      // Fetch venue count
      const { count: venueCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

      // Fetch order stats
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'confirmed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalEvents: eventCount || 0,
        totalVenues: venueCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
        activeEvents: activeCount || 0,
        featuredEvents: featuredCount || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-blue-500' },
    { title: 'Active Events', value: stats.activeEvents, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Featured Events', value: stats.featuredEvents, icon: Calendar, color: 'text-amber-500' },
    { title: 'Venues', value: stats.totalVenues, icon: MapPin, color: 'text-purple-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: Ticket, color: 'text-cyan-500' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the admin panel. Here's an overview of your ticketing platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/events/new" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Add Event</span>
          </a>
          <a href="/admin/venues/new" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Add Venue</span>
          </a>
          <a href="/admin/performers/new" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Add Performer</span>
          </a>
          <a href="/admin/inventory" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Manage Tickets</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
