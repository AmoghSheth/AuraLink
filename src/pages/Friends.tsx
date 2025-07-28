import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Users, UserPlus, ArrowLeft, Loader2, Check, X, Trash2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the structure of a user profile
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  friends?: string[];
}

// Define the structure for friend requests, embedding the user profile
interface FriendRequest {
  id: string; // The request ID
  from_user_username: string;
  to_user_username: string;
  status: 'pending' | 'accepted' | 'declined';
  // This will be populated by joining the users table
  users: UserProfile;
}

const Friends = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be logged in.");

      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (profileError) throw new Error("Could not fetch your profile.");
      setCurrentUser(profile);

      // Fetch all data in parallel
      const [
        { data: friendsData, error: friendsError },
        { data: incomingData, error: incomingError },
        { data: outgoingData, error: outgoingError }
      ] = await Promise.all([
        // 1. Fetch current friends' profiles
        supabase.from("users").select("*").in("username", profile.friends || []),
        // 2. Fetch incoming friend requests with sender's profile
        supabase.from("friend_requests").select("*, users:from_user_username(*)").eq("to_user_username", profile.username).eq("status", "pending"),
        // 3. Fetch outgoing friend requests with receiver's profile
        supabase.from("friend_requests").select("*, users:to_user_username(*)").eq("from_user_username", profile.username).eq("status", "pending")
      ]);

      if (friendsError) throw new Error(`Fetching friends failed: ${friendsError.message}`);
      if (incomingError) throw new Error(`Fetching incoming requests failed: ${incomingError.message}`);
      if (outgoingError) throw new Error(`Fetching outgoing requests failed: ${outgoingError.message}`);

      setFriends(friendsData || []);
      setIncomingRequests(incomingData as FriendRequest[] || []);
      setOutgoingRequests(outgoingData as FriendRequest[] || []);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to accept a friend request
  const acceptRequest = async (request: FriendRequest) => {
    if (!currentUser) return;
    const toastId = toast.loading("Accepting request...");

    try {
        // Update the request status
        const { error: updateError } = await supabase
            .from("friend_requests")
            .update({ status: 'accepted' })
            .eq("id", request.id);
        if (updateError) throw updateError;

        // Add friend to current user's list
        const { error: currentUserError } = await supabase
            .from("users")
            .update({ friends: [...(currentUser.friends || []), request.from_user_username] })
            .eq("username", currentUser.username);
        if (currentUserError) throw currentUserError;

        // Add current user to the other user's friend list
        const { data: otherUser, error: otherUserError } = await supabase.from("users").select("friends").eq("username", request.from_user_username).single();
        if(otherUserError) throw otherUserError;
        const { error: otherUserUpdateError } = await supabase
            .from("users")
            .update({ friends: [...(otherUser.friends || []), currentUser.username] })
            .eq("username", request.from_user_username);
        if(otherUserUpdateError) throw otherUserUpdateError;

        toast.success("Friend request accepted!", { id: toastId });
        fetchData(); // Refresh all data
    } catch (err: any) {
        toast.error(err.message, { id: toastId });
    }
  };

  // Function to decline a friend request
  const declineRequest = async (requestId: string) => {
    const toastId = toast.loading("Declining request...");
    try {
      const { error } = await supabase.from("friend_requests").delete().eq("id", requestId);
      if (error) throw error;
      toast.success("Request declined.", { id: toastId });
      fetchData(); // Refresh all data
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };
  
    // Function to remove a friend
  const removeFriend = async (friendUsername: string) => {
    if (!currentUser || !window.confirm(`Are you sure you want to remove ${friendUsername} as a friend?`)) return;
    
    const toastId = toast.loading(`Removing ${friendUsername}...`);
    try {
        // Remove friend from current user's list
        const currentUserNewFriends = currentUser.friends?.filter(f => f !== friendUsername);
        const { error: userError } = await supabase.from("users").update({ friends: currentUserNewFriends }).eq("username", currentUser.username);
        if(userError) throw userError;

        // Remove current user from friend's list
        const { data: otherUser, error: otherUserError } = await supabase.from("users").select("friends").eq("username", friendUsername).single();
        if(otherUserError) throw otherUserError;
        const otherUserNewFriends = otherUser.friends?.filter(f => f !== currentUser.username);
        const { error: otherUserUpdateError } = await supabase.from("users").update({ friends: otherUserNewFriends }).eq("username", friendUsername);
        if(otherUserUpdateError) throw otherUserUpdateError;

        // Delete the original friend request record
        await supabase.from("friend_requests").delete().or(`(from_user_username.eq.${currentUser.username},to_user_username.eq.${friendUsername}),(from_user_username.eq.${friendUsername},to_user_username.eq.${currentUser.username})`);

        toast.success(`${friendUsername} has been removed from your friends.`, { id: toastId });
        fetchData();
    } catch (err: any) {
        toast.error(err.message, { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background purple-glow-container flex items-center justify-center">
        <div className="purple-glow" />
        <div className="text-center animate-fade-in relative z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your network...</p>
        </div>
      </div>
    );
  }

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

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-display font-bold mb-2 gradient-text tracking-tight">Your Network</h1>
          <p className="text-muted-foreground text-lg">Manage your friends and pending requests.</p>
        </div>

        {/* Tabs with improved spacing and animations */}
        <Tabs defaultValue="friends" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-effect h-14 p-1 bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm">
            <TabsTrigger 
              value="friends" 
              className="relative transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-lg font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Friends 
              <Badge className="ml-2 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/20 shadow-sm">
                {friends.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="incoming" 
              className="relative transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary/20 data-[state=active]:to-secondary/10 data-[state=active]:text-secondary data-[state=active]:shadow-lg rounded-lg font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Incoming 
              <Badge className="ml-2 bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border-secondary/20 shadow-sm">
                {incomingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="outgoing" 
              className="relative transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] data-[state=active]:bg-gradient-to-r data-[state=active]:from-highlight/20 data-[state=active]:to-highlight/10 data-[state=active]:text-highlight data-[state=active]:shadow-lg rounded-lg font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              Sent 
              <Badge className="ml-2 bg-gradient-to-r from-highlight/20 to-highlight/10 text-highlight border-highlight/20 shadow-sm">
                {outgoingRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="animate-fade-in">
            <Card className="glass-effect hover-lift transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="gradient-text flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Friends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {friends.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend, index) => (
                      <Card 
                        key={friend.id} 
                        className="p-4 flex flex-col items-center text-center hover-lift glass-effect transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Avatar className="w-16 h-16 mb-3 shadow-lg ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                          <AvatarImage 
                            src={getCloudinaryUrl(friend.id)}
                            onError={(e) => {
                              e.currentTarget.src = "/logo.png";
                            }}
                          />
                          <AvatarFallback>
                            {friend.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-foreground mb-1">{friend.full_name}</p>
                        <p className="text-sm text-muted-foreground mb-4">@{friend.username}</p>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full transition-all duration-200 hover:scale-105 active:scale-95" 
                          onClick={() => removeFriend(friend.username)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-muted/30 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Users className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">You haven't added any friends yet.</p>
                    <p className="text-sm text-muted-foreground mb-6">Start building your network by searching for people to connect with.</p>
                    <Button asChild className="transition-all duration-200 hover:scale-105">
                      <Link to="/search">Find Friends</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incoming Requests Tab */}
          <TabsContent value="incoming" className="animate-fade-in">
            <Card className="glass-effect hover-lift transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="gradient-text flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Incoming Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {incomingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {incomingRequests.map((req, index) => (
                      <div 
                        key={req.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover-lift glass-effect transition-all duration-300 hover:shadow-lg hover:scale-[1.01] animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 shadow-md ring-2 ring-secondary/20">
                            <AvatarImage src={req.users.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-secondary/30 to-secondary/20 text-secondary font-semibold">
                              {req.users.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{req.users.full_name}</p>
                            <p className="text-sm text-muted-foreground">@{req.users.username}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRequest(req)} 
                            className="transition-all duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" /> 
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => declineRequest(req.id)} 
                            className="transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <X className="w-4 h-4 mr-1" /> 
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UserPlus className="w-10 h-10 text-secondary" />
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">No new friend requests.</p>
                    <p className="text-sm text-muted-foreground">When someone sends you a friend request, it will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outgoing Requests Tab */}
          <TabsContent value="outgoing" className="animate-fade-in">
            <Card className="glass-effect hover-lift transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="gradient-text flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Sent Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {outgoingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {outgoingRequests.map((req, index) => (
                      <div 
                        key={req.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover-lift glass-effect transition-all duration-300 hover:shadow-lg hover:scale-[1.01] animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 shadow-md ring-2 ring-highlight/20">
                            <AvatarImage src={req.users.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-highlight/30 to-highlight/20 text-highlight font-semibold">
                              {req.users.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{req.users.full_name}</p>
                            <p className="text-sm text-muted-foreground">@{req.users.username}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => declineRequest(req.id)} 
                          className="transition-all duration-200 hover:scale-105 active:scale-95 border-highlight/30 text-highlight hover:bg-highlight/10"
                        >
                          <X className="w-4 h-4 mr-1" /> 
                          Cancel Request
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-highlight/20 to-highlight/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Clock className="w-10 h-10 text-highlight" />
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">You haven't sent any requests.</p>
                    <p className="text-sm text-muted-foreground mb-6">Find people you'd like to connect with and send them a friend request.</p>
                    <Button asChild className="transition-all duration-200 hover:scale-105">
                      <Link to="/search">Discover People</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const getCloudinaryUrl = (userId: string) => {
  return `https://res.cloudinary.com/ddlpuoyei/image/upload/v1753661631/user-photos/${userId}`;
};

export default Friends;