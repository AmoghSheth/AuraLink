import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, Download, Trash2, Loader2, PlusCircle, XIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Define the structure of a user profile for this page
interface UserProfile {
  full_name: string;
  email: string;
  age: number | string;
  bio: string;
  username: string;
  interests: string[];
  values: string[];
  lifestyle: string[];
}

const Settings = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          .select("full_name, email, age, bio, username, interests, values, lifestyle")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
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
        })
        .eq("username", profile.username);

      if (error) throw error;

      toast.success("Profile updated successfully!", { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to save changes: ${error.message}`, { id: toastId });
    } finally {
      setIsSaving(false);
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
            <Badge key={tag} className="flex items-center gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="rounded-full hover:bg-destructive/20">
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
          />
          <Button variant="outline" size="icon" onClick={handleAddTag}>
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background purple-glow-container">
      <div className="purple-glow" />
      <nav className="border-b bg-card/30 backdrop-blur-xl glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard"><Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Link to="/dashboard" className="flex items-center gap-2"><img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10 transition-transform duration-300 hover:scale-110" /><span className="text-xl font-bold gradient-text">AuraLink</span></Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="glass-effect"><CardContent className="p-4"><nav className="space-y-2">
              {[{ id: "profile", label: "Profile", icon: User }, { id: "privacy", label: "Privacy", icon: Shield }].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 hover:scale-105 ${activeTab === item.id ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent/50"}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </button>
              ))}
            </nav></CardContent></Card>
          </div>

          <div className="lg:col-span-3 space-y-6 stagger-animation">
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : !profile ? <p>Could not load profile.</p> :
            <>
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <Card className="glass-effect">
                    <CardHeader><CardTitle className="gradient-text">Profile Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={profile.full_name} onChange={(e) => handleProfileUpdate("full_name", e.target.value)} className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" />
                        </div>
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <Input id="age" type="number" value={profile.age} onChange={(e) => handleProfileUpdate("age", e.target.value)} className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile.email} disabled className="bg-muted/30" />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <textarea id="bio" value={profile.bio} onChange={(e) => handleProfileUpdate("bio", e.target.value)} className="w-full p-3 border rounded-md resize-none h-20 text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader><CardTitle className="gradient-text">Your Tags</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <TagEditor title="Interests" tagType="interests" />
                      <TagEditor title="Values" tagType="values" />
                      <TagEditor title="Lifestyle" tagType="lifestyle" />
                    </CardContent>
                  </Card>

                  <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full hover:scale-105 transition-transform duration-200">
                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save All Changes"}
                  </Button>
                </div>
              )}
            </>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;