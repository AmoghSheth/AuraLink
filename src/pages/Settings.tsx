
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, Download, Trash2 } from "lucide-react";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "Sarah Evans",
    email: "sarah@example.com",
    age: "32",
    bio: "Your aura blends alternative rock, spicy food, and eco-consciousness.",
    visibility: "friends",
  });

  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    groups: false,
    gifts: true,
  });

  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "notifications" | "data">("profile");

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting: string) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "privacy", label: "Privacy", icon: Shield },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "data", label: "Data & Account", icon: Download },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                        S
                      </div>
                      <Button variant="outline">Change Photo</Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => handleProfileUpdate("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profile.age}
                          onChange={(e) => handleProfileUpdate("age", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate("email", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                        className="w-full p-3 border rounded-md resize-none h-20 text-sm"
                      />
                    </div>

                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interests & Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {["indie rock", "spicy food", "sustainability", "farm-to-table", "concerts"].map((tag) => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer">
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline">Edit Interests</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { value: "public", label: "Public", desc: "Anyone can see your profile" },
                        { value: "friends", label: "Friends Only", desc: "Only your friends can see your profile" },
                        { value: "private", label: "Private", desc: "Your profile is hidden from searches" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={profile.visibility === option.value}
                            onChange={(e) => handleProfileUpdate("visibility", e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Matching Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked />
                        <span>Allow AI matching suggestions</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked />
                        <span>Show mutual friends</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" />
                        <span>Hide from search results</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "matches", label: "New Matches", desc: "Get notified when you have new match suggestions" },
                    { key: "messages", label: "Messages", desc: "Get notified when you receive new messages" },
                    { key: "groups", label: "Group Activity", desc: "Get notified about activity in your groups" },
                    { key: "gifts", label: "Gift Suggestions", desc: "Get notified about new gift recommendations" },
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{notification.label}</div>
                        <div className="text-sm text-muted-foreground">{notification.desc}</div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(notification.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[notification.key as keyof typeof notifications]
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[notification.key as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Data & Account Settings */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Download a copy of your data including profile information, connections, and activity.
                    </p>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Deactivate Account</h4>
                        <p className="text-muted-foreground text-sm mb-3">
                          Temporarily hide your profile. You can reactivate anytime.
                        </p>
                        <Button variant="outline">Deactivate</Button>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-2 text-destructive">Delete Account</h4>
                        <p className="text-muted-foreground text-sm mb-3">
                          Permanently delete your account and all data. This cannot be undone.
                        </p>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
