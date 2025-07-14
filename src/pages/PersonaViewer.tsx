import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserPlus, MessageCircle, Gift, Share2, Shield, Music, Film, Book, Podcast, ShoppingBag, Utensils, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import QlooService from "@/lib/qloo";

// Define the types for our user and Qloo data
interface UserProfile {
  id: string;
  full_name: string;
  age: number;
  bio: string;
  interests: string[];
  values: string[];
  lifestyle: string[];
  qloo_persona?: {
    data: {
      domain: string;
      results: { name: string; image_url?: string }[];
    }[];
  };
}

interface QlooRecommendation {
  id: string;
  name: string;
  image_url?: string;
  score?: number;
}

const PersonaViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qlooRecommendations, setQlooRecommendations] = useState<{ domain: string; results: QlooRecommendation[] }[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*, qloo_persona:qloo_persona->data")
          .eq("id", id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const fetchQlooRecommendations = async () => {
    if (!user) return;

    setLoadingRecommendations(true);
    try {
      const recommendations = await QlooService.getMultiDomainRecommendations(
        user.interests,
        user.values,
        user.lifestyle
      );
      
      setQlooRecommendations(recommendations);
      
      // Optionally save to database
      await supabase
        .from("users")
        .update({
          qloo_persona: {
            data: recommendations,
            updated_at: new Date().toISOString()
          }
        })
        .eq("id", user.id);
        
    } catch (error) {
      console.error("Error fetching Qloo recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Auto-fetch recommendations when user is loaded
  useEffect(() => {
    if (user && !user.qloo_persona?.data) {
      fetchQlooRecommendations();
    }
  }, [user]);

  const getIconForDomain = (domain: string) => {
    switch (domain) {
      case "music": return <Music className="w-5 h-5 mr-2" />;
      case "film": return <Film className="w-5 h-5 mr-2" />;
      case "books": return <Book className="w-5 h-5 mr-2" />;
      case "podcasts": return <Podcast className="w-5 h-5 mr-2" />;
      case "fashion": return <ShoppingBag className="w-5 h-5 mr-2" />;
      case "dining": return <Utensils className="w-5 h-5 mr-2" />;
      default: return null;
    }
  };

  if (loading) return <div className="text-center p-10">Loading profile...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!user) return <div className="text-center p-10">User not found.</div>;

  // Mock data for parts not yet in DB
  const isOwnProfile = false;
  const isFriend = false;
  const mutualFriends = 3;

  // Use live recommendations if available, otherwise fall back to stored data
  const displayRecommendations = qlooRecommendations.length > 0 
    ? qlooRecommendations 
    : user.qloo_persona?.data || [];

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
              <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" />
              <span className="text-xl font-display font-bold text-foreground tracking-tight-pro">AuraLink</span>
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
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-display font-bold text-foreground mb-1 tracking-tight-pro">{user.full_name}</h1>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm mb-3">
                      <span>{user.age} years old</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">{user.bio}</p>
                    {!isOwnProfile && (
                      <div className="flex gap-3">
                        {!isFriend ? (
                          <Button><UserPlus className="w-4 h-4 mr-2" />Add Friend</Button>
                        ) : (
                          <Button><MessageCircle className="w-4 h-4 mr-2" />Message</Button>
                        )}
                        <Button variant="outline" asChild><Link to="/gift"><Gift className="w-4 h-4 mr-2" />Send Gift</Link></Button>
                        <Button variant="outline"><Share2 className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qloo Persona Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI-Generated Persona (Qloo Taste AI™)</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQlooRecommendations}
                    disabled={loadingRecommendations}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingRecommendations ? 'animate-spin' : ''}`} />
                    {loadingRecommendations ? 'Updating...' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRecommendations && displayRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Generating personalized recommendations...</p>
                  </div>
                ) : displayRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {displayRecommendations.map((domainData) => (
                      <div key={domainData.domain}>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide flex items-center">
                          {getIconForDomain(domainData.domain)} {domainData.domain}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {domainData.results.map((item, idx) => {
                            // Type guard for score
                            const hasScore = typeof (item as any).score !== 'undefined';
                            return (
                            <Badge 
                                key={item.name + idx}
                              className="bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm"
                                title={hasScore ? `Score: ${(item as any).score}` : undefined}
                            >
                              {item.name}
                            </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No recommendations generated yet.</p>
                    <Button onClick={fetchQlooRecommendations} disabled={loadingRecommendations}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests & Values */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[...user.interests, ...user.values, ...user.lifestyle].map((tag) => (
                    <Badge key={tag} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 text-sm">
                      {tag}
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
                  <div className="text-2xl font-bold text-primary">{user.interests.length}</div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{user.values.length}</div>
                  <p className="text-sm text-muted-foreground">Values</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-highlight">{user.lifestyle.length}</div>
                  <p className="text-sm text-muted-foreground">Lifestyle</p>
                </div>
                {displayRecommendations.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {displayRecommendations.reduce((acc, domain) => acc + domain.results.length, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">AI Recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaViewer;