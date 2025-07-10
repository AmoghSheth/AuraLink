import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Users, Search, UserPlus, Gift, MessageCircle, ArrowLeft, Calendar } from "lucide-react";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");

  const friends = [
    {
      id: "2",
      name: "Holly Patterson",
      age: 28,
      bio: "Outdoor enthusiast who loves hiking, photography, and discovering hidden gems.",
      tags: ["hiking", "photography", "sustainable living", "outdoor adventures"],
      visibility: "public" as const,
      overlapScore: 78,
      friendSince: "March 2024",
      lastActive: "2 hours ago",
      birthday: "April 15",
    },
    {
      id: "3",
      name: "Alex Morgan",
      age: 30,
      bio: "Coffee connoisseur and indie music lover. Always hunting for the next great cafe.",
      tags: ["indie music", "coffee", "vinyl records", "local venues"],
      visibility: "friends" as const,
      overlapScore: 85,
      friendSince: "January 2024",
      lastActive: "1 day ago",
      birthday: "June 22",
    },
    {
      id: "4",
      name: "Emma Chen",
      age: 27,
      bio: "Food blogger passionate about fusion cuisine and sustainable practices.",
      tags: ["food blogging", "fusion cuisine", "sustainability", "cooking"],
      visibility: "public" as const,
      overlapScore: 72,
      friendSince: "February 2024",
      lastActive: "3 hours ago",
      birthday: "September 8",
    },
  ];

  const friendRequests = [
    {
      id: "5",
      name: "Jordan Smith",
      age: 29,
      tags: ["indie music", "vinyl records", "coffee"],
      visibility: "public" as const,
      mutualFriends: 3,
    },
    {
      id: "6",
      name: "Maya Patel", 
      age: 26,
      tags: ["yoga", "sustainability", "meditation"],
      visibility: "friends" as const,
      mutualFriends: 2,
    },
  ];

  const upcomingBirthdays = friends.filter(friend => {
    // Mock logic - in real app would check actual dates
    return friend.birthday.includes("April") || friend.birthday.includes("June");
  });

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Friends</h1>
                <p className="text-muted-foreground">
                  {friends.length} connections • {friends.reduce((sum, f) => sum + f.overlapScore, 0) / friends.length}% avg compatibility
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Friend
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Requests ({friendRequests.length})
              </button>
            </div>

            {activeTab === "all" ? (
              <div className="space-y-6">
                {/* Search */}
                <Card>
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search friends by name or interests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Friends Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredFriends.map((friend) => (
                    <Card key={friend.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <PersonaCard user={friend} showActions={false} />
                        
                        {/* Friend Details */}
                        <div className="p-4 border-t bg-muted/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Friends since {friend.friendSince}</span>
                              <span>•</span>
                              <span>Active {friend.lastActive}</span>
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {friend.overlapScore}% match
                            </Badge>
                          </div>
                          
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

                {filteredFriends.length === 0 && searchQuery && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No friends found</h3>
                      <p className="text-muted-foreground">
                        Try a different search term
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              /* Friend Requests */
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <PersonaCard user={request} showActions={false} variant="compact" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm">Accept</Button>
                          <Button size="sm" variant="outline">Decline</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {friendRequests.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">
                        Friend requests will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Birthdays */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Upcoming Birthdays
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBirthdays.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBirthdays.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {friend.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{friend.name}</p>
                          <p className="text-xs text-muted-foreground">{friend.birthday}</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/gift">
                            <Gift className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No upcoming birthdays
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Friend Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Network Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{friends.length}</div>
                  <p className="text-sm text-muted-foreground">Total Friends</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(friends.reduce((sum, f) => sum + f.overlapScore, 0) / friends.length)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Compatibility</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-highlight">12</div>
                  <p className="text-sm text-muted-foreground">Groups in Common</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" />
                    Find New People
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/groups">
                    <Users className="w-4 h-4 mr-2" />
                    Join Groups
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
