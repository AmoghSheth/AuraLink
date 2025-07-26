import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Loader2, 
  PlusCircle, 
  XIcon,
  Database,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Mail,
  MessageSquare,
  Heart,
  Users,
  Globe,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Define the structure of a user profile for this page
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  age: number | string;
  bio: string;
  username: string;
  interests: string[];
  values: string[];
  lifestyle: string[];
  visibility?: "public" | "friends" | "private";
  show_age?: boolean;
  show_email?: boolean;
  allow_friend_requests?: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  friend_requests: boolean;
  messages: boolean;
  matches: boolean;
  weekly_digest: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    friend_requests: true,
    messages: true,
    matches: true,
    weekly_digest: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "notifications" | "data">("profile");

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("You must be logged in.");

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          // Set notification settings from profile or defaults
          setNotificationSettings({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            friend_requests: data.friend_request_notifications ?? true,
            messages: data.message_notifications ?? true,
            matches: data.match_notifications ?? true,
            weekly_digest: data.weekly_digest ?? false,
          });
        }
      } catch (error: any) {
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleNotificationUpdate = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          age: profile.age,
          bio: profile.bio,
          interests: profile.interests,
          values: profile.values,
          lifestyle: profile.lifestyle,
          visibility: profile.visibility,
          show_age: profile.show_age,
          show_email: profile.show_email,
          allow_friend_requests: profile.allow_friend_requests,
          email_notifications: notificationSettings.email_notifications,
          push_notifications: notificationSettings.push_notifications,
          friend_request_notifications: notificationSettings.friend_requests,
          message_notifications: notificationSettings.messages,
          match_notifications: notificationSettings.matches,
          weekly_digest: notificationSettings.weekly_digest,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Settings saved successfully!", { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to save changes: ${error.message}`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!profile) return;

    const toastId = toast.loading("Preparing your data...");
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", profile.id)
        .single();

      if (error) throw error;

      const dataToExport = {
        profile: userData,
        exportedAt: new Date().toISOString(),
        dataTypes: ["profile", "friends", "messages", "preferences"],
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auralink-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!", { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to export data: ${error.message}`, { id: toastId });
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile || deleteConfirmation !== "DELETE") return;

    setIsDeletingAccount(true);
    const toastId = toast.loading("Deleting account...");

    try {
      // First delete user data
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", profile.id);

      if (deleteError) throw deleteError;

      // Then delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.id);
      if (authError) console.warn("Auth deletion failed:", authError);

      toast.success("Account deleted successfully", { id: toastId });
      navigate("/");
    } catch (error: any) {
      toast.error(`Failed to delete account: ${error.message}`, { id: toastId });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Component for editing tags
  const TagEditor = ({ title, tagType }: { title: string, tagType: 'interests' | 'values' | 'lifestyle' }) => {
    const [newTag, setNewTag] = useState("");

    const handleAddTag = () => {
      if (newTag && profile && !profile[tagType].includes(newTag)) {
        handleProfileUpdate(tagType, [...profile[tagType], newTag]);
        setNewTag("");
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      if (profile) {
        handleProfileUpdate(tagType, profile[tagType].filter(tag => tag !== tagToRemove));
      }
    };

    return (
      <div>
        <Label className="text-base font-medium">{title}</Label>
        <div className="flex flex-wrap gap-2 my-2">
          {profile?.[tagType].map((tag) => (
            <Badge key={tag} className="flex items-center gap-1 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors duration-200">
                <XIcon className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder={`Add a new ${title.toLowerCase().slice(0, -1)}...`}
            className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
          />
          <Button variant="outline" size="icon" onClick={handleAddTag} className="hover:scale-105 transition-transform duration-200">
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const navigationItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data & Account", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background purple-glow-container">
      <div className="purple-glow" />
      
      {/* Navigation Header */}
      <nav className="border-b bg-card/30 backdrop-blur-xl glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="AuraLink Logo" 
                className="w-10 h-10 transition-transform duration-300 hover:scale-110" 
              />
              <span className="text-2xl font-display font-bold gradient-text tracking-tight">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-display font-bold mb-2 gradient-text tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="glass-effect hover-lift transition-all duration-300">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setActiveTab(item.id as any)} 
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] ${
                        activeTab === item.id 
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading your settings...</p>
                </div>
              </div>
            ) : !profile ? (
              <Card className="glass-effect">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Could not load profile</h3>
                  <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6 animate-fade-in">
                    <Card className="glass-effect hover-lift transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Profile Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                            <Input 
                              id="name" 
                              value={profile.full_name} 
                              onChange={(e) => handleProfileUpdate("full_name", e.target.value)} 
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                            <Input 
                              id="age" 
                              type="number" 
                              value={profile.age} 
                              onChange={(e) => handleProfileUpdate("age", parseInt(e.target.value))} 
                              className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" 
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                          <Input 
                            id="username" 
                            value={profile.username} 
                            disabled 
                            className="bg-muted/30 cursor-not-allowed" 
                          />
                          <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            disabled 
                            className="bg-muted/30 cursor-not-allowed" 
                          />
                          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                          <textarea 
                            id="bio" 
                            value={profile.bio} 
                            onChange={(e) => handleProfileUpdate("bio", e.target.value)} 
                            className="w-full p-3 border rounded-xl resize-none h-24 text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" 
                            placeholder="Tell people about yourself..."
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect hover-lift transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="gradient-text">Your Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <TagEditor title="Interests" tagType="interests" />
                        <TagEditor title="Values" tagType="values" />
                        <TagEditor title="Lifestyle" tagType="lifestyle" />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div className="space-y-6 animate-fade-in">
                    <Card className="glass-effect hover-lift transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Privacy Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <Label className="text-base font-medium">Profile Visibility</Label>
                          <p className="text-sm text-muted-foreground mb-3">Control who can see your profile</p>
                          <div className="space-y-3">
                            {[
                              { value: "public", label: "Public", desc: "Anyone can see your profile", icon: Globe },
                              { value: "friends", label: "Friends Only", desc: "Only your friends can see your profile", icon: Users },
                              { value: "private", label: "Private", desc: "Only you can see your profile", icon: Lock },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-200">
                                <input
                                  type="radio"
                                  id={option.value}
                                  name="visibility"
                                  value={option.value}
                                  checked={profile.visibility === option.value}
                                  onChange={(e) => handleProfileUpdate("visibility", e.target.value)}
                                  className="w-4 h-4 text-primary"
                                />
                                <option.icon className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <label htmlFor={option.value} className="font-medium cursor-pointer">{option.label}</label>
                                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <Label className="text-base font-medium">Information Visibility</Label>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Show Age</p>
                                <p className="text-xs text-muted-foreground">Display your age on your profile</p>
                              </div>
                            </div>
                            <Switch
                              checked={profile.show_age ?? true}
                              onCheckedChange={(checked) => handleProfileUpdate("show_age", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Show Email</p>
                                <p className="text-xs text-muted-foreground">Display your email to friends</p>
                              </div>
                            </div>
                            <Switch
                              checked={profile.show_email ?? false}
                              onCheckedChange={(checked) => handleProfileUpdate("show_email", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <UserX className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Allow Friend Requests</p>
                                <p className="text-xs text-muted-foreground">Let others send you friend requests</p>
                              </div>
                            </div>
                            <Switch
                              checked={profile.allow_friend_requests ?? true}
                              onCheckedChange={(checked) => handleProfileUpdate("allow_friend_requests", checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6 animate-fade-in">
                    <Card className="glass-effect hover-lift transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          Notification Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <Label className="text-base font-medium">General Notifications</Label>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.email_notifications}
                              onCheckedChange={(checked) => handleNotificationUpdate("email_notifications", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive push notifications in browser</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.push_notifications}
                              onCheckedChange={(checked) => handleNotificationUpdate("push_notifications", checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <Label className="text-base font-medium">Activity Notifications</Label>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Friend Requests</p>
                                <p className="text-xs text-muted-foreground">When someone sends you a friend request</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.friend_requests}
                              onCheckedChange={(checked) => handleNotificationUpdate("friend_requests", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Messages</p>
                                <p className="text-xs text-muted-foreground">When you receive new messages</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.messages}
                              onCheckedChange={(checked) => handleNotificationUpdate("messages", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Heart className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Matches</p>
                                <p className="text-xs text-muted-foreground">When you get new matches</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.matches}
                              onCheckedChange={(checked) => handleNotificationUpdate("matches", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Weekly Digest</p>
                                <p className="text-xs text-muted-foreground">Weekly summary of your activity</p>
                              </div>
                            </div>
                            <Switch
                              checked={notificationSettings.weekly_digest}
                              onCheckedChange={(checked) => handleNotificationUpdate("weekly_digest", checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Data & Account Tab */}
                {activeTab === "data" && (
                  <div className="space-y-6 animate-fade-in">
                    <Card className="glass-effect hover-lift transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Data Export
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          Download a copy of all your data including profile information, friends, messages, and preferences.
                        </p>
                        <Button 
                          onClick={handleExportData} 
                          variant="outline" 
                          className="w-full hover:scale-105 transition-transform duration-200"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export My Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect hover-lift transition-all duration-300 border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                          <Trash2 className="w-5 h-5" />
                          Delete Account
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                          <p className="text-sm text-destructive font-medium mb-2">⚠️ This action cannot be undone</p>
                          <p className="text-sm text-muted-foreground">
                            This will permanently delete your account and all associated data. All your messages, 
                            friends, and profile information will be lost forever.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                            Type "DELETE" to confirm:
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETE"
                            className="bg-background/50 border-destructive/30 focus:border-destructive/50 transition-all duration-200"
                          />
                        </div>
                        
                        <Button 
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                          variant="destructive"
                          className="w-full"
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting Account...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete My Account
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={isSaving} 
                    className="px-8 hover:scale-105 transition-transform duration-200"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save All Changes"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;