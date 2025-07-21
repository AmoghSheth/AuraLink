import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Sparkles,
  Gift,
  Settings,
  Calendar as CalendarIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link2 } from "lucide-react";
import html2canvas from "html2canvas";

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
  const [activeDms, setActiveDms] = useState<UserProfile[]>([]);
  const [activeGroups, setActiveGroups] = useState<any[]>([]); // Replace 'any' with your group type if available
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        } else if (profileData) {
          setUserProfile(profileData);

          // Fetch existing likes and friend requests
          const [likedData, requestsData] = await Promise.all([
            supabase
              .from("match_history")
              .select("target_username")
              .eq("actor_username", profileData.username)
              .eq("action", "liked"),
            supabase
              .from("friend_requests")
              .select("to_user_username")
              .eq("from_user_username", profileData.username)
              .eq("status", "pending"),
          ]);

          if (likedData.data) {
            setLikedUsers(likedData.data.map((u) => u.target_username));
          }
          if (requestsData.data) {
            setSentRequests(requestsData.data.map((r) => r.to_user_username));
          }
        }
        setLoading(false);

        // Fetch activity feed
        const { data: activityData, error: activityError } = await supabase
          .from("activity")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (activityError) {
          console.error("Error fetching activity feed:", activityError);
        } else {
          setActivityFeed(activityData || []);
        }
        setLoadingFeed(false);

        // Fetch recent matches
        const { data: likedUsersData, error: likedUsersError } = await supabase
          .from("match_history")
          .select("target_username")
          .eq("actor_username", profileData.username)
          .eq("action", "liked")
          .order("created_at", { ascending: false })
          .limit(2);

        if (likedUsersError) {
          console.error("Error fetching recent matches:", likedUsersError);
        } else if (likedUsersData && likedUsersData.length > 0) {
          const likedUsernames = likedUsersData.map((u) => u.target_username);
          const { data: matchesProfiles, error: matchesError } = await supabase
            .from("users")
            .select("*")
            .in("username", likedUsernames);

          if (matchesError) {
            console.error("Error fetching match profiles:", matchesError);
          } else {
            setRecentMatches(matchesProfiles || []);
          }
        }
        setLoadingMatches(false);

        // Fetch Active DMs from localStorage
        const dms = JSON.parse(localStorage.getItem("activeDms") || "[]");
        if (dms.length > 0) {
          const { data: dmProfiles, error: dmError } = await supabase
            .from("users")
            .select("*")
            .in("id", dms);
          if (!dmError && dmProfiles) setActiveDms(dmProfiles);
        } else {
          setActiveDms([]);
        }
        // Fetch Active Groups (mock for now)
        setActiveGroups([
          {
            id: "1",
            name: "Indie Music Lovers NYC",
            members: 342,
            category: "Music",
            lastActivity: "2 hours ago",
          },
          {
            id: "2",
            name: "Sustainable Living Community",
            members: 567,
            category: "Lifestyle",
            lastActivity: "1 day ago",
          },
        ]);
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
    {
      id: "3",
      name: "Sustainable Living",
      members: 789,
      category: "Lifestyle",
    },
  ];

  const personaCardUser = userProfile
    ? {
        id: userProfile.id,
        username: userProfile.username,
        full_name: userProfile.full_name,
        age: userProfile.age,
        bio: userProfile.openai_persona,
        interests: userProfile.interests,
        values: userProfile.values,
        lifestyle: userProfile.lifestyle,
      }
    : null;

  // Action handlers for PersonaCard buttons
  const handleChatClick = (user: UserProfile) => {
    navigate(`/chats/${user.id}`);
  };

  const handleLike = async (user: UserProfile) => {
    if (!userProfile) return;

    // Check if already liked
    if (likedUsers.includes(user.username)) {
      toast.info(`You already liked ${user.full_name}!`, {
        description: "You've already shown interest in this person.",
      });
      return;
    }

    const toastId = toast.loading(`Liking ${user.full_name}...`);
    try {
      const { error } = await supabase.from("match_history").insert({
        actor_username: userProfile.username,
        target_username: user.username,
        action: "liked",
      });

      if (error) throw error;

      setLikedUsers((prev) => [...prev, user.username]);
      toast.success(`You liked ${user.full_name}!`, {
        id: toastId,
        description:
          "They'll be notified of your interest. Keep exploring for more matches!",
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
        description: "You can message them anytime or view their full profile.",
      });
      return;
    }

    // Check if request already sent
    if (sentRequests.includes(user.username)) {
      toast.info(`Friend request already sent to ${user.full_name}!`, {
        description: "Please wait for them to respond to your request.",
      });
      return;
    }

    const toastId = toast.loading(
      `Sending friend request to ${user.full_name}...`
    );
    try {
      const { error } = await supabase.from("friend_requests").insert({
        from_user_username: userProfile.username,
        to_user_username: user.username,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Friend request already sent.");
        }
        throw new Error(error.message);
      }

      setSentRequests((prev) => [...prev, user.username]);
      toast.success(`Friend request sent to ${user.full_name}!`, {
        id: toastId,
        description: "They'll receive your request and can accept or decline.",
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
          text: `Meet ${user.full_name}: ${user.openai_persona?.substring(
            0,
            100
          )}...`,
          url: `${window.location.origin}/persona/${user.id}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `${window.location.origin}/persona/${user.id}`
        );
        toast.success(`Profile link copied to clipboard!`, {
          description:
            "Share this link with friends to introduce them to this person.",
        });
      }
    } catch (error) {
      toast.error("Failed to share profile");
    }
  };

  const renderActivity = (activity: Activity) => {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
      addSuffix: true,
    });
    switch (activity.type) {
      case "new_friend":
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <strong>
                  {activity.metadata.actor_full_name || activity.actor_username}
                </strong>{" "}
                became friends with{" "}
                <strong>
                  {activity.metadata.target_full_name ||
                    activity.target_username}
                </strong>
                .
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
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link to="/match">
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Match
                </Button>
              </Link>
              <Link to="/friends">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Friends
                </Button>
              </Link>
              <Link to="/gift">
                <Button variant="ghost" size="sm">
                  <Gift className="w-4 h-4 mr-2" />
                  Gift
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="ghost" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back,{" "}
            {loading ? "..." : userProfile?.full_name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your network
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your PersonaCard</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : personaCardUser ? (
                  <>
                    <PersonaCard user={personaCardUser} showActions={false} />
                    {/* Exportable Card Button */}
                    <div className="flex justify-end mt-4">
                      <ExportableCardDialog user={userProfile} />
                    </div>
                  </>
                ) : (
                  <p>Could not load profile.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMatches ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : recentMatches.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentMatches.map((match) => (
                      <div key={match.id}>
                        <PersonaCard
                          user={{ ...match, bio: match.openai_persona }}
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
                  <p className="text-muted-foreground text-sm text-center">
                    You haven't liked anyone recently. Go find a match!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
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
                  <p className="text-muted-foreground text-sm text-center">
                    No recent activity.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active DMs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active DMs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
                  <div className="flex gap-4">
                    {activeDms.length > 0 ? (
                      activeDms.map((user) => (
                        <div
                          key={user.id}
                          className="min-w-[220px] max-w-[220px] bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-between shadow-md"
                        >
                          <div className="mb-2">
                            <img
                              src={user.avatar_url || "/logo.png"}
                              alt={user.full_name}
                              className="w-12 h-12 rounded-full mb-2"
                            />
                            <div className="font-semibold text-base text-center truncate">
                              {user.full_name}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate(`/chats/${user.id}`)}
                          >
                            Open DM
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No active DMs yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Groups Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
                  <div className="flex gap-4">
                    {activeGroups.length > 0 ? (
                      activeGroups.map((group) => (
                        <div
                          key={group.id}
                          className="min-w-[220px] max-w-[220px] bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-between shadow-md"
                        >
                          <div className="mb-2">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="font-semibold text-base text-center truncate">
                              {group.name}
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              {group.members} members
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Last activity: {group.lastActivity}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate(`/groups/${group.id}`)}
                          >
                            Open Group
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No active groups yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/match">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Someone to Chat
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" />
                    Search People
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/gift">
                    <Gift className="w-4 h-4 mr-2" />
                    Generate Gift Ideas
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Groups to Join</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.members} members
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-3" asChild>
                  <Link to="/groups">View All Groups</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {userProfile?.friends?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Friends connected
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/friends">View All Friends</Link>
                  </Button>
                  <Button variant="secondary" className="w-full mb-2">
                    View on Globe
                  </Button>
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

function ExportableCardDialog({ user }) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(
    localStorage.getItem("export_bio") || user.openai_persona || ""
  );
  const [tags, setTags] = useState(
    JSON.parse(localStorage.getItem("export_tags") || "[]") ||
      (user.interests || []).slice(0, 4)
  );
  const [fullName, setFullName] = useState(
    localStorage.getItem("export_fullName") || user.full_name || ""
  );
  const [email, setEmail] = useState(
    localStorage.getItem("export_email") || user.email || ""
  );
  const [phone, setPhone] = useState(
    localStorage.getItem("export_phone") || user.phone_number || ""
  );
  const [social, setSocial] = useState(
    localStorage.getItem("export_social") || ""
  );
  const [birthday, setBirthday] = useState(
    localStorage.getItem("export_birthday") || ""
  );
  const [location, setLocation] = useState(
    localStorage.getItem("export_location") || ""
  );
  const [allergies, setAllergies] = useState(
    localStorage.getItem("export_allergies") || ""
  );
  const [facts, setFacts] = useState(
    localStorage.getItem("export_facts") || ""
  );
  const [hobbies, setHobbies] = useState(
    localStorage.getItem("export_hobbies") || ""
  );
  const [food, setFood] = useState(localStorage.getItem("export_food") || "");
  const [favorites, setFavorites] = useState(
    localStorage.getItem("export_favorites") || ""
  );
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryReady, setSummaryReady] = useState(false);
  const navigate = useNavigate();

  // AI bio summary (3 sentences)
  async function suggestBio() {
    setGenerating(true);
    setSummary("");
    setSummaryReady(false);
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          import.meta.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Write a 3-sentence summary bio for a social card. Name: ${fullName}. Tags: ${tags.join(
                      ", "
                    )}. Hobbies: ${hobbies}. Facts: ${facts}. Favorites: ${favorites}. Personality: ${
                      user.openai_persona || ""
                    }`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (suggestion) {
        setSummary(suggestion);
        setBio(suggestion);
        setSummaryReady(true);
      }
    } catch (e) {
      setSummary("Could not generate summary.");
    }
    setGenerating(false);
  }

  // Save fields to localStorage
  function saveFields() {
    localStorage.setItem("export_bio", bio);
    localStorage.setItem("export_tags", JSON.stringify(tags));
    localStorage.setItem("export_fullName", fullName);
    localStorage.setItem("export_email", email);
    localStorage.setItem("export_phone", phone);
    localStorage.setItem("export_social", social);
    localStorage.setItem("export_birthday", birthday);
    localStorage.setItem("export_location", location);
    localStorage.setItem("export_allergies", allergies);
    localStorage.setItem("export_facts", facts);
    localStorage.setItem("export_hobbies", hobbies);
    localStorage.setItem("export_food", food);
    localStorage.setItem("export_favorites", favorites);
  }

  function handleGenerateCard() {
    saveFields();
    // Save card data to localStorage with unique ID
    const cardId = "card_" + Date.now();
    const cardData = {
      id: cardId,
      fullName,
      email,
      phone,
      social,
      birthday,
      location,
      allergies,
      facts,
      hobbies,
      food,
      favorites,
      bio,
      tags,
    };
    const cards = JSON.parse(localStorage.getItem("generated_cards") || "[]");
    cards.push(cardData);
    localStorage.setItem("generated_cards", JSON.stringify(cards));
    navigate(`/exported-card/${cardId}`);
  }

  // Modern input style
  const inputClass =
    "rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 px-3 py-2 w-full transition-all bg-white text-sm";
  const textareaClass =
    "rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 px-3 py-2 w-full min-h-[80px] transition-all bg-white text-sm";

  // Fetch generated cards
  const generatedCards = JSON.parse(
    localStorage.getItem("generated_cards") || "[]"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Link2 className="w-4 h-4" />
          Exportable Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Persona Card</DialogTitle>
          <DialogDescription>
            Edit your details, then preview your beautiful card to share
            anywhere.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <label className="block font-medium">Full Name</label>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label className="block font-medium">
              Email{" "}
              <span className="text-xs text-muted-foreground">(required)</span>
            </label>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="block font-medium">Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label className="block font-medium">Social Media</label>
            <input
              className={inputClass}
              value={social}
              onChange={(e) => setSocial(e.target.value)}
            />
            <label className="block font-medium">Birthday</label>
            <input
              className={inputClass}
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
            <label className="block font-medium">Location (City, State)</label>
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <label className="block font-medium">Allergies</label>
            <input
              className={inputClass}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
            <label className="block font-medium">Facts</label>
            <input
              className={inputClass}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
            />
            <label className="block font-medium">Hobbies</label>
            <input
              className={inputClass}
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
            />
            <label className="block font-medium">Food Preferences</label>
            <input
              className={inputClass}
              value={food}
              onChange={(e) => setFood(e.target.value)}
            />
            <label className="block font-medium">Favorites</label>
            <input
              className={inputClass}
              value={favorites}
              onChange={(e) => setFavorites(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="block font-medium flex items-center gap-2">
              Bio
              <Button
                size="sm"
                variant="ghost"
                onClick={suggestBio}
                disabled={generating}
              >
                AI Suggest
              </Button>
            </label>
            {summary && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-primary mb-2">
                {summary}
              </div>
            )}
            <textarea
              className={textareaClass}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <label className="block font-medium">Tags (up to 4)</label>
            <input
              className={inputClass}
              value={tags.join(", ")}
              onChange={(e) =>
                setTags(
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .slice(0, 4)
                )
              }
              placeholder="tag1, tag2, ..."
            />
            <div className="mt-6">
              <Button onClick={saveFields} className="w-full">
                Save
              </Button>
            </div>
            <Button
              onClick={handleGenerateCard}
              className="w-full mt-2"
              disabled={!fullName || !email || !bio || tags.length === 0}
            >
              Generate Card
            </Button>
          </div>
        </div>
        {/* Card Preview */}
        <div className="flex justify-center mt-8">
          <div className="w-[400px] rounded-2xl shadow-xl bg-white p-6 flex flex-col items-center gap-2 border border-primary">
            <div className="text-2xl font-bold mb-1">{fullName}</div>
            <div className="text-sm text-muted-foreground mb-2">{location}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="italic text-center text-sm mb-2">{bio}</div>
            <div className="text-xs text-muted-foreground mb-1">
              Birthday: {birthday}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              Allergies: {allergies}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              Facts: {facts}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              Hobbies: {hobbies}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              Food: {food}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              Favorites: {favorites}
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-xs">
                <b>Email:</b> {email}
              </span>
              {phone && (
                <span className="text-xs">
                  <b>Phone:</b> {phone}
                </span>
              )}
              {social && (
                <span className="text-xs">
                  <b>Social:</b> {social}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Generated Cards List */}
        {generatedCards.length > 0 && (
          <div className="mt-8">
            <div className="font-semibold mb-2">Generated Cards</div>
            <div className="flex flex-col gap-2">
              {generatedCards.map((card) => (
                <Button
                  key={card.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate(`/exported-card/${card.id}`)}
                >
                  {card.fullName} — {card.bio.slice(0, 32)}...
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
