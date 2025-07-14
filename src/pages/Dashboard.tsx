import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Search, Users, Sparkles, Gift, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

// Define a type for the user data we expect
interface UserProfile {
  id: string;
  full_name: string;
  age: number;
  openai_persona: string;
  persona_tags: string[];
  visibility?: "public" | "friends";
}

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, age, openai_persona, persona_tags')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else if (data) {
          setUserProfile({
            id: data.id,
            full_name: data.full_name,
            age: data.age,
            openai_persona: data.openai_persona || "Welcome to AuraLink! Edit your profile to generate your unique persona.",
            persona_tags: data.persona_tags || ["New User"],
          });
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // Mock data for other sections, can be replaced with real data later
  const recentMatches = [
    { id: "2", name: "Holly P", age: 28, tags: ["outdoor", "enthusiast"], visibility: "public" as const, mutualFriends: 2 },
    { id: "3", name: "Alex M", age: 30, tags: ["indie music", "coffee", "books"], visibility: "friends" as const, mutualFriends: 5 },
  ];
  const suggestedGroups = [
    { id: "1", name: "Ramen Lovers", members: 234, category: "Food" },
    { id: "2", name: "Indie Music NYC", members: 456, category: "Music" },
    { id: "3", name: "Sustainable Living", members: 789, category: "Lifestyle" },
  ];

  // Create a user object for the PersonaCard, handling the loading state
  const personaCardUser = userProfile ? {
    id: userProfile.id,
    name: userProfile.full_name,
    age: userProfile.age,
    bio: userProfile.openai_persona,
    tags: userProfile.persona_tags,
    visibility: "friends" as const,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-2xl font-display font-bold text-foreground transition-colors duration-200 group-hover:text-primary tracking-tight-pro">AuraLink</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/search"><Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground"><Search className="w-4 h-4 mr-2" />Search</Button></Link>
              <Link to="/match"><Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-accent hover:text-accent-foreground"><Sparkles className="w-4 h-4 mr-2" />Match</Button></Link>
              <Link to="/groups"><Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-secondary hover:text-secondary-foreground"><Users className="w-4 h-4 mr-2" />Groups</Button></Link>
              <Link to="/gift"><Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105 hover:bg-highlight hover:text-white"><Gift className="w-4 h-4 mr-2" />Gift</Button></Link>
              <Link to="/settings"><Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-105 hover:rotate-90"><Settings className="w-4 h-4" /></Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 animate-slide-in-left tracking-tight-pro">
            Welcome back, {userProfile ? userProfile.full_name.split(' ')[0] : '...'}!
          </h1>
          <p className="text-muted-foreground animate-slide-in-left" style={{animationDelay: '0.1s'}}>Here's what's happening in your network</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your PersonaCard */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your PersonaCard
                  <Button variant="outline" size="sm" asChild className="transition-all duration-200 hover:scale-105 hover:shadow-md">
                    <Link to="/settings">Edit</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ) : personaCardUser ? (
                  <PersonaCard user={personaCardUser} showActions={false} />
                ) : (
                  <p>Could not load your profile. Please try again later.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">Recent Matches<Button variant="outline" size="sm" asChild className="transition-all duration-200 hover:scale-105 hover:shadow-md"><Link to="/match">Find More</Link></Button></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recentMatches.map((match, index) => (
                    <div key={match.id} className="animate-slide-in-left" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                      <PersonaCard user={match} variant="compact" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] animate-slide-in-right" style={{animationDelay: '0.6s'}}><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover:bg-primary-foreground"><Users className="w-4 h-4 text-primary transition-colors duration-200 group-hover:text-primary" /></div><div><p className="text-sm font-medium">Holly P added you as a friend</p><p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">2 hours ago</p></div></div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] animate-slide-in-right group" style={{animationDelay: '0.7s'}}><div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover:bg-accent-foreground"><Sparkles className="w-4 h-4 text-accent transition-colors duration-200 group-hover:text-accent" /></div><div><p className="text-sm font-medium">New group suggestion: "Coffee Connoisseurs"</p><p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">1 day ago</p></div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full transition-all duration-200 hover:scale-105 animate-pulse-glow" asChild><Link to="/match"><Sparkles className="w-4 h-4 mr-2" />Find Someone to Chat</Link></Button>
                <Button variant="outline" className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md" asChild><Link to="/search"><Search className="w-4 h-4 mr-2" />Search People</Link></Button>
                <Button variant="outline" className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md" asChild><Link to="/gift"><Gift className="w-4 h-4 mr-2" />Generate Gift Ideas</Link></Button>
              </CardContent>
            </Card>

            {/* Suggested Groups */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.9s'}}>
              <CardHeader><CardTitle>Groups to Join</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedGroups.map((group, index) => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.02] animate-slide-in-left group" style={{animationDelay: `${1.0 + index * 0.1}s`}}>
                      <div><p className="font-medium text-sm">{group.name}</p><p className="text-xs text-muted-foreground group-hover:text-secondary-foreground/80">{group.members} members</p></div>
                      <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105 hover:shadow-md">Join</Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3 transition-all duration-200 hover:scale-105" asChild><Link to="/groups">View All Groups</Link></Button>
              </CardContent>
            </Card>

            {/* Friends Summary */}
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '1.2s'}}>
              <CardHeader><CardTitle>Your Network</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1 animate-bounce-soft">47</div>
                  <p className="text-sm text-muted-foreground mb-4">Friends connected</p>
                  <Button variant="outline" className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md" asChild><Link to="/friends">View All Friends</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
