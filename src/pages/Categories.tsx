import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Utensils, 
  Car, 
  Home, 
  Heart, 
  Palette, 
  Laptop, 
  Building2,
  ChevronRight 
} from "lucide-react";

const businessCategories = [
  { title: "Retail & E-commerce", icon: ShoppingCart, url: "/category/Retail & E-commerce" },
  { title: "Food & Beverage", icon: Utensils, url: "/category/Food & Beverage" },
  { title: "Automotive", icon: Car, url: "/category/Automotive" },
  { title: "Real Estate", icon: Home, url: "/category/Real Estate" },
  { title: "Healthcare", icon: Heart, url: "/category/Healthcare" },
  { title: "Creative Services", icon: Palette, url: "/category/Creative Services" },
  { title: "Technology", icon: Laptop, url: "/category/Technology" },
  { title: "Construction", icon: Building2, url: "/category/Construction" },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-background pl-16">
      <Navbar />
      <main className="container mx-auto px-4 py-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Explore Business Categories
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose from our comprehensive list of business categories
            </p>
          </div>

          <div className="space-y-4">
            {businessCategories.map((category) => (
              <Link
                key={category.title}
                to={category.url}
                className="block"
              >
                <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <category.icon className="w-6 h-6 text-accent" />
                    </div>
                    <span className="font-medium text-foreground text-lg">
                      {category.title}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-accent mb-2">8</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-accent mb-2">120+</div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-accent mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Growth Areas</div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-accent mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;