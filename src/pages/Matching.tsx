import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Sparkles, MessageCircle, X, Heart, ArrowLeft, RefreshCw, Mail, Phone, Cake } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import ChatPopup from "@/components/ChatPopup";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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
  email: string;
  phone_number: string;
  avatar_url: string;
}

// Define the structure for the AI-generated match details
interface MatchDetails {
  compatibilityScore: number;
  scoreReason: string;
  sharedInterests: string[];
  conversationStarters: string[];
  interactionTips: string[];
}

const Matching = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [isFinding, setIsFinding] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isChatPopupOpen, setChatPopupOpen] = useState(false);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const generateMatchDetails = useCallback(async (match: UserProfile, user: UserProfile) => {
    setIsFinding(true);
    setMatchDetails(null);
    try {
      const openAIPrompt = `
        You are a relationship AI. Analyze two user profiles and generate a compatibility report.
        **User A (Current User):**
        - Profile: ${JSON.stringify(user)}
        **User B (Potential Match):**
        - Profile: ${JSON.stringify(match)}
        **Your Task:**
        Generate a JSON object with the following structure:
        {
          "compatibilityScore": <A number between 60 and 98>,
          "scoreReason": "<A short reason for the score>",
          "sharedInterests": ["<3-4 key shared interests>"],
          "conversationStarters": ["<3 creative, open-ended questions for User A to ask User B>"],
          "interactionTips": ["<2-3 actionable tips for User A>"]
        }
      `;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: openAIPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("Failed to get AI-powered match details.");
      const data = await response.json();
      setMatchDetails(JSON.parse(data.choices[0].message.content));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsFinding(false);
    }
  }, []);

  const fetchAndProcessMatches = useCallback(async () => {
    setIsFinding(true);
    setHasStarted(true);
    setMatchDetails(null);
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) throw new Error("You must be logged in.");
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (profileError) throw new Error("Could not fetch your profile.");
      setCurrentUser(profile);
      const { data: otherUsers, error: usersError } = await supabase.from("users").select("*").neq("id", authUser.id);
      if (usersError) throw new Error("Could not fetch potential matches.");
      const shuffledMatches = shuffleArray(otherUsers || []);
      setPotentialMatches(shuffledMatches);
      setCurrentMatchIndex(0);
      if (shuffledMatches.length > 0) {
        await generateMatchDetails(shuffledMatches[0], profile);
      } else {
        setIsFinding(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsFinding(false);
    }
  }, [generateMatchDetails]);

  const handleInteraction = async (action: 'liked' | 'passed') => {
    if (isFinding || !currentUser || !currentMatch) return;

    // If the action is 'liked', just open the chat popup.
    if (action === 'liked') {
      setChatPopupOpen(true);
      return;
    }

    // If the action is 'passed', log it and move to the next match.
    if (action === 'passed') {
      const { error } = await supabase.from('match_history').upsert(
        {
          actor_username: currentUser.username,
          target_username: currentMatch.username,
          action: 'passed',
        },
        {
          onConflict: 'actor_username,target_username',
        }
      );

      if (error) {
        console.error(`Failed to log 'passed' action:`, error);
      }

      const nextIndex = currentMatchIndex + 1;
      if (nextIndex < potentialMatches.length) {
        setCurrentMatchIndex(nextIndex);
        generateMatchDetails(potentialMatches[nextIndex], currentUser);
      } else {
        toast.info("You've seen everyone! Let's shuffle and start again.");
        fetchAndProcessMatches();
      }
    }
  };

  const currentMatch = potentialMatches[currentMatchIndex];
  const personaCardUser = currentMatch ? { ...currentMatch, name: currentMatch.full_name, tags: currentMatch.interests } : null;

  const renderContent = () => {
    if (!hasStarted) {
      return (
        <Card className="text-center py-16 animate-scale-in">
          <CardContent>
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">Ready to meet someone new?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Our AI will find someone who shares your interests and values.</p>
            <Button size="lg" onClick={fetchAndProcessMatches} className="px-8" disabled={isFinding}>
              {isFinding ? "Loading..." : "Find Someone to Chat With"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (isFinding && !matchDetails) {
      return (
        <Card className="text-center py-16">
          <CardContent>
            <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Finding your perfect match...</h3>
            <p className="text-muted-foreground">Using AI to analyze taste compatibility</p>
          </CardContent>
        </Card>
      );
    }

    if (!currentMatch || !personaCardUser) {
      return <Card className="text-center py-16"><CardContent><h3 className="text-xl font-semibold">No more matches for now.</h3><p className="text-muted-foreground">Check back later!</p></CardContent></Card>;
    }

    return (
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <PersonaCard user={personaCardUser} showActions={false} />
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Heart className="w-5 h-5 text-destructive" />Compatibility Score</CardTitle></CardHeader>
            <CardContent>
              {!matchDetails ? <p className="text-muted-foreground">Generating details...</p> : (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{matchDetails.compatibilityScore}%</div>
                    <p className="text-muted-foreground text-sm">{matchDetails.scoreReason}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Shared Interests:</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchDetails.sharedInterests.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => handleInteraction('passed')}><X className="w-4 h-4 mr-2" />Pass</Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button className="flex-1" onClick={() => handleInteraction('liked')}><MessageCircle className="w-4 h-4 mr-2" />Chat</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    <AvatarImage src={currentMatch.avatar_url} />
                    <AvatarFallback>{currentMatch.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{currentMatch.full_name}</h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center pt-1"><Mail className="mr-2 h-3 w-3" />{currentMatch.email || "No email"}</div>
                      <div className="flex items-center pt-1"><Phone className="mr-2 h-3 w-3" />{currentMatch.phone_number || "No phone"}</div>
                      <div className="flex items-center pt-1"><Cake className="mr-2 h-3 w-3" />{currentMatch.age} years old</div>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Conversation Starters</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!matchDetails ? <p className="text-muted-foreground text-sm">Generating ideas...</p> : matchDetails.conversationStarters.map((starter, index) => <Card key={index} className="p-4 bg-muted/30"><p className="text-sm">{starter}</p></Card>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tips for Great Conversations</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {!matchDetails ? <p className="text-muted-foreground text-sm">Generating tips...</p> : matchDetails.interactionTips.map((tip, index) => <p key={index}>• {tip}</p>)}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Link to="/dashboard" className="flex items-center gap-2"><img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" /><span className="text-xl font-bold">AuraLink</span></Link>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Match</h1>
          <p className="text-muted-foreground">Discover people who share your interests and values</p>
        </div>
        {renderContent()}
        {hasStarted && !isFinding && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => handleInteraction('passed')} className="flex items-center gap-2"><RefreshCw className="w-4 h-4" />Find Another Match</Button>
          </div>
        )}
      </div>
      {currentMatch && (
        <ChatPopup
          isOpen={isChatPopupOpen}
          onClose={() => setChatPopupOpen(false)}
          user={{
            name: currentMatch.full_name,
            avatarUrl: currentMatch.avatar_url || '',
            email: currentMatch.email || 'No email provided',
            phone: currentMatch.phone_number || 'No phone provided',
            age: currentMatch.age,
            conversationTips: matchDetails?.conversationStarters || ["Start with a simple 'Hello!'"]
          }}
        />
      )}
    </div>
  );
};

export default Matching;