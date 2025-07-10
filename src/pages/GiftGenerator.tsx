import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Gift, Search, ArrowLeft, ExternalLink, Copy, Sparkles } from "lucide-react";

const GiftGenerator = () => {
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const friends = [
    {
      id: "2",
      name: "Holly Patterson",
      age: 28,
      tags: ["hiking", "photography", "sustainable living"],
      visibility: "public" as const,
    },
    {
      id: "3",
      name: "Alex Morgan",
      age: 30,
      tags: ["indie music", "coffee", "vinyl records"],
      visibility: "friends" as const,
    },
  ];

  const giftSuggestions = {
    physical: [
      {
        name: "Vintage Concert Poster",
        description: "Original poster from a 1980s indie band concert",
        price: "$45-65",
        link: "#",
        reason: "Matches their love for indie music and vintage aesthetics"
      },
      {
        name: "Premium Coffee Subscription",
        description: "3-month subscription to single-origin beans",
        price: "$89",
        link: "#",
        reason: "Perfect for their coffee enthusiasm"
      },
      {
        name: "Bluetooth Turntable",
        description: "Modern turntable with wireless connectivity",
        price: "$199",
        link: "#",
        reason: "Combines their love for vinyl with modern convenience"
      },
    ],
    experiences: [
      {
        name: "Intimate Concert Experience",
        description: "Tickets to underground venue showcase",
        price: "$35-50",
        link: "#",
        reason: "Aligns with their preference for authentic music experiences"
      },
      {
        name: "Coffee Cupping Class",
        description: "Learn professional coffee tasting techniques",
        price: "$75",
        link: "#",
        reason: "Educational experience matching their coffee interest"
      },
    ],
    digital: [
      {
        name: "Indie Music Playlist",
        description: "Curated playlist of emerging artists",
        price: "Free",
        link: "#",
        reason: "Thoughtful and personal gift based on shared taste"
      },
      {
        name: "Coffee Shop Guide App",
        description: "Premium subscription to local cafe discovery app",
        price: "$12/year",
        link: "#",
        reason: "Helps them discover new favorite spots"
      },
    ]
  };

  const handleGenerateGifts = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuggestions(true);
    }, 2000);
  };

  const selectedFriendData = friends.find(f => f.id === selectedFriend);

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
              <img 
                src="/lovable-uploads/88998c72-a532-4d1f-ba48-dca50d9b0bb0.png" 
                alt="AuraLink Logo" 
                className="w-6 h-6"
              />
              <span className="text-xl font-bold text-foreground">AuraLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Gift Generator</h1>
          <p className="text-muted-foreground">
            Get personalized gift suggestions based on someone's interests and personality
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Friend Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Select Friend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <Card 
                      key={friend.id}
                      className={`cursor-pointer transition-all ${
                        selectedFriend === friend.id 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedFriend(friend.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {friend.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">{friend.age} years old</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Or enter a username:</p>
                  <Input placeholder="@username" />
                </div>
              </CardContent>
            </Card>

            {selectedFriendData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <PersonaCard 
                    user={selectedFriendData} 
                    showActions={false}
                    variant="compact"
                  />
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleGenerateGifts}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Gift Ideas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gift Suggestions */}
          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Analyzing personality...</h3>
                  <p className="text-muted-foreground">
                    AI is creating personalized gift recommendations
                  </p>
                </CardContent>
              </Card>
            ) : showSuggestions ? (
              <div className="space-y-6">
                {Object.entries(giftSuggestions).map(([category, gifts]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category} Gifts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {gifts.map((gift, index) => (
                          <Card key={index} className="p-4 bg-muted/30">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{gift.name}</h4>
                                <p className="text-muted-foreground text-sm mb-2">
                                  {gift.description}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {gift.price}
                                </Badge>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button size="sm" variant="outline">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
                              <p className="text-sm text-muted-foreground">
                                <strong>Why this fits:</strong> {gift.reason}
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">Need more ideas?</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Get additional personalized suggestions
                    </p>
                    <Button variant="outline" onClick={handleGenerateGifts}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate More Ideas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-4">Select a friend to get started</h3>
                  <p className="text-muted-foreground">
                    Choose someone from your friends list or enter their username to generate 
                    personalized gift recommendations based on their interests.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftGenerator;
