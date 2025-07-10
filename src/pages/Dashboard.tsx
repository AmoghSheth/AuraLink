
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Search, Users, Sparkles, Gift, Settings } from "lucide-react";

const Dashboard = () => {
  // Mock user data
  const currentUser = {
    id: "1",
    name: "Sarah Evans",
    age: 32,
    bio: "Your aura blends alternative rock, spicy food, and eco-consciousness. You're drawn to intimate concerts, farm-to-table restaurants, and walks...",
    tags: ["indie rock", "spicy food", "sustainability", "farm-to-table", "concerts"],
    visibility: "friends" as const,
  };

  const recentMatches = [
    {
      id: "2",
      name: "Holly P",
      age: 28,
      tags: ["outdoor", "enthusiast"],
      visibility: "public" as const,
      mutualFriends: 2,
    },
    {
      id: "3", 
      name: "Alex M",
      age: 30,
      tags: ["indie music", "coffee", "books"],
      visibility: "friends" as const,
      mutualFriends: 5,
    },
  ];

  const suggestedGroups = [
    { id: "1", name: "Ramen Lovers", members: 234, category: "Food" },
    { id: "2", name: "Indie Music NYC", members: 456, category: "Music" },
    { id: "3", name: "Sustainable Living", members: 789, category: "Lifestyle" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-foreground">AuraLink</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link to="/match">
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Match
                </Button>
              </Link>
              <Link to="/groups">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </Button>
              </Link>
              <Link to="/gift">
                <Button variant="ghost" size="sm">
                  <Gift className="w-4 h-4 mr-2" />
                  Gift
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your PersonaCard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your PersonaCard
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/settings">Edit</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PersonaCard user={currentUser} showActions={false} />
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Matches
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/match">Find More</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {recentMatches.map((match) => (
                    <PersonaCard 
                      key={match.id} 
                      user={match} 
                      variant="compact"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Holly P added you as a friend</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New group suggestion: "Coffee Connoisseurs"</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/match">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Someone to Chat
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/search">
                    <Search className="w-4 h-4 mr-2" />
                    Search People
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/gift">
                    <Gift className="w-4 h-4 mr-2" />
                    Generate Gift Ideas
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Suggested Groups */}
            <Card>
              <CardHeader>
                <CardTitle>Groups to Join</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.members} members</p>
                      </div>
                      <Button size="sm" variant="outline">Join</Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3" asChild>
                  <Link to="/groups">View All Groups</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Friends Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">47</div>
                  <p className="text-sm text-muted-foreground mb-4">Friends connected</p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/friends">View All Friends</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
