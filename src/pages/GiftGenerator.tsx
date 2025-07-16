import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Gift, Search, ArrowLeft, ExternalLink, Copy, Sparkles, UserX, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
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
}

// Define the structure for gift ideas
interface GiftIdea {
  name: string;
  description: string;
  price: string;
  link?: string;
  reason: string;
}

interface GiftSuggestions {
  physical: GiftIdea[];
  experiences: GiftIdea[];
  digital: GiftIdea[];
}

const GiftGenerator = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  const [isFetchingFriends, setIsFetchingFriends] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestions | null>(null);

  // Fetch current user and their friends
  useEffect(() => {
    const fetchFriends = async () => {
      setIsFetchingFriends(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("You must be logged in.");

        const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single();
        if (profileError) throw new Error("Could not fetch your profile.");
        setCurrentUser(profile);

        const friendUsernames = profile.friends || [];
        if (friendUsernames.length > 0) {
          const { data: friendsProfiles, error: friendsError } = await supabase.from("users").select("*").in("username", friendUsernames);
          if (friendsError) throw new Error("Could not fetch friends' profiles.");
          setFriends(friendsProfiles || []);
          setFilteredFriends(friendsProfiles || []);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsFetchingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  // Filter friends based on search query
  useEffect(() => {
    if (!friendSearchQuery) {
      setFilteredFriends(friends);
      return;
    }
    const lowercasedQuery = friendSearchQuery.toLowerCase();
    const results = friends.filter(friend =>
      friend.full_name.toLowerCase().includes(lowercasedQuery) ||
      friend.username.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredFriends(results);
  }, [friendSearchQuery, friends]);

  // Handle selecting a user from the list
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUsernameInput(""); // Clear manual input
    setGiftSuggestions(null); // Clear previous suggestions
  };

  // Handle fetching a user by manually entered username
  const handleFetchUserByUsername = async () => {
    if (!usernameInput.trim()) return;
    const username = usernameInput.trim().replace('@', '');
    
    const toastId = toast.loading(`Searching for user @${username}...`);
    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
      if (error || !data) {
        throw new Error("User not found.");
      }
      toast.success(`Found user @${username}!`, { id: toastId });
      setSelectedUser(data);
      setFriendSearchQuery(""); // Clear list selection
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
      setSelectedUser(null);
    }
  };

  // Main function to generate gift ideas
  const handleGenerateGifts = async () => {
    if (!selectedUser) {
      toast.error("Please select a user first.");
      return;
    }

    setIsGenerating(true);
    setGiftSuggestions(null);
    const toastId = toast.loading("AI is analyzing personality and interests...");

    try {
      toast.info("Building a creative prompt for Qloo...", { id: toastId });

      // Construct a detailed prompt for OpenAI
      const openAIPrompt = `
        You are a highly creative and thoughtful AI Gift Generator. Your task is to generate a curated list of gift ideas for a person based on their detailed profile.

        **User Profile to Analyze:**
        - **Name:** ${selectedUser.full_name}
        - **Age:** ${selectedUser.age}
        - **Bio:** "${selectedUser.bio}"
        - **Core Interests:** ${selectedUser.interests.join(', ')}
        - **Guiding Values:** ${selectedUser.values.join(', ')}
        - **Lifestyle:** ${selectedUser.lifestyle.join(', ')}
        - **AI-Generated Persona:** "${selectedUser.openai_persona}"

        **Your Task:**
        Generate a JSON object with three categories of gift ideas: "physical", "experiences", and "digital".
        - For each category, provide 2-3 unique and creative gift ideas.
        - For each gift, provide a "name", "description", an estimated "price" range (e.g., "$50-75", "Free", "$20/month"), and a "reason" explaining why this specific gift is a perfect fit for the person, referencing their profile details.
        - Ensure the output is a valid JSON object and nothing else. Do not include any introductory text or markdown formatting.

        **JSON Output Structure:**
        {
          "physical": [ { "name": "...", "description": "...", "price": "...", "reason": "..." } ],
          "experiences": [ { "name": "...", "description": "...", "price": "...", "reason": "..." } ],
          "digital": [ { "name": "...", "description": "...", "price": "...", "reason": "..." } ]
        }
      `;

      // Call OpenAI API
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: openAIPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.8,
        }),
      });

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        throw new Error(`OpenAI API request failed: ${errorText}`);
      }

      const openAIData = await openAIResponse.json();
      const giftIdeas = JSON.parse(openAIData.choices[0].message.content);
      
      setGiftSuggestions(giftIdeas);
      toast.success("Generated personalized gift ideas!", { id: toastId });

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Link to="/dashboard" className="flex items-center gap-2"><img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" /><span className="text-xl font-bold">AuraLink</span></Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Gift Generator</h1>
          <p className="text-muted-foreground">Personalized gift suggestions based on personality.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Friend Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5" />Select Friend</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search friends..." value={friendSearchQuery} onChange={(e) => setFriendSearchQuery(e.target.value)} className="pl-10" />
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {isFetchingFriends ? (
                    <p className="text-muted-foreground text-sm">Loading friends...</p>
                  ) : filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <Card key={friend.id} className={`cursor-pointer transition-all ${selectedUser?.id === friend.id ? "ring-2 ring-primary" : "hover:bg-accent"}`} onClick={() => handleSelectUser(friend)}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{friend.full_name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-sm">{friend.full_name}</p>
                            <p className="text-xs text-muted-foreground">@{friend.username}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No friends found.</p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Or enter a username:</p>
                  <div className="flex gap-2">
                    <Input placeholder="@username" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
                    <Button variant="secondary" onClick={handleFetchUserByUsername}><UserCheck className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedUser && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Selected Friend</CardTitle></CardHeader>
                <CardContent>
                  <PersonaCard user={selectedUser} showActions={false} variant="compact" />
                  <Button className="w-full mt-4" onClick={handleGenerateGifts} disabled={isGenerating}>
                    {isGenerating ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Gift Ideas</>}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gift Suggestions */}
          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card className="text-center py-16"><CardContent><div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div><h3 className="text-xl font-semibold mb-2">Analyzing personality...</h3><p className="text-muted-foreground">AI is creating personalized gift recommendations</p></CardContent></Card>
            ) : giftSuggestions ? (
              <div className="space-y-6">
                {Object.entries(giftSuggestions).map(([category, gifts]) => (
                  <Card key={category}>
                    <CardHeader><CardTitle className="capitalize">{category} Gifts</CardTitle></CardHeader>
                    <CardContent className="grid gap-4">
                      {(gifts as GiftIdea[]).map((gift, index) => (
                        <Card key={index} className="p-4 bg-muted/30">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{gift.name}</h4>
                              <p className="text-muted-foreground text-sm mb-2">{gift.description}</p>
                              <Badge className="bg-primary text-primary-foreground">{gift.price}</Badge>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(gift.name)}><Copy className="w-4 h-4" /></Button>
                              {gift.link && <a href={gift.link} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink className="w-4 h-4" /></Button></a>}
                            </div>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-3 border-l-4 border-primary"><p className="text-sm text-muted-foreground"><strong>Why this fits:</strong> {gift.reason}</p></div>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16"><CardContent><Gift className="w-16 h-16 text-muted-foreground mx-auto mb-6" /><h3 className="text-xl font-semibold mb-4">Select a friend to get started</h3><p className="text-muted-foreground">Choose someone from your friends list or enter their username to generate personalized gift recommendations.</p></CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftGenerator;