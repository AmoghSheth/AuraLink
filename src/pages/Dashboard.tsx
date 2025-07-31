// src/pages/Dashboard.tsx

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link2 } from "lucide-react";
import html2canvas from "html2canvas";

// --- Types ---
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

interface Group {
  id: string;
  name: string;
  description?: string;
  category?: string;
  members: string[]; // array of user UUIDs
  created_at?: string;
}

// --- Component ---
const Dashboard = () => {
  const navigate = useNavigate();

  // User data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Activity, matches, DMs
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [recentMatches, setRecentMatches] = useState<UserProfile[]>([]);
  const [activeDms, setActiveDms] = useState<UserProfile[]>([]);

  // Groups
  const [activeGroups, setActiveGroups] = useState<Group[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Loading flags
  const [loading, setLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Likes & requests
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadingFeed(true);
      setLoadingMatches(true);
      setLoadingGroups(true);

      // 1) Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setLoadingFeed(false);
        setLoadingMatches(false);
        setLoadingGroups(false);
        return;
      }

      // 2) Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching user profile:", profileError);
        setLoading(false);
      } else {
        setUserProfile(profileData);

        // 3) Fetch likes & friend requests
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

        setLoading(false);
      }

      // 4) Activity feed
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

      // 5) Recent matches
      if (userProfile?.username) {
        const { data: likedUsersData, error: likedUsersError } = await supabase
          .from("match_history")
          .select("target_username")
          .eq("actor_username", userProfile.username)
          .eq("action", "liked")
          .order("created_at", { ascending: false })
          .limit(2);

        if (likedUsersError) {
          console.error("Error fetching recent matches:", likedUsersError);
        } else if (likedUsersData?.length) {
          const names = likedUsersData.map((u) => u.target_username);
          const { data: matchesProfiles, error: matchesError } = await supabase
            .from("users")
            .select("*")
            .in("username", names);

          if (matchesError) {
            console.error("Error fetching match profiles:", matchesError);
          } else {
            setRecentMatches(matchesProfiles || []);
          }
        }
      }
      setLoadingMatches(false);

      // 6) Active DMs from localStorage
      const dms = JSON.parse(localStorage.getItem("activeDms") || "[]");
      if (dms.length) {
        const { data: dmProfiles, error: dmError } = await supabase
          .from("users")
          .select("*")
          .in("id", dms);
        if (!dmError && dmProfiles) setActiveDms(dmProfiles);
      } else {
        setActiveDms([]);
      }

      // 7) Fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*");

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
      } else if (groupsData) {
        // split into joined vs suggested
        const joined = groupsData.filter((g) =>
          Array.isArray(g.members) && user?.id && g.members.includes(user.id)
        );
        const suggested = groupsData.filter(
          (g) =>
            !Array.isArray(g.members) || !g.members.includes(user.id)
        );

        setActiveGroups(joined);
        setSuggestedGroups(suggested);
      }
      setLoadingGroups(false);
    };

    fetchDashboardData();
  }, [userProfile?.username]);

  // PersonaCard props
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

  // --- Handlers ---
  const handleChatClick = (u: UserProfile) => navigate(`/chats/${u.id}`);

  const handleLike = async (u: UserProfile) => {
    if (!userProfile) return;
    if (likedUsers.includes(u.username)) {
      toast.info(`Already liked ${u.full_name}!`);
      return;
    }
    const t = toast.loading(`Liking ${u.full_name}...`);
    const { error } = await supabase.from("match_history").insert({
      actor_username: userProfile.username,
      target_username: u.username,
      action: "liked",
    });
    if (error) {
      toast.error(error.message, { id: t });
    } else {
      setLikedUsers((p) => [...p, u.username]);
      toast.success(`You liked ${u.full_name}!`, { id: t });
    }
  };

  const handleAddFriend = async (u: UserProfile) => {
    if (!userProfile) return;
    if (userProfile.friends?.includes(u.username)) {
      toast.info(`Already friends with ${u.full_name}!`);
      return;
    }
    if (sentRequests.includes(u.username)) {
      toast.info(`Friend request already sent to ${u.full_name}!`);
      return;
    }
    const t = toast.loading(`Sending request to ${u.full_name}...`);
    const { error } = await supabase.from("friend_requests").insert({
      from_user_username: userProfile.username,
      to_user_username: u.username,
    });
    if (error) {
      toast.error(error.message, { id: t });
    } else {
      setSentRequests((p) => [...p, u.username]);
      toast.success(`Request sent to ${u.full_name}!`, { id: t });
    }
  };

  const handleShare = async (u: UserProfile) => {
    const url = `${window.location.origin}/persona/${u.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Meet ${u.full_name} on AuraLink`,
          text: u.openai_persona.slice(0, 100),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
      }
    } catch {
      toast.error("Failed to share");
    }
  };

  // Render activity items
  const renderActivity = (act: Activity) => {
    const ago = formatDistanceToNow(new Date(act.created_at), {
      addSuffix: true,
    });
    if (act.type === "new_friend")
      return (
        <div
          key={act.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              <strong>
                {act.metadata.actor_full_name || act.actor_username}
              </strong>{" "}
              became friends with{" "}
              <strong>
                {act.metadata.target_full_name || act.target_username}
              </strong>
              .
            </p>
            <p className="text-xs text-muted-foreground">{ago}</p>
          </div>
        </div>
      );
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* NAV */}
      <nav className="border-b bg-card/30 backdrop-blur-xl sticky top-0 z-50 glass-effect">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10 transition-transform duration-300 hover:scale-110" />
            <span className="text-2xl font-bold gradient-text">AuraLink</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/search">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </Link>
            <Link to="/match">
              <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent">
                <Sparkles className="w-4 h-4 mr-3" /> Match
              </Button>
            </Link>
            <Link to="/friends">
              <Button variant="ghost" size="sm" className="hover:bg-secondary/10 hover:text-secondary">
                <Users className="w-4 h-4 mr-2" /> Friends
              </Button>
            </Link>
            <Link to="/gift">
              <Button variant="ghost" size="sm" className="hover:bg-highlight/10 hover:text-highlight">
                <Gift className="w-4 h-4 mr-2" /> Gift
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="hover:bg-muted/20">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Welcome back, {loading ? "..." : userProfile?.full_name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening in your network
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left (2/3) */}
          <div className="lg:col-span-2 space-y-8 stagger-animation">
            {/* PersonaCard */}
            <Card className="float-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Your PersonaCard</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-24 w-full animate-pulse" />
                ) : personaCardUser ? (
                  <>
                    <PersonaCard user={personaCardUser} showActions={false} />
                    {/* Export dialog button */}
                    <div className="flex justify-end mt-4">
                      <ExportableCardDialog user={userProfile!} />
                    </div>
                  </>
                ) : (
                  <p>Could not load your profile.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMatches ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full animate-pulse" />
                    <Skeleton className="h-24 w-full animate-pulse" />
                  </div>
                ) : recentMatches.length ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentMatches.map((m) => (
                      <PersonaCard
                        key={m.id}
                        user={{ ...m, bio: m.openai_persona }}
                        variant="compact"
                        onChatClick={handleChatClick}
                        onLikeClick={handleLike}
                        onShareClick={handleShare}
                        onAddFriendClick={handleAddFriend}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No recent matches. Give someone a like!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFeed ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full animate-pulse" />
                    <Skeleton className="h-12 w-full animate-pulse" />
                  </div>
                ) : activityFeed.length ? (
                  <div className="space-y-4">
                    {activityFeed.map(renderActivity)}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No recent activity.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active DMs */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Active DMs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {activeDms.length ? (
                      activeDms.map((dm) => (
                        <div
                          key={dm.id}
                          className="min-w-[220px] bg-gradient-to-br from-card/90 to-card/70 rounded-xl p-4 flex flex-col items-center justify-between shadow-lg hover-lift glass-effect"
                        >
                          <img
                            src={dm.id ? getCloudinaryUrl(dm.id) : "/logo.png"}
                            alt={dm.full_name}
                            className="w-12 h-12 rounded-full mb-2 shadow-md object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/logo.png";
                            }}
                          />
                          <div className="font-semibold text-base truncate text-center">
                            {dm.full_name}
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate(`/chats/${dm.id}`)}
                          >
                            Open DM
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-8">
                        No active DMs yet.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Groups */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Active Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {activeGroups.length ? (
                      activeGroups.map((g) => (
                        <div
                          key={g.id}
                          className="min-w-[220px] bg-gradient-to-br from-card/90 to-card/70 rounded-xl p-4 flex flex-col items-center justify-between shadow-lg hover-lift glass-effect"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2 shadow-md">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="font-semibold text-base truncate text-center">
                            {g.name}
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            {g.members.length} members
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate(`/groups/${g.id}`)}
                          >
                            Open Group
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm py-8">
                        You haven’t joined any groups yet.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right (1/3) */}
          <div className="space-y-6 stagger-animation">
            {/* Quick Actions */}
            <Card className="float-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/match">
                    <Sparkles className="w-4 h-4 mr-2" /> Find Someone to Chat
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" /> Search People
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/gift">
                    <Gift className="w-4 h-4 mr-2" /> Generate Gift Ideas
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Groups to Join */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Groups to Join</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingGroups ? (
                  <p className="text-muted-foreground text-sm">
                    Loading groups…
                  </p>
                ) : suggestedGroups.length ? (
                  suggestedGroups.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 hover-lift glass-effect"
                    >
                      <div>
                        <p className="font-medium text-sm">{g.name}</p>
                        {g.description && (
                          <p className="text-xs text-muted-foreground">
                            {g.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {g.members ? g.members.length : 0} members
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/groups">Join Group</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No groups found.
                  </p>
                )}
                <Button variant="ghost" className="w-full mt-3" asChild>
                  <Link to="/groups">View All Groups</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Your Network */}
            <Card className="stagger-animation">
              <CardHeader>
                <CardTitle className="gradient-text">Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
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

// --- Exportable Card Dialog (full code) ---
function ExportableCardDialog({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);

  // form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState("");
  const [allergies, setAllergies] = useState("");
  const [facts, setFacts] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [food, setFood] = useState("");
  const [favorites, setFavorites] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryReady, setSummaryReady] = useState(false);
  const navigate = useNavigate();

  // Pre-fill when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      // load from localStorage or user
      setFullName(localStorage.getItem("export_fullName") || user.full_name || "");
      setEmail(localStorage.getItem("export_email") || user.email || "");
      setPhone(localStorage.getItem("export_phone") || user.phone_number || "");
      setSocial(localStorage.getItem("export_social") || "");
      setBirthday(localStorage.getItem("export_birthday") || "");
      setLocation(localStorage.getItem("export_location") || "");
      setAllergies(localStorage.getItem("export_allergies") || "");
      setFacts(localStorage.getItem("export_facts") || "");
      setHobbies(localStorage.getItem("export_hobbies") || "");
      setFood(localStorage.getItem("export_food") || "");
      setFavorites(localStorage.getItem("export_favorites") || "");
      setBio(localStorage.getItem("export_bio") || user.openai_persona || "");
      setTags(
        JSON.parse(localStorage.getItem("export_tags") || "[]") ||
          (user.interests || []).slice(0, 4)
      );
    })();
  }, [open]);

  // Persist to localStorage
  function saveFields() {
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
    localStorage.setItem("export_bio", bio);
    localStorage.setItem("export_tags", JSON.stringify(tags));
  }

  // AI‐powered bio suggestion
  async function suggestBio() {
    setGenerating(true);
    setSummary("");
    setSummaryReady(false);
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Create a well-structured 3-4 sentence bio that will display beautifully as bullet points in the UI.

                    **FORMATTING REQUIREMENTS:**
                    - Write 3-4 distinct, complete sentences
                    - Each sentence should focus on a different aspect of their personality
                    - End each sentence with proper punctuation (period, exclamation, or question mark)
                    - Avoid run-on sentences - keep each sentence focused and clear
                    - Make each sentence impactful and readable on its own

                    **Content Structure:**
                    1. Personality essence and core traits
                    2. Interests, hobbies, and passions
                    3. Values and lifestyle approach
                    4. Connection goals or what makes them unique

                    **User Details:**
                    Name: ${fullName}
                    Tags: ${tags.join(", ")}
                    Hobbies: ${hobbies}
                    Facts: ${facts}
                    Favorites: ${favorites}
                    Existing Personality: ${user.openai_persona || ""}`,
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
    } catch {
      setSummary("Could not generate summary.");
    } finally {
      setGenerating(false);
    }
  }

  // Generate final card
  function handleGenerateCard() {
    saveFields();
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
      userId: user.id,
    };
    const cards = JSON.parse(localStorage.getItem("generated_cards") || "[]");
    cards.push(cardData);
    localStorage.setItem("generated_cards", JSON.stringify(cards));
    navigate(`/exported-card/${cardId}`);
  }

  const inputClass =
    "rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 px-3 py-2 w-full bg-white text-sm";
  const textareaClass =
    "rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 px-3 py-2 w-full min-h-[80px] bg-white text-sm";

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
            Edit your details, then preview your beautiful card.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6">
          {/* Left column */}
          <div className="space-y-3">
            <label className="block font-medium">Full Name</label>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label className="block font-medium">
              Email <span className="text-xs text-muted-foreground">(required)</span>
            </label>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label className="block font-medium">Location</label>
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

          {/* Right column */}
          <div className="space-y-3">
            <label className="block font-medium flex items-center gap-2">
              Bio
              <Button size="sm" variant="ghost" onClick={suggestBio} disabled={generating}>
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
            <DialogFooter className="mt-6 flex gap-2">
              <Button onClick={saveFields} className="flex-1">
                Save Draft
              </Button>
              <Button
                onClick={handleGenerateCard}
                className="flex-1"
                disabled={!fullName || !email || !bio || tags.length === 0}
              >
                Generate
              </Button>
            </DialogFooter>
          </div>
        </div>

        {/* Previous cards */}
        {generatedCards.length > 0 && (
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Your Previous Cards</h4>
            <div className="flex flex-col gap-2">
              {generatedCards.map((c: any) => (
                <Button
                  key={c.id}
                  variant="outline"
                  onClick={() => navigate(`/exported-card/${c.id}`)}
                >
                  {c.fullName} — {c.bio.slice(0, 20)}…
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Cloudinary URL Helper ---
export const getCloudinaryUrl = (userId: string) => {
  return `https://res.cloudinary.com/ddlpuoyei/image/upload/v1753661631/user-photos/${userId}`;
};
