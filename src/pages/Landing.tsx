
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Sparkles, Gift, Search } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="text-2xl font-bold text-foreground">AuraLink</span>
        </div>
        
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="gradient-primary text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect Through
            <span className="gradient-primary bg-clip-text text-transparent"> Taste</span>
          </h1>
          
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Express your personality, discover kindred spirits, and build meaningful connections 
            based on what you truly love — not just who you know.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-white px-8 py-4 text-lg">
                Create Your PersonaCard
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Explore Connections
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">PersonaCards</h3>
              <p className="text-muted-foreground text-sm">
                Express your identity through taste, values, and lifestyle preferences
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-muted-foreground text-sm">
                Find people who share your vibe through AI-powered cultural intelligence
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-highlight/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-highlight" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Social Groups</h3>
              <p className="text-muted-foreground text-sm">
                Join taste-based communities and discover new experiences together
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-transform duration-200">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Gifting</h3>
              <p className="text-muted-foreground text-sm">
                Get AI-powered gift recommendations based on friends' personalities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of people building authentic relationships through shared culture and interests.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gradient-primary text-white px-8 py-4">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 p-6 text-center text-muted-foreground">
        <p>&copy; 2024 AuraLink. Connecting hearts through taste.</p>
      </footer>
    </div>
  );
};

export default Landing;
