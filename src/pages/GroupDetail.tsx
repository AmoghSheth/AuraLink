import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, Send, Lightbulb, UserPlus, Settings, Share2 } from "lucide-react";

const GroupDetail = () => {
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState("");
  
  // Mock group data
  const group = {
    id: "1",
    name: "Indie Music Lovers NYC",
    members: 342,
    category: "Music",
    description: "Discovering underground artists and intimate venue experiences in the heart of New York City",
    created: "January 2024",
    visibility: "Open",
    isAdmin: false,
    isMember: true,
  };

  const messages = [
    {
      id: "1",
      user: "Alex M",
      avatar: "A",
      message: "Just discovered this amazing venue in Brooklyn - The Loft. Anyone been there?",
      timestamp: "2 hours ago",
      replies: 3,
    },
    {
      id: "2", 
      user: "Emma C",
      avatar: "E",
      message: "Has anyone heard of the band 'Neon Dreams'? They're playing at Mercury Lounge next week!",
      timestamp: "4 hours ago",
      replies: 7,
    },
    {
      id: "3",
      user: "Jordan S", 
      avatar: "J",
      message: "Looking for someone to check out the record stores in Williamsburg this weekend. Anyone interested?",
      timestamp: "1 day ago",
      replies: 2,
    },
  ];

  const aiSuggestions = [
    "Organize a vinyl listening party at Washington Square Park",
    "Group trip to record stores in Williamsburg", 
    "Attend the upcoming indie showcase at Baby's All Right",
    "Start a monthly music discovery thread",
  ];

  const recentMembers = [
    { name: "Sarah E", avatar: "S", joined: "2 days ago" },
    { name: "Mike R", avatar: "M", joined: "1 week ago" },
    { name: "Lisa K", avatar: "L", joined: "2 weeks ago" },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Send message logic here
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/groups">
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
          {/* Main Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Group Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground mb-1">{group.name}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{group.members} members</span>
                        <span>•</span>
                        <Badge variant="secondary">{group.category}</Badge>
                        <span>•</span>
                        <span>{group.visibility}</span>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-md">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {group.isAdmin && (
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Group Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {message.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.user}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{message.message}</p>
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                          {message.replies} replies
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                {group.isMember && (
                  <div className="flex gap-3 p-4 border-t">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                      S
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Share your thoughts with the group..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Member Status */}
            <Card>
              <CardContent className="p-4">
                {group.isMember ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm mb-2">You're a member!</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Leave Group
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm mb-2">Join this group</p>
                    <Button size="sm" className="w-full">
                      Join Group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-highlight" />
                  AI Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-highlight/5 border border-highlight/20 hover:bg-highlight/10 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate More Ideas
                </Button>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3" size="sm">
                  View All Members ({group.members})
                </Button>
              </CardContent>
            </Card>

            {/* Group Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Group Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{group.members}</div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">127</div>
                  <p className="text-sm text-muted-foreground">Messages Today</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-highlight">15</div>
                  <p className="text-sm text-muted-foreground">Active This Week</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
