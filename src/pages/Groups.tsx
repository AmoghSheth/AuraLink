// src/pages/Groups.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// simple UUIDv4 regex to filter out invalid entries
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface UDiscoverGroup {
  id: string;
  name: string;
  members: number;
  category: string;
  description: string;
  trending: boolean;
  joined: boolean;
  memberIds: string[];
}

interface UMyGroup {
  id: string;
  name: string;
  members: number;
  category: string;
  description: string;
  lastActivity: string;
  unreadMessages: number;
}

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"discover" | "my-groups">(
    "discover"
  );

  // fetched state
  const [myGroups, setMyGroups] = useState<UMyGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<UDiscoverGroup[]>(
    []
  );
  const [loadingGroups, setLoadingGroups] = useState(true);

  const categories = [
    "All",
    "Music",
    "Food",
    "Lifestyle",
    "Art",
    "Technology",
    "Travel",
  ];

  // Create Group dialog state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("Music");

  useEffect(() => {
    const loadGroups = async () => {
      setLoadingGroups(true);

      // get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMyGroups([]);
        setDiscoverGroups([]);
        setLoadingGroups(false);
        return;
      }

      // fetch joined group IDs
      const { data: joinedRaw, error: joinErr } = await supabase
        .from("groups")
        .select("id")
        .contains("members", [user.id]);
      if (joinErr) console.error("Error fetching joined groups IDs:", joinErr);
      const joinedIds = new Set(joinedRaw?.map((g) => g.id));

      // fetch all groups for Discover tab
      const { data: allGroups, error: allErr } = await supabase
        .from("groups")
        .select("id, name, description, tag, members");
      if (allErr) {
        console.error("Error fetching all groups:", allErr);
        setDiscoverGroups([]);
      } else {
        setDiscoverGroups(
          allGroups!.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description || "",
            category: g.tag,
            members: Array.isArray(g.members) ? g.members.length : 0,
            trending: false,
            joined: joinedIds.has(g.id),
            memberIds: Array.isArray(g.members) ? g.members : [],
          }))
        );
      }

      // fetch full details for My Groups tab
      const { data: joinedGroups, error: fullJoinErr } = await supabase
        .from("groups")
        .select("id, name, description, tag, members")
        .contains("members", [user.id]);
      if (fullJoinErr) {
        console.error("Error fetching joined group details:", fullJoinErr);
        setMyGroups([]);
      } else {
        setMyGroups(
          joinedGroups!.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description || "",
            category: g.tag,
            members: Array.isArray(g.members) ? g.members.length : 0,
            lastActivity: "",
            unreadMessages: 0,
          }))
        );
      }

      setLoadingGroups(false);
    };

    loadGroups();
  }, []);

  // Handler to join a group
  const handleJoinGroup = async (group: UDiscoverGroup) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to join a group");
      return;
    }
    if (group.joined) return;

    const validMemberIds = group.memberIds.filter((id) =>
      UUID_REGEX.test(id)
    );
    const newMemberIds = [...validMemberIds, user.id];

    const { error } = await supabase
      .from("groups")
      .update({ members: newMemberIds })
      .eq("id", group.id);

    if (error) {
      console.error("Error joining group:", error);
      toast.error("Could not join group");
    } else {
      toast.success(`Joined "${group.name}"`);
      // Update Discover local state
      setDiscoverGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                joined: true,
                members: g.members + 1,
                memberIds: newMemberIds,
              }
            : g
        )
      );
      // Add to My Groups
      setMyGroups((prev) => [
        ...prev,
        {
          id: group.id,
          name: group.name,
          description: group.description,
          category: group.category,
          members: group.members + 1,
          lastActivity: "",
          unreadMessages: 0,
        },
      ]);
    }
  };

  // Handler to create a new group
  const handleCreateGroup = async () => {
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a group");
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: newName,
        description: newDescription,
        tag: newTag,
        admin: user.id,
        members: [user.id],
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating group:", error);
      toast.error("Could not create group");
      setCreating(false);
      return;
    }

    toast.success(`Created "${data.name}"`);

    // prepend to both lists
    const newGroup: UDiscoverGroup = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      category: data.tag,
      members: 1,
      trending: false,
      joined: true,
      memberIds: [user.id],
    };
    setDiscoverGroups((prev) => [newGroup, ...prev]);
    setMyGroups((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        description: data.description || "",
        category: data.tag,
        members: 1,
        lastActivity: "",
        unreadMessages: 0,
      },
    ]);

    // reset form
    setNewName("");
    setNewDescription("");
    setNewTag("Music");
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background purple-glow-container">
      <div className="purple-glow" />
      {/* Navigation */}
      <nav className="border-b bg-card/30 backdrop-blur-xl glass-effect sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-all duration-200 hover:scale-125 hover:-translate-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 group"
              >
                <img
                  src="/logo.png"
                  alt="AuraLink Logo"
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-125"
                />
                <span className="text-xl font-display font-bold gradient-text transition-colors duration-200 group-hover:text-primary tracking-tight-pro">
                  AuraLink
                </span>
              </Link>
            </div>

            {/* <-- REPLACED LINK + BUTTON WITH DIALOG */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-glow">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Create Group</DialogTitle>
                  <DialogDescription>
                    Fill out all the following information to create a new group.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block font-medium">Name</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium">
                      Description
                    </label>
                    <Input
                      value={newDescription}
                      onChange={(e) =>
                        setNewDescription(e.target.value)
                      }
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Category</label>
                    <select
                      value={newTag}
                      onChange={(e) =>
                        setNewTag(e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                    >
                      {categories.slice(1).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" className="hover:scale-105 transition-transform duration-200">Cancel</Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={creating || !newName}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    {creating ? "Creating…" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* END DIALOG */}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2 animate-slide-in-left tracking-tight-pro">
            Groups
          </h1>
          <p
            className="text-muted-foreground text-lg animate-slide-in-right"
            style={{ animationDelay: "0.1s" }}
          >
            Connect with communities that share your passions
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 animate-fade-in-up glass-effect"
          style={{ animationDelay: "0.2s" }}
        >
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "discover"
                ? "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground shadow-lg scale-[1.05]"
                : "text-muted-foreground hover:text-foreground hover:scale-[1.02]"
            }`}
          >
            Discover Groups
          </button>
          <button
            onClick={() => setActiveTab("my-groups")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              activeTab === "my-groups"
                ? "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground shadow-lg scale-[1.05]"
                : "text-muted-foreground hover:text-foreground hover:scale-[1.02]"
            }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {activeTab === "discover" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card
              className="transition-all duration-300 hover:shadow-xl animate-fade-in-up glass-effect"
              style={{ animationDelay: "0.3s" }}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors duration-200" />
                    <Input
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category, idx) => (
                    <Badge
                      key={category}
                      className="cursor-pointer bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 px-3 py-1 text-sm transition-all duration-300 hover:scale-110 animate-slide-in-left shadow-md"
                      style={{ animationDelay: `${0.4 + idx * 0.05}s` }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discover Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingGroups ? (
                <p>Loading...</p>
              ) : discoverGroups.length ? (
                discoverGroups.map((group, idx) => (
                  <Card
                    key={group.id}
                    className="hover:shadow-xl transition-all duration-500 hover:scale-[1.05] group animate-fade-in-up glass-effect hover-lift"
                    style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2 transition-colors duration-300 group-hover:text-primary gradient-text">
                            {group.name}
                            {group.trending && (
                              <TrendingUp className="w-4 h-4 text-highlight animate-bounce-soft" />
                            )}
                          </CardTitle>
                          <Badge className="mt-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 px-3 py-1 text-sm transition-all duration-300 group-hover:scale-110 shadow-md">
                            {group.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4 transition-colors duration-300 group-hover:text-foreground/90">
                        {group.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Users className="w-4 h-4" /> {group.members} members
                        </div>
                        <Button
                          size="sm"
                          disabled={group.joined}
                          className={`transition-all duration-200 hover:scale-105 hover:shadow-md ${
                            group.joined
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleJoinGroup(group)}
                        >
                          {group.joined ? "Joined" : "Join Group"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No groups found.</p>
              )}
            </div>
          </div>
        ) : (
          /* My Groups */
          <div className="space-y-4">
            {loadingGroups ? (
              <p>Loading...</p>
            ) : myGroups.length ? (
              myGroups.map((group, idx) => (
                <Card
                  key={group.id}
                  className="hover:shadow-xl transition-all duration-500 group hover:scale-[1.03] animate-fade-in-up glass-effect hover-lift"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 shadow-lg">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg transition-colors duration-300 group-hover:text-primary gradient-text">
                                {group.name}
                              </h3>
                              {group.unreadMessages > 0 && (
                                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 px-3 py-1 text-sm animate-pulse shadow-md">
                                  {group.unreadMessages}
                                </Badge>
                              )}
                            </div>
                            <Badge className="mb-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 px-3 py-1 text-sm transition-all duration-300 group-hover:scale-110 shadow-md">
                              {group.category}
                            </Badge>
                            <p className="text-muted-foreground text-sm mb-2 transition-colors duration-300 group-hover:text-foreground/90">
                              {group.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {group.members} members
                              </span>
                              <span>Last activity: {group.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <Link to={`/groups/${group.id}`}>Open</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-16 animate-scale-in glass-effect">
                <CardContent>
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-6 animate-bounce-soft" />
                  <h3 className="text-2xl font-semibold mb-2 gradient-text">No groups yet</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Join some groups to start connecting with like-minded people
                  </p>
                  <Button
                    onClick={() => setActiveTab("discover")}
                    className="transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  >
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
