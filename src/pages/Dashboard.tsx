
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, Sparkles, Gift, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";

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
  friends: string[];
  email?: string;
  phone_number?: string;
  avatar_url?: string;
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
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [recentMatches, setRecentMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  
  // New state for functionality
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadingFeed(true);
      setLoadingMatches(true);

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
          
          // Fetch existing likes and friend requests
          const [likedData, requestsData] = await Promise.all([
            supabase
              .from('match_history')
              .select('target_username')
              .eq('actor_username', profileData.username)
              .eq('action', 'liked'),
            supabase
              .from('friend_requests')
              .select('to_user_username')
              .eq('from_user_username', profileData.username)
              .eq('status', 'pending')
          ]);
          
          if (likedData.data) {
            setLikedUsers(likedData.data.map(u => u.target_username));
          }
          if (requestsData.data) {
            setSentRequests(requestsData.data.map(r => r.to_user_username));
          }
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

        // Fetch recent matches
        const { data: likedUsersData, error: likedUsersError } = await supabase
          .from('match_history')
          .select('target_username')
          .eq('actor_username', profileData.username)
          .eq('action', 'liked')
          .order('created_at', { ascending: false })
          .limit(2);

        if (likedUsersError) {
          console.error("Error fetching recent matches:", likedUsersError);
        } else if (likedUsersData && likedUsersData.length > 0) {
          const likedUsernames = likedUsersData.map(u => u.target_username);
          const { data: matchesProfiles, error: matchesError } = await supabase
            .from('users')
            .select('*')
            .in('username', likedUsernames);
          
          if (matchesError) {
            console.error("Error fetching match profiles:", matchesError);
          } else {
            setRecentMatches(matchesProfiles || []);
          }
        }
        setLoadingMatches(false);

      } else {
        setLoading(false);
        setLoadingFeed(false);
        setLoadingMatches(false);
      }
    };

    fetchDashboardData();
  }, []);

  const suggestedGroups = [
    { id: "1", name: "Ramen Lovers", members: 234, category: "Food" },
    { id: "2", name: "Indie Music NYC", members: 456, category: "Music" },
    { id: "3", name: "Sustainable Living", members: 789, category: "Lifestyle" },
  ];

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

  // Action handlers for PersonaCard buttons
  const handleChatClick = (user: UserProfile) => {
    navigate(`/chats/${user.id}`);
  };

  const handleLike = async (user: UserProfile) => {
    if (!userProfile) return;
    
    // Check if already liked
    if (likedUsers.includes(user.username)) {
      toast.info(`You already liked ${user.full_name}!`, {
        description: "You've already shown interest in this person."
      });
      return;
    }

    const toastId = toast.loading(`Liking ${user.full_name}...`);
    try {
      const { error } = await supabase.from('match_history').insert({
        actor_username: userProfile.username,
        target_username: user.username,
        action: 'liked',
      });

      if (error) throw error;

      setLikedUsers(prev => [...prev, user.username]);
      toast.success(`You liked ${user.full_name}!`, { 
        id: toastId,
        description: "They'll be notified of your interest. Keep exploring for more matches!"
      });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleAddFriend = async (user: UserProfile) => {
    if (!userProfile) return;
    
    // Check if already friends
    if (userProfile.friends?.includes(user.username)) {
      toast.info(`You're already friends with ${user.full_name}!`, {
        description: "You can message them anytime or view their full profile."
      });
      return;
    }
    
    // Check if request already sent
    if (sentRequests.includes(user.username)) {
      toast.info(`Friend request already sent to ${user.full_name}!`, {
        description: "Please wait for them to respond to your request."
      });
      return;
    }

    const toastId = toast.loading(`Sending friend request to ${user.full_name}...`);
    try {
      const { error } = await supabase.from('friend_requests').insert({
        from_user_username: userProfile.username,
        to_user_username: user.username,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error("Friend request already sent.");
        }
        throw new Error(error.message);
      }

      setSentRequests(prev => [...prev, user.username]);
      toast.success(`Friend request sent to ${user.full_name}!`, { 
        id: toastId,
        description: "They'll receive your request and can accept or decline."
      });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleShare = async (user: UserProfile) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${user.full_name} on AuraLink`,
          text: `Meet ${user.full_name}: ${user.openai_persona?.substring(0, 100)}...`,
          url: `${window.location.origin}/persona/${user.id}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(`${window.location.origin}/persona/${user.id}`);
        toast.success(`Profile link copied to clipboard!`, {
          description: "Share this link with friends to introduce them to this person."
        });
      }
    } catch (error) {
      toast.error("Failed to share profile");
    }
  };

  const renderActivity = (activity: Activity) => {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
    switch (activity.type) {
      case 'new_friend':
        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <strong>{activity.metadata.actor_full_name || activity.actor_username}</strong> became friends with <strong>{activity.metadata.target_full_name || activity.target_username}</strong>.
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold">AuraLink</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/search"><Button variant="ghost" size="sm"><Search className="w-4 h-4 mr-2" />Search</Button></Link>
              <Link to="/match"><Button variant="ghost" size="sm"><Sparkles className="w-4 h-4 mr-2" />Match</Button></Link>
              <Link to="/friends"><Button variant="ghost" size="sm"><Users className="w-4 h-4 mr-2" />Friends</Button></Link>
              <Link to="/gift"><Button variant="ghost" size="sm"><Gift className="w-4 h-4 mr-2" />Gift</Button></Link>
              <Link to="/settings"><Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {loading ? '...' : userProfile?.full_name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Your PersonaCard</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-24 w-full" /> : personaCardUser ? <PersonaCard user={personaCardUser} showActions={false} /> : <p>Could not load profile.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Matches</CardTitle></CardHeader>
              <CardContent>
                {loadingMatches ? <div className="grid md:grid-cols-2 gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div> : 
                recentMatches.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentMatches.map((match) => (
                      <div key={match.id}>
                        <PersonaCard 
                          user={{...match, bio: match.openai_persona}} 
                          variant="compact"
                          onChatClick={handleChatClick}
                          onLikeClick={handleLike}
                          onShareClick={handleShare}
                          onAddFriendClick={handleAddFriend}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center">You haven't liked anyone recently. Go find a match!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader>
              <CardContent>
                {loadingFeed ? <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> :
                activityFeed.length > 0 ? <div className="space-y-4">{activityFeed.map(renderActivity)}</div> : <p className="text-muted-foreground text-sm text-center">No recent activity.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild><Link to="/match"><Sparkles className="w-4 h-4 mr-2" />Find Someone to Chat</Link></Button>
                <Button variant="outline" className="w-full" asChild><Link to="/search"><Search className="w-4 h-4 mr-2" />Search People</Link></Button>
                <Button variant="outline" className="w-full" asChild><Link to="/gift"><Gift className="w-4 h-4 mr-2" />Generate Gift Ideas</Link></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Groups to Join</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {suggestedGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div><p className="font-medium text-sm">{group.name}</p><p className="text-xs text-muted-foreground">{group.members} members</p></div>
                    <Button size="sm" variant="outline">Join</Button>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-3" asChild><Link to="/groups">View All Groups</Link></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Your Network</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{userProfile?.friends?.length || 0}</div>
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
