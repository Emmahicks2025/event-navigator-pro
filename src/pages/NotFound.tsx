import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="pt-32 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-6">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto flex items-center gap-2">
              <Home size={18} />
              Go Home
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Search size={18} />
              Search Events
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
