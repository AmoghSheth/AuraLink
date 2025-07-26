import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  ArrowLeft,
  Loader2,
  Heart,
  Share2,
  Mail,
  Phone,
  Cake,
  UserPlus,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import ChatPopup from "@/components/ChatPopup";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define the structure of a user profile
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  age: number;
  bio: string;
  interests: string[];
  values: string[];
  lifestyle: string[];
  openai_persona: string;
  friends?: string[];
  email: string;
  phone_number: string;
  avatar_url: string;
}

const Search = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatPopupOpen, setChatPopupOpen] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] =
    useState<UserProfile | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // Stores usernames of users a request was sent to
  const navigate = useNavigate();

  // Fetch users and existing friend requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("You must be logged in.");

        // Fetch current user's profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profileError) throw new Error("Could not fetch your profile.");
        setCurrentUser(profile);

        // Fetch all other users
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("*")
          .neq("id", user.id);
        if (usersError) throw new Error("Could not fetch users.");

        // Fetch pending friend requests sent by the current user
        const { data: requests, error: requestsError } = await supabase
          .from("friend_requests")
          .select("to_user_username")
          .eq("from_user_username", profile.username)
          .eq("status", "pending");

        if (requestsError) throw new Error("Could not fetch friend requests.");

        setSentRequests(requests.map((r) => r.to_user_username));
        setAllUsers(users || []);
        setFilteredUsers(users || []);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(allUsers);
      return;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allUsers.filter(
      (user) =>
        user.full_name.toLowerCase().includes(lowercasedQuery) ||
        user.username.toLowerCase().includes(lowercasedQuery) ||
        user.interests.some((interest) =>
          interest.toLowerCase().includes(lowercasedQuery)
        ) ||
        user.values.some((value) =>
          value.toLowerCase().includes(lowercasedQuery)
        )
    );
    setFilteredUsers(results);
  }, [searchQuery, allUsers]);

  // Function to send a friend request
  const sendFriendRequest = async (targetUser: UserProfile) => {
    if (!currentUser) return;

    const toastId = toast.loading(
      `Sending friend request to ${targetUser.username}...`
    );
    try {
      const { error } = await supabase.from("friend_requests").insert({
        from_user_username: currentUser.username,
        to_user_username: targetUser.username,
      });

      if (error) {
        // Handle unique constraint violation (request already exists)
        if (error.code === "23505") {
          throw new Error("Friend request already sent.");
        }
        throw new Error(error.message);
      }

      toast.success(`Friend request sent to ${targetUser.username}!`, {
        id: toastId,
      });
      // Add the user to the list of users with sent requests to update the UI
      setSentRequests((prev) => [...prev, targetUser.username]);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleChatClick = (user: UserProfile) => {
    setSelectedUserForChat(user);
    setChatPopupOpen(true);
  };

  // Override PersonaCard actions
  const personaCardActions = (user: UserProfile) => {
    const isFriend = currentUser?.friends?.includes(user.username);
    const isRequestSent = sentRequests.includes(user.username);

    return (
      <div className="flex gap-2 pt-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => handleChatClick(user)}
            >
              Chat
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{user.full_name}</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center pt-1">
                    <Mail className="mr-2 h-3 w-3" />
                    {user.email || "No email"}
                  </div>
                  <div className="flex items-center pt-1">
                    <Phone className="mr-2 h-3 w-3" />
                    {user.phone_number || "No phone"}
                  </div>
                  <div className="flex items-center pt-1">
                    <Cake className="mr-2 h-3 w-3" />
                    {user.age} years old
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <Button
          className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
          onClick={() => sendFriendRequest(user)}
          disabled={isRequestSent || isFriend}
        >
          {isFriend ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Friends
            </>
          ) : isRequestSent ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Request Sent
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          onClick={() =>
            toast.info(`Shared ${user.full_name}'s profile!`, {
              icon: <Share2 className="w-4 h-4" />,
            })
          }
        >
          Share
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <nav className="border-b bg-card/30 backdrop-blur-xl glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10 transition-transform duration-300 hover:scale-110" />
            <span className="text-xl font-bold gradient-text">AuraLink</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Discover People</h1>
          <p className="text-muted-foreground text-lg">
            Find others who share your interests and values
          </p>
        </div>

        <Card className="mb-6 glass-effect">
          <CardContent className="p-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors duration-200" />
              <Input
                placeholder="Search by name, username, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Finding amazing people...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
              {filteredUsers.map((person) => (
                <PersonaCard
                  key={person.id}
                  user={{
                    ...person,
                    bio: person.openai_persona,
                  }}
                  showActions={true}
                  customActions={personaCardActions(person)}
                />
              ))}
            </div>
            {searchQuery && filteredUsers.length === 0 && (
              <Card className="text-center py-12 mt-6 glass-effect">
                <CardContent>
                  <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-6 animate-bounce-soft" />
                  <h3 className="text-xl font-semibold mb-2 gradient-text">
                    No results found
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Try adjusting your search terms.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      <ChatPopup
        isOpen={isChatPopupOpen}
        onClose={() => setChatPopupOpen(false)}
        user={
          selectedUserForChat
            ? {
                name: selectedUserForChat.full_name,
                avatarUrl: selectedUserForChat.avatar_url || "",
                email: selectedUserForChat.email || "No email provided",
                phone: selectedUserForChat.phone_number || "No phone provided",
                age: selectedUserForChat.age,
                conversationTips: [
                  `Ask ${
                    selectedUserForChat.full_name
                  } about their interest in ${
                    selectedUserForChat.interests?.[0] || "something they like"
                  }.`,
                  `Mention your shared value of ${
                    selectedUserForChat.values?.[0] ||
                    "something you both value"
                  }.`,
                  'Start with a simple "Hello!"',
                ],
              }
            : null
        }
        onDmClick={() => {
          if (selectedUserForChat) {
            setChatPopupOpen(false);
            navigate(`/chats/${selectedUserForChat.id}`, {
              state: { user: selectedUserForChat },
            });
          }
        }}
      />
    </div>
  );
};

export default Search;
