
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Sparkles, MessageCircle, X, Heart, ArrowLeft, RefreshCw } from "lucide-react";

const Matching = () => {
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isMatching, setIsMatching] = useState(false);

  const potentialMatches = [
    {
      id: "5",
      name: "Jordan Smith",
      age: 29,
      bio: "Coffee enthusiast and vinyl collector. Love discovering new indie bands and cozy bookshops.",
      tags: ["indie music", "vinyl records", "coffee", "books", "local venues"],
      visibility: "public" as const,
      mutualFriends: 2,
      compatibility: 89,
      sharedInterests: ["indie music", "coffee", "books"],
    },
    {
      id: "6", 
      name: "Maya Patel",
      age: 26,
      bio: "Sustainable living advocate who enjoys yoga, farmers markets, and cooking plant-based meals.",
      tags: ["sustainability", "yoga", "plant-based", "farmers markets", "meditation"],
      visibility: "friends" as const,
      mutualFriends: 4,
      compatibility: 76,
      sharedInterests: ["sustainability", "meditation"],
    },
  ];

  const conversationStarters = [
    "I noticed you're into indie music too! Have you discovered any great new artists lately?",
    "Your taste in coffee spots seems amazing. What's your favorite local cafe?",
    "I love that we both value sustainability. Any recent eco-friendly discoveries?"
  ];

  const handleFindMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setCurrentMatch(0);
    }, 2000);
  };

  const handleNextMatch = () => {
    if (currentMatch < potentialMatches.length - 1) {
      setCurrentMatch(currentMatch + 1);
    } else {
      setCurrentMatch(0);
    }
  };

  const match = potentialMatches[currentMatch];

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
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Match</h1>
          <p className="text-muted-foreground">
            Discover people who share your interests and values
          </p>
        </div>

        {/* Matching State */}
        {isMatching ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Finding your perfect match...</h3>
              <p className="text-muted-foreground">
                Using AI to analyze taste compatibility
              </p>
            </CardContent>
          </Card>
        ) : match ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Match Card */}
            <div className="space-y-6">
              <PersonaCard user={match} showActions={false} />
              
              {/* Compatibility Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-destructive" />
                    Compatibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {match.compatibility}%
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Based on shared interests and values
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Shared Interests:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.sharedInterests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="bg-primary/10 text-primary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleNextMatch}
                >
                  <X className="w-4 h-4 mr-2" />
                  Pass
                </Button>
                <Button className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Conversation Starters */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Starters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversationStarters.map((starter, index) => (
                    <Card key={index} className="p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <p className="text-sm">{starter}</p>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips for Great Conversations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Ask open-ended questions about their interests</p>
                  <p>• Share your own experiences and stories</p>
                  <p>• Be genuine and authentic</p>
                  <p>• Suggest meeting up if the conversation flows well</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Initial State */
          <Card className="text-center py-16">
            <CardContent>
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Ready to meet someone new?</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Our AI will find someone who shares your interests and values for a meaningful connection.
              </p>
              <Button size="lg" onClick={handleFindMatch} className="px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Find Someone to Chat With
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Find Another Match */}
        {match && !isMatching && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleFindMatch}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Find Another Match
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
