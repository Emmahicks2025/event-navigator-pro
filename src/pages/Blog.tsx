import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";

const featuredPost = {
  title: "The Ultimate Guide to Buying Concert Tickets in 2026",
  excerpt: "From presale codes to verified resale, learn everything you need to know about securing tickets to your favorite artists' shows this year.",
  image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
  category: "Guides",
  date: "January 25, 2026",
  readTime: "8 min read",
  author: "Emily Rodriguez"
};

const blogPosts = [
  {
    title: "Top 10 Stadium Concerts to Watch This Summer",
    excerpt: "From Taylor Swift to The Weeknd, these are the must-see stadium tours hitting the road in 2026.",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop",
    category: "Music",
    date: "January 22, 2026",
    readTime: "5 min read"
  },
  {
    title: "NBA Playoff Ticket Buying Guide",
    excerpt: "Everything you need to know about securing tickets to the 2026 NBA Playoffs.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop",
    category: "Sports",
    date: "January 20, 2026",
    readTime: "6 min read"
  },
  {
    title: "Broadway's Hottest Shows of 2026",
    excerpt: "From new premieres to beloved revivals, here are the theater productions everyone's talking about.",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=250&fit=crop",
    category: "Theater",
    date: "January 18, 2026",
    readTime: "4 min read"
  },
  {
    title: "How to Spot Fake Tickets: A Buyer's Guide",
    excerpt: "Protect yourself from scams with our comprehensive guide to verifying ticket authenticity.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    category: "Tips",
    date: "January 15, 2026",
    readTime: "7 min read"
  },
  {
    title: "Best Seats in the House: Arena Seating Guide",
    excerpt: "Learn where to sit for the best views at concerts, sports games, and theater productions.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=250&fit=crop",
    category: "Guides",
    date: "January 12, 2026",
    readTime: "6 min read"
  },
  {
    title: "Comedy Tour Roundup: Laughs Coming Your Way",
    excerpt: "The biggest names in comedy are hitting the road. Here's who to watch for in 2026.",
    image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=250&fit=crop",
    category: "Comedy",
    date: "January 10, 2026",
    readTime: "4 min read"
  }
];

const categories = ["All", "Music", "Sports", "Theater", "Comedy", "Guides", "Tips"];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              GoTickets Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Your source for event news, ticket tips, and entertainment insights.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button 
                key={category} 
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <article className="grid md:grid-cols-2 gap-8 p-6 bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video md:aspect-auto rounded-lg overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 hover:text-primary cursor-pointer">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {featuredPost.readTime}
                  </span>
                </div>
                <Button className="w-fit flex items-center gap-2">
                  Read Article
                  <ArrowRight size={16} />
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article 
                key={index} 
                className="bg-background rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary cursor-pointer line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">Load More Articles</Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for weekly updates on events, exclusive presale codes, and insider tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
