import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Users, Plus, Search, ArrowLeft, TrendingUp } from "lucide-react";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"discover" | "my-groups">("discover");

  const myGroups = [
    {
      id: "1",
      name: "Indie Music Lovers NYC",
      members: 342,
      category: "Music",
      description: "Discovering underground artists and intimate venue experiences",
      lastActivity: "2 hours ago",
      unreadMessages: 3,
    },
    {
      id: "2", 
      name: "Sustainable Living Community",
      members: 567,
      category: "Lifestyle",
      description: "Tips, tricks, and discussions about eco-friendly living",
      lastActivity: "1 day ago",
      unreadMessages: 0,
    },
  ];

  const discoverGroups = [
    {
      id: "3",
      name: "Ramen Enthusiasts",
      members: 234,
      category: "Food",
      description: "Exploring the best ramen spots and discussing authentic flavors",
      trending: true,
    },
    {
      id: "4",
      name: "Coffee Connoisseurs",
      members: 456,
      category: "Food & Drink", 
      description: "From single origins to brewing techniques",
      trending: false,
    },
    {
      id: "5",
      name: "Urban Photography",
      members: 189,
      category: "Art & Photography",
      description: "Capturing the soul of city life through our lenses",
      trending: true,
    },
    {
      id: "6",
      name: "Minimalist Living",
      members: 678,
      category: "Lifestyle",
      description: "Less is more - simplifying life for better experiences",
      trending: false,
    },
  ];

  const categories = ["All", "Music", "Food", "Lifestyle", "Art", "Technology", "Travel"];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Connect with communities that share your passions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "discover"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discover Groups
          </button>
          <button
            onClick={() => setActiveTab("my-groups")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "my-groups"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {activeTab === "discover" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discover Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {group.name}
                          {group.trending && (
                            <TrendingUp className="w-4 h-4 text-highlight" />
                          )}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />
                        {group.members} members
                      </div>
                      <Button size="sm">Join Group</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* My Groups */
          <div className="space-y-4">
            {myGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{group.name}</h3>
                            {group.unreadMessages > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {group.unreadMessages}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {group.category}
                          </Badge>
                          <p className="text-muted-foreground text-sm mb-2">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.members} members
                            </span>
                            <span>Last activity: {group.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link to={`/groups/${group.id}`}>
                        Open
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {myGroups.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Join some groups to start connecting with like-minded people
                  </p>
                  <Button onClick={() => setActiveTab("discover")}>
                    Discover Groups
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
