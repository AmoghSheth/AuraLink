
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
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-110 hover:-translate-x-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="AuraLink Logo" 
                className="w-10 h-10 transition-transform duration-200 group-hover:scale-110"
              />
              <span className="text-xl font-display font-bold text-foreground transition-colors duration-200 group-hover:text-primary tracking-tight-pro">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 animate-slide-in-left tracking-tight-pro">Find Your Match</h1>
          <p className="text-muted-foreground animate-slide-in-right" style={{animationDelay: '0.1s'}}>
            Discover people who share your interests and values
          </p>
        </div>

        {/* Matching State */}
        {isMatching ? (
          <Card className="text-center py-16 animate-scale-in">
            <CardContent>
              <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 animate-pulse">Finding your perfect match...</h3>
              <p className="text-muted-foreground animate-shimmer bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent">
                Using AI to analyze taste compatibility
              </p>
            </CardContent>
          </Card>
        ) : match ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Match Card */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="animate-scale-in" style={{animationDelay: '0.2s'}}>
                <PersonaCard user={match} showActions={false} />
              </div>
              
              {/* Compatibility Score */}
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-destructive animate-pulse" />
                    Compatibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2 animate-bounce-soft">
                      {match.compatibility}%
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Based on shared interests and values
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Shared Interests:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.sharedInterests.map((interest, index) => (
                        <Badge 
                          key={interest} 
                          variant="secondary" 
                          className="bg-primary/10 text-primary transition-all duration-200 hover:scale-105 animate-slide-in-left"
                          style={{animationDelay: `${0.4 + index * 0.1}s`}}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <Button 
                  variant="outline" 
                  className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleNextMatch}
                >
                  <X className="w-4 h-4 mr-2" />
                  Pass
                </Button>
                <Button className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-lg animate-pulse-glow">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Conversation Starters */}
            <div className="space-y-6">
              <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <CardHeader>
                  <CardTitle>Conversation Starters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversationStarters.map((starter, index) => (
                    <Card 
                      key={index} 
                      className="p-4 bg-muted/30 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md animate-slide-in-right"
                      style={{animationDelay: `${0.7 + index * 0.1}s`}}
                    >
                      <p className="text-sm">{starter}</p>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '1.0s'}}>
                <CardHeader>
                  <CardTitle>Tips for Great Conversations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="transition-colors duration-200 hover:text-foreground">• Ask open-ended questions about their interests</p>
                  <p className="transition-colors duration-200 hover:text-foreground">• Share your own experiences and stories</p>
                  <p className="transition-colors duration-200 hover:text-foreground">• Be genuine and authentic</p>
                  <p className="transition-colors duration-200 hover:text-foreground">• Suggest meeting up if the conversation flows well</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Initial State */
          <Card className="text-center py-16 animate-scale-in">
            <CardContent>
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce-soft" />
              <h3 className="text-2xl font-semibold mb-4 animate-fade-in-up">Ready to meet someone new?</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Our AI will find someone who shares your interests and values for a meaningful connection.
              </p>
              <Button 
                size="lg" 
                onClick={handleFindMatch} 
                className="px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg animate-pulse-glow"
                style={{animationDelay: '0.4s'}}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Find Someone to Chat With
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Find Another Match */}
        {match && !isMatching && (
          <div className="text-center mt-8 animate-fade-in">
            <Button 
              variant="outline" 
              onClick={handleFindMatch}
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
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
