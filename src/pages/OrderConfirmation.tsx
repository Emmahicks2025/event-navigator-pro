import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const orderNumber = `GT${Date.now().toString().slice(-8)}`;

  return (
    <main className="pt-32 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 text-center max-w-lg">
        <div className="animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle size={48} className="text-success" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your tickets are on their way
          </p>

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold text-primary">{orderNumber}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="p-2 rounded-full bg-primary/10">
                <Mail size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We've sent your tickets and receipt
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="p-2 rounded-full bg-primary/10">
                <Download size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Download tickets</p>
                <p className="text-sm text-muted-foreground">
                  Available in your account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Add to calendar</p>
                <p className="text-sm text-muted-foreground">
                  Never miss your event
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Browse More Events
              </Button>
            </Link>
            <Link to="/account">
              <Button className="ticket-button w-full sm:w-auto">
                View My Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
