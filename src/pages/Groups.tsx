
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
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            
            <Button className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg animate-pulse-glow">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 animate-slide-in-left tracking-tight-pro">Groups</h1>
          <p className="text-muted-foreground animate-slide-in-right" style={{animationDelay: '0.1s'}}>Connect with communities that share your passions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "discover"
                ? "bg-background text-foreground shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:scale-[1.01]"
            }`}
          >
            Discover Groups
          </button>
          <button
            onClick={() => setActiveTab("my-groups")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "my-groups"
                ? "bg-background text-foreground shadow-sm scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:scale-[1.01]"
            }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {activeTab === "discover" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-all duration-200" />
                    <Input
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <Badge
                      key={category}
                      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm transition-all duration-200 hover:scale-105 animate-slide-in-left"
                      style={{animationDelay: `${0.4 + index * 0.05}s`}}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discover Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverGroups.map((group, index) => (
                <Card 
                  key={group.id} 
                  className="hover:shadow-lg transition-all duration-300 hover:scale-[1.03] group animate-fade-in-up"
                  style={{animationDelay: `${0.5 + index * 0.1}s`}}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 transition-colors duration-200 group-hover:text-primary">
                          {group.name}
                          {group.trending && (
                            <TrendingUp className="w-4 h-4 text-highlight animate-bounce-soft" />
                          )}
                        </CardTitle>
                        <Badge className="mt-1 bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm transition-all duration-200 group-hover:scale-105">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 transition-colors duration-200 group-hover:text-foreground/80">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />
                        {group.members} members
                      </div>
                      <Button size="sm" className="transition-all duration-200 hover:scale-105 hover:shadow-md">Join Group</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* My Groups */
          <div className="space-y-4">
            {myGroups.map((group, index) => (
              <Card 
                key={group.id} 
                className="hover:shadow-md transition-all duration-300 group hover:scale-[1.02] animate-fade-in-up"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg transition-colors duration-200 group-hover:text-primary">{group.name}</h3>
                            {group.unreadMessages > 0 && (
                              <Badge className="bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm animate-pulse">
                                {group.unreadMessages}
                              </Badge>
                            )}
                          </div>
                          <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm transition-all duration-200 group-hover:scale-105">
                            {group.category}
                          </Badge>
                          <p className="text-muted-foreground text-sm mb-2 transition-colors duration-200 group-hover:text-foreground/80">
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
                    <Button asChild className="transition-all duration-200 hover:scale-105 hover:shadow-md">
                      <Link to={`/groups/${group.id}`}>
                        Open
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {myGroups.length === 0 && (
              <Card className="text-center py-12 animate-scale-in">
                <CardContent>
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-bounce-soft" />
                  <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Join some groups to start connecting with like-minded people
                  </p>
                  <Button onClick={() => setActiveTab("discover")} className="transition-all duration-200 hover:scale-105 hover:shadow-md">
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
