import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Lightbulb, 
  Plus,
  Settings, 
  LogOut, 
  Menu
} from "lucide-react";

export const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  const menuItems = [
    { icon: Home, label: "Categories", href: "/categories" },
    { icon: Lightbulb, label: "Ideas", href: "/ideas" },
    { icon: Plus, label: "Create", href: "/create" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div 
      className="fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed State - Always Visible */}
      <div className={`h-full bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300 ${
        isHovered ? 'w-64' : 'w-16'
      }`}>
        
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Menu className="w-4 h-4 text-white" />
            </div>
            <div className={`ml-3 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
                Voro
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* User Section - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          {/* User Info */}
          <div className="flex items-center mb-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                {user?.email ? getUserInitials(user.email) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className={`ml-3 transition-all duration-300 min-w-0 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <p className="font-medium text-foreground truncate text-sm">
                {user?.user_metadata?.full_name || (user?.email ? getUserDisplayName(user.email) : "User")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-destructive p-3"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-3 transition-all duration-300 whitespace-nowrap ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              Sign Out
            </span>
          </Button>
        </div>
      </div>

      {/* Hover Trigger Area - Invisible area to make hover easier */}
      <div className="absolute left-0 top-0 w-2 h-full" />
    </div>
  );
};