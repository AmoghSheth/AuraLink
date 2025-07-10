
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PersonaCard from "@/components/PersonaCard";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Filter, X, ArrowLeft } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = {
    age: ["18-25", "26-35", "36-45", "45+"],
    interests: ["Music", "Food", "Travel", "Art", "Sports", "Technology"],
    lifestyle: ["Minimalist", "Adventurous", "Homebody", "Social", "Creative"]
  };

  const searchResults = [
    {
      id: "2",
      name: "Holly Patterson",
      age: 28,
      bio: "Outdoor enthusiast who loves hiking, rock climbing, and discovering hidden gems in nature.",
      tags: ["hiking", "rock climbing", "photography", "sustainable living"],
      visibility: "public" as const,
      mutualFriends: 3,
    },
    {
      id: "3",
      name: "Alex Morgan", 
      age: 30,
      bio: "Coffee connoisseur and indie music lover. Always looking for the next great concert or cafe.",
      tags: ["indie music", "coffee", "vinyl records", "local venues"],
      visibility: "friends" as const,
      mutualFriends: 5,
    },
    {
      id: "4",
      name: "Emma Chen",
      age: 27,
      bio: "Food blogger passionate about fusion cuisine and sustainable cooking practices.",
      tags: ["food blogging", "fusion cuisine", "sustainability", "cooking"],
      visibility: "public" as const,
      mutualFriends: 1,
    },
  ];

  const handleAddFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

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

      <div className="container mx-auto px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover People</h1>
          <p className="text-muted-foreground">Find others who share your interests and values</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, interests, or values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filter}
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters([])}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-6 space-y-4 border-t pt-4">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-foreground mb-2 capitalize">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAddFilter(option)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            activeFilters.includes(option)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((person) => (
            <PersonaCard key={person.id} user={person} />
          ))}
        </div>

        {/* Empty State */}
        {searchQuery && searchResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {searchResults.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Results</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
