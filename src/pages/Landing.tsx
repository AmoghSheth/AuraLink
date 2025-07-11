
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Sparkles, Gift, Search, Heart, Coffee, BookOpen, Calendar } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="AuraLink Logo" 
            className="w-12 h-12"
          />
          <span className="text-2xl font-display font-bold text-foreground tracking-tight-pro">AuraLink</span>
        </div>
        
        <div className="flex gap-4">
          <Link to="/login">
                          <Button variant="ghost" className="text-foreground hover:text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="gradient-primary text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight tracking-tight-pro text-balance">
            Connect Through
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-display font-bold"> Taste</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed-pro text-pretty">
            Express your personality, discover kindred spirits, and build meaningful connections 
            based on what you truly love — not just who you know.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-white px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                Create Your PersonaCard
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-accent hover:text-accent-foreground hover:border-accent">
                Explore Connections
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/20">
                <Users className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-primary tracking-tight">PersonaCards</h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Express your identity through taste, values, and lifestyle preferences
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-accent/20">
                <Search className="w-6 h-6 text-accent transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-accent tracking-tight">Smart Matching</h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Find people who share your vibe through AI-powered cultural intelligence
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-highlight/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-highlight/20">
                <Sparkles className="w-6 h-6 text-highlight transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-highlight tracking-tight">Social Groups</h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Join taste-based communities and discover new experiences together
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-destructive/20">
                <Gift className="w-6 h-6 text-destructive transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-destructive tracking-tight">Smart Gifting</h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Get AI-powered gift recommendations based on friends' personalities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seniors Use Cases Section */}
        <div className="bg-card rounded-2xl p-8 max-w-5xl mx-auto shadow-lg mb-20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground transition-colors duration-200 hover:text-primary tracking-tight-pro text-balance">Perfect for Active Seniors</h2>
          <p className="text-muted-foreground mb-8 text-lg transition-colors duration-200 hover:text-foreground">
            AuraLink helps mature adults find genuine friendships and meaningful activities based on shared interests and values.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-primary-foreground">
                <Coffee className="w-8 h-8 text-primary transition-all duration-200 group-hover:scale-110 group-hover:text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-primary-foreground tracking-tight">Coffee Companions</h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground/80">
                Find local friends who share your morning routine and favorite café spots
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-accent-foreground">
                <BookOpen className="w-8 h-8 text-accent transition-all duration-200 group-hover:scale-110 group-hover:text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-accent-foreground tracking-tight">Book Clubs</h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground/80">
                Connect with fellow readers and join discussions about your favorite genres
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-highlight hover:text-white rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-highlight/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-white">
                <Calendar className="w-8 h-8 text-highlight transition-all duration-200 group-hover:scale-110 group-hover:text-highlight" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-white tracking-tight">Activity Partners</h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-white/80">
                Discover walking groups, gardening clubs, and hobby enthusiasts nearby
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-destructive hover:text-destructive-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-destructive-foreground">
                <Heart className="w-8 h-8 text-destructive transition-all duration-200 group-hover:scale-110 group-hover:text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-destructive-foreground tracking-tight">Meaningful Bonds</h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-destructive-foreground/80">
                Build lasting friendships based on shared values and life experiences
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group">
          <h2 className="text-3xl font-display font-bold mb-4 transition-colors duration-200 group-hover:text-primary tracking-tight-pro text-balance">Ready to Connect?</h2>
          <p className="text-muted-foreground mb-6 transition-colors duration-200 group-hover:text-foreground">
            Join thousands of people building authentic relationships through shared culture and interests.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gradient-primary text-white px-8 py-4 transition-all duration-200 hover:scale-105 hover:shadow-xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 p-6 text-center text-muted-foreground">
        <p>&copy; 2025 AuraLink. Connecting hearts through taste.</p>
      </footer>
    </div>
  );
};

export default Landing;
