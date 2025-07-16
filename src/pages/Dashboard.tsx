import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Search, Users, Sparkles, Gift, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

// Define types for the data we expect
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  age: number;
  openai_persona: string;
  interests: string[];
  values: string[];
  lifestyle: string[];
}

interface Activity {
  id: number;
  created_at: string;
  type: string;
  actor_username: string;
  target_username: string;
  metadata: {
    actor_full_name: string;
    target_full_name: string;
  };
}

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadingFeed(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        } else if (profileData) {
          setUserProfile(profileData);
        }
        setLoading(false);

        // Fetch activity feed
        const { data: activityData, error: activityError } = await supabase
          .from('activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (activityError) {
          console.error("Error fetching activity feed:", activityError);
        } else {
          setActivityFeed(activityData || []);
        }
        setLoadingFeed(false);
      } else {
        setLoading(false);
        setLoadingFeed(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data for other sections
  const recentMatches = [
    { id: "2", name: "Holly P", age: 28, tags: ["outdoor", "enthusiast"], visibility: "public" as const, mutualFriends: 2 },
    { id: "3", name: "Alex M", age: 30, tags: ["indie music", "coffee", "books"], visibility: "friends" as const, mutualFriends: 5 },
  ];
  const suggestedGroups = [
    { id: "1", name: "Ramen Lovers", members: 234, category: "Food" },
    { id: "2", name: "Indie Music NYC", members: 456, category: "Music" },
    { id: "3", name: "Sustainable Living", members: 789, category: "Lifestyle" },
  ];

  // Create a user object for the PersonaCard
  const personaCardUser = userProfile ? {
    id: userProfile.id,
    username: userProfile.username,
    full_name: userProfile.full_name,
    age: userProfile.age,
    bio: userProfile.openai_persona,
    interests: userProfile.interests,
    values: userProfile.values,
    lifestyle: userProfile.lifestyle,
  } : null;

  const renderActivity = (activity: Activity) => {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
    switch (activity.type) {
      case 'new_friend':
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover:bg-primary-foreground">
              <Users className="w-4 h-4 text-primary transition-colors duration-200 group-hover:text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <strong>{activity.metadata.actor_full_name || activity.actor_username}</strong> became friends with <strong>{activity.metadata.target_full_name || activity.target_username}</strong>.
              </p>
              <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">{timeAgo}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" />
              <span className="text-2xl font-display font-bold text-foreground">AuraLink</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/search"><Button variant="ghost" size="sm"><Search className="w-4 h-4 mr-2" />Search</Button></Link>
              <Link to="/friends"><Button variant="ghost" size="sm"><Users className="w-4 h-4 mr-2" />Friends</Button></Link>
              <Link to="/gift"><Button variant="ghost" size="sm"><Gift className="w-4 h-4 mr-2" />Gift</Button></Link>
              <Link to="/settings"><Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back, {loading ? '...' : userProfile?.full_name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your PersonaCard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your PersonaCard
                  <Button variant="outline" size="sm" asChild><Link to="/settings">Edit</Link></Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : personaCardUser ? (
                  <PersonaCard user={personaCardUser} showActions={false} />
                ) : (
                  <p>Could not load your profile. Please try again later.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">Recent Matches<Button variant="outline" size="sm" asChild><Link to="/match">Find More</Link></Button></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recentMatches.map((match) => (
                    <div key={match.id}>
                      <PersonaCard user={match} variant="compact" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
              <CardContent>
                {loadingFeed ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : activityFeed.length > 0 ? (
                  <div className="space-y-4">
                    {activityFeed.map(renderActivity)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild><Link to="/match"><Sparkles className="w-4 h-4 mr-2" />Find Someone to Chat</Link></Button>
                <Button variant="outline" className="w-full" asChild><Link to="/search"><Search className="w-4 h-4 mr-2" />Search People</Link></Button>
                <Button variant="outline" className="w-full" asChild><Link to="/gift"><Gift className="w-4 h-4 mr-2" />Generate Gift Ideas</Link></Button>
              </CardContent>
            </Card>

            {/* Suggested Groups */}
            <Card>
              <CardHeader><CardTitle>Groups to Join</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div><p className="font-medium text-sm">{group.name}</p><p className="text-xs text-muted-foreground">{group.members} members</p></div>
                      <Button size="sm" variant="outline">Join</Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3" asChild><Link to="/groups">View All Groups</Link></Button>
              </CardContent>
            </Card>

            {/* Friends Summary */}
            <Card>
              <CardHeader><CardTitle>Your Network</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">47</div>
                  <p className="text-sm text-muted-foreground mb-4">Friends connected</p>
                  <Button variant="outline" className="w-full" asChild><Link to="/friends">View All Friends</Link></Button>
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