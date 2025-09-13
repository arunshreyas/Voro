import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [profile, setProfile] = useState({
    displayName: "John Doe",
    username: "@johndoe",
    bio: "Creative entrepreneur and idea enthusiast",
    email: "john@example.com",
    avatar: "/placeholder.svg"
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

  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      description: "Profile updated successfully!",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      description: "Notification preferences saved!",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      description: "Privacy settings updated!",
    });
  };

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
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="gap-2">
                    <Upload size={16} />
                    Change Avatar
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
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

                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  Save Profile
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

                <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                  Save Preferences
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

                <Button onClick={handleSavePrivacy} className="w-full md:w-auto">
                  Save Settings
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