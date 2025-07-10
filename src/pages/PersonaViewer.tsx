
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserPlus, MessageCircle, Gift, Share2, Shield } from "lucide-react";

const PersonaViewer = () => {
  const { id } = useParams();
  
  // Mock user data - in real app would fetch by ID
  const user = {
    id: "2",
    name: "Holly Patterson",
    age: 28,
    bio: "Outdoor enthusiast who loves hiking, rock climbing, and discovering hidden gems in nature. Passionate about sustainable living and capturing the beauty of the world through photography. Always planning the next adventure and looking for fellow explorers to share the journey.",
    tags: ["hiking", "rock climbing", "photography", "sustainable living", "outdoor adventures", "nature", "travel", "camping"],
    visibility: "public" as const,
    mutualFriends: 3,
    friendSince: null,
    joinedDate: "March 2024",
    location: "San Francisco, CA",
    interests: {
      "Outdoor Activities": ["Hiking", "Rock Climbing", "Camping", "Trail Running"],
      "Creative": ["Photography", "Nature Writing", "Landscape Art"],
      "Lifestyle": ["Sustainable Living", "Minimalism", "Eco-friendly Products"],
      "Travel": ["National Parks", "Backpacking", "Adventure Travel"]
    },
    values: ["Sustainability", "Authenticity", "Adventure", "Mindfulness"],
    recentActivities: [
      "Joined group: Bay Area Hikers",
      "Shared photo from Yosemite trip",
      "Added new interest: Rock Climbing"
    ]
  };

  const isOwnProfile = false; // Would check against current user
  const isFriend = false; // Would check friend status

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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
                    H
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-1">{user.name}</h1>
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                          <span>{user.age} years old</span>
                          <span>•</span>
                          <span>{user.location}</span>
                          <span>•</span>
                          <span>Joined {user.joinedDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground capitalize">{user.visibility}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {user.bio}
                    </p>

                    {user.mutualFriends > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {user.mutualFriends} mutual friends
                        </Badge>
                      </div>
                    )}

                    {!isOwnProfile && (
                      <div className="flex gap-3">
                        {!isFriend ? (
                          <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                          </Button>
                        ) : (
                          <Button>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        )}
                        <Button variant="outline" asChild>
                          <Link to="/gift">
                            <Gift className="w-4 h-4 mr-2" />
                            Send Gift
                          </Link>
                        </Button>
                        <Button variant="outline">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Passions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(user.interests).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <Badge key={item} variant="secondary" className="bg-muted/50">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Core Values */}
            <Card>
              <CardHeader>
                <CardTitle>Core Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {user.values.map((value) => (
                    <Badge key={value} className="bg-accent/10 text-accent border-accent/20 px-4 py-2">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {user.tags.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">3</div>
                  <p className="text-sm text-muted-foreground">Groups</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-highlight">47</div>
                  <p className="text-sm text-muted-foreground">Connections</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.recentActivities.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <p className="text-muted-foreground">{activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mutual Connections */}
            {user.mutualFriends > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mutual Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock mutual friends */}
                    {["Alex Morgan", "Emma Chen", "Jordan Smith"].slice(0, user.mutualFriends).map((friend) => (
                      <div key={friend} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">
                            {friend.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{friend}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-3 text-xs">
                    View all mutual friends
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Compatibility Score */}
            {!isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Compatibility</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">78%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on shared interests and values
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Shared interests:</div>
                    <div className="flex flex-wrap gap-1">
                      {["photography", "sustainability", "outdoor adventures"].map((shared) => (
                        <Badge key={shared} variant="outline" className="text-xs">
                          {shared}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaViewer;
