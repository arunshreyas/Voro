import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user, profile: userProfile, updateProfile, uploadAvatar } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "/placeholder.svg"
  });

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    sparks: false,
    email: true
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    allowMessages: true
  });

  const [loading, setLoading] = useState({
    profile: false,
    avatar: false,
    notifications: false,
    privacy: false
  });

  // Initialize profile data from user and profile context
  useEffect(() => {
    if (user && userProfile) {
      setProfile({
        full_name: userProfile.full_name || user.user_metadata?.full_name || "",
        username: userProfile.username || `@${user.email?.split('@')[0]}` || "",
        bio: userProfile.bio || "",
        avatar_url: userProfile.avatar_url || user.user_metadata?.avatar_url || "/placeholder.svg"
      });
    } else if (user) {
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        username: `@${user.email?.split('@')[0]}` || "",
        bio: "",
        avatar_url: user.user_metadata?.avatar_url || "/placeholder.svg"
      });
    }
  }, [user, userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const { error } = await updateProfile({
        full_name: profile.full_name,
        username: profile.username.replace('@', ''),
        bio: profile.bio,
        avatar_url: profile.avatar_url
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, avatar: true }));

    try {
      const { url, error } = await uploadAvatar(file);
      
      if (error) {
        throw error;
      }

      if (url) {
        setProfile(prev => ({ ...prev, avatar_url: url }));
        toast({
          title: "Success!",
          description: "Avatar updated successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  const handleSaveNotifications = () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    
    // Simulate API call
    setTimeout(() => {
      toast({
        description: "Notification preferences saved!",
      });
      setLoading(prev => ({ ...prev, notifications: false }));
    }, 1000);
  };

  const handleSavePrivacy = () => {
    setLoading(prev => ({ ...prev, privacy: true }));
    
    // Simulate API call
    setTimeout(() => {
      toast({
        description: "Privacy settings updated!",
      });
      setLoading(prev => ({ ...prev, privacy: false }));
    }, 1000);
  };

  // Show loading state while profile is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-background pl-16">
        <Navbar />
        <main className="container mx-auto px-4 py-8 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin mx-auto mb-4 text-accent" />
                <p className="text-muted-foreground">Loading settings...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-16">
      <Navbar />
      <main className="container mx-auto px-4 py-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 form-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-primary">
                <SettingsIcon size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your account preferences and privacy settings
            </p>
          </div>

          <div className="grid gap-6 form-slide-up">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>{profile.full_name.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      disabled={loading.avatar}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      {loading.avatar ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      {loading.avatar ? "Uploading..." : "Change Avatar"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full md:w-auto"
                  disabled={loading.profile}
                >
                  {loading.profile ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="likes">Likes</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone likes your posts</p>
                  </div>
                  <Switch
                    id="likes"
                    checked={notifications.likes}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, likes: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                  </div>
                  <Switch
                    id="comments"
                    checked={notifications.comments}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, comments: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="follows">New Followers</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                  </div>
                  <Switch
                    id="follows"
                    checked={notifications.follows}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, follows: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sparks">Voro Sparks</Label>
                    <p className="text-sm text-muted-foreground">Get notified about trending Voro Sparks</p>
                  </div>
                  <Switch
                    id="sparks"
                    checked={notifications.sparks}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sparks: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <Button 
                  onClick={handleSaveNotifications} 
                  className="w-full md:w-auto"
                  disabled={loading.notifications}
                >
                  {loading.notifications ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control who can see your content and contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profilePublic">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                  </div>
                  <Switch
                    id="profilePublic"
                    checked={privacy.profilePublic}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profilePublic: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEmail">Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to send you direct messages</p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                  />
                </div>

                <Button 
                  onClick={handleSavePrivacy} 
                  className="w-full md:w-auto"
                  disabled={loading.privacy}
                >
                  {loading.privacy ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how Voro looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-background border-2 border-border rounded"></div>
                    <span className="text-sm">Light</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <div className="w-8 h-8 bg-foreground rounded"></div>
                    <span className="text-sm">Dark</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;