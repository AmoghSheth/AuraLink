import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Users, Search, UserPlus, Gift, MessageCircle, ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
  friends?: string[]; // Array of usernames
}

const Friends = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [rawSearchCount, setRawSearchCount] = useState(0);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);

  // Fetch current user and their friends' profiles
  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the current logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be logged in to view friends.");

      // 2. Fetch the current user's profile from the 'users' table
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileError || !currentUserProfile) throw new Error("Could not fetch your user profile.");
      setCurrentUser(currentUserProfile);

      // 3. If the user has friends, fetch their full profiles
      const friendUsernames = currentUserProfile.friends || [];
      if (friendUsernames.length > 0) {
        const { data: friendsProfiles, error: friendsError } = await supabase
          .from("users")
          .select("*")
          .in("username", friendUsernames);

        if (friendsError) throw new Error("Could not fetch friends' profiles.");
        setFriends(friendsProfiles || []);
      } else {
        setFriends([]);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Handle searching for new users to add as friends
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!currentUser) return;

    setIsSearching(true);
    setRawSearchCount(0);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        // Exclude current user from search
        .neq("id", currentUser.id);

      if (error) throw error;
      
      setRawSearchCount(data.length);

      // Exclude users who are already friends
      const existingFriendUsernames = friends.map(f => f.username);
      const filteredResults = data.filter(u => !existingFriendUsernames.includes(u.username));
      
      setSearchResults(filteredResults);
    } catch (err: any) {
      toast.error(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Add a new friend
  const addFriend = async (targetUser: UserProfile) => {
    if (!currentUser) return;

    const addingToast = toast.loading(`Adding ${targetUser.username} as a friend...`);

    try {
      // 1. Get the most recent friend lists for both users to avoid race conditions
      const { data: usersData, error: fetchError } = await supabase
        .from('users')
        .select('id, username, friends')
        .in('id', [currentUser.id, targetUser.id]);

      if (fetchError) {
        throw new Error(`Supabase error verifying profiles: ${fetchError.message}`);
      }
      if (!usersData || usersData.length < 2) {
        throw new Error(`Could not verify user profiles for friending. Expected 2 profiles, but found ${usersData?.length || 0}. This might be an RLS issue.`);
      }

      const currentUserData = usersData.find(u => u.id === currentUser.id)!;
      const targetUserData = usersData.find(u => u.id === targetUser.id)!;

      // 2. Update current user's friend list
      const currentUserFriends = Array.from(new Set([...(currentUserData.friends || []), targetUserData.username]));
      const { error: currentUserUpdateError } = await supabase
        .from("users")
        .update({ friends: currentUserFriends })
        .eq("id", currentUser.id);
      if (currentUserUpdateError) throw new Error(`Could not add friend to your list: ${currentUserUpdateError.message}`);

      // 3. Update target user's friend list
      const targetUserFriends = Array.from(new Set([...(targetUserData.friends || []), currentUserData.username]));
      const { error: targetUserUpdateError } = await supabase
        .from("users")
        .update({ friends: targetUserFriends })
        .eq("id", targetUser.id);
      if (targetUserUpdateError) {
        // Attempt to roll back the change on the current user for consistency
        await supabase.from("users").update({ friends: currentUserData.friends }).eq("id", currentUser.id);
        throw new Error(`Could not add you to friend's list: ${targetUserUpdateError.message}`);
      }

      // 4. Log the new friendship activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert({
          type: 'new_friend',
          actor_username: currentUserData.username,
          target_username: targetUserData.username,
          metadata: {
            actor_full_name: currentUser.full_name,
            target_full_name: targetUser.full_name,
          }
        });

      if (activityError) {
        // This is not a critical error, so we just log it and don't block the user
        console.error("Failed to log new friend activity:", activityError);
      }

      toast.success(`${targetUser.username} has been added as a friend!`, { id: addingToast });
      
      // 5. Refresh UI
      setFriends(prev => [...prev, targetUser]);
      setIsAddFriendDialogOpen(false);
      setSearchQuery("");
      setSearchResults([]);

    } catch (err: any) {
      toast.error(err.message, { id: addingToast });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

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
              <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" />
              <span className="text-xl font-display font-bold text-foreground tracking-tight-pro">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight-pro">Friends</h1>
              <p className="text-muted-foreground">
                {friends.length} connection{friends.length !== 1 && 's'}
              </p>
            </div>
            <Dialog open={isAddFriendDialogOpen} onOpenChange={setIsAddFriendDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Friend</DialogTitle>
                  <DialogDescription>
                    Search for users by their username to add them to your network.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-md border">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.full_name}</p>
                        </div>
                        <Button size="sm" onClick={() => addFriend(user)}>Add</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isSearching && "Searching..."}
                      {!isSearching && searchResults.length === 0 && rawSearchCount > 0 && "User is already your friend."}
                      {!isSearching && searchResults.length === 0 && rawSearchCount === 0 && "No users found. Check the username and try again."}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFriendDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Friends Grid */}
          {friends.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {friends.map((friend) => (
                <Card key={friend.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <PersonaCard user={friend} showActions={false} />
                    <div className="p-4 border-t bg-muted/20">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/gift">
                            <Gift className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-20">
              <CardContent>
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Network is Empty</h3>
                <p className="text-muted-foreground mb-6">
                  Use the "Add Friend" button to start connecting with people.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;