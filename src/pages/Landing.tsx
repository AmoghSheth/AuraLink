import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Users,
  Sparkles,
  Gift,
  Search,
  Heart,
  Coffee,
  BookOpen,
  Calendar,
} from "lucide-react";
import React, { useRef, useEffect } from "react";

const Landing = () => {
  // Pink glow effect logic
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    };
    hero.addEventListener("mousemove", handleMouseMove);
    return () => hero.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AuraLink Logo" className="w-12 h-12" />
          <span className="text-2xl font-display font-bold text-foreground tracking-tight-pro">
            AuraLink
          </span>
        </div>

        <div className="flex gap-4">
          <Link to="/login">
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary"
            >
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
      <div
        ref={heroRef}
        className="relative container mx-auto px-6 py-20 text-center overflow-hidden"
      >
        {/* Pink Glow Follower */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute z-0 hidden md:block"
          style={{
            width: "320px",
            height: "160px",
            background:
              "radial-gradient(ellipse at center, #ffb6d5 0%, #fff0 80%)",
            filter: "blur(60px)",
            opacity: 0.5,
            transform: "translate(-50%, -50%)",
            transition: "opacity 0.2s",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground mb-6 leading-tight tracking-tight-pro text-balance drop-shadow-lg">
            <span className="block text-transparent bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 bg-clip-text animate-pulse">
              Unleash Your True Self
            </span>
            <span className="block mt-2">
              with the{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-display font-bold">
                World's First PersonaCard
              </span>
            </span>
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed-pro text-pretty font-medium animate-fade-in">
            Not just another social app. AuraLink is where your beliefs, values,
            quirks, and passions become your superpower. Find your tribe. Spark
            real conversations.{" "}
            <span className="text-pink-500 font-bold">
              Vibe with your kind.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button
                size="lg"
                className="gradient-primary text-white px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-pink-200"
              >
                Create Your PersonaCard
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-accent hover:text-accent-foreground hover:border-accent"
              >
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
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-primary tracking-tight">
                PersonaCards
              </h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Express your identity through taste, values, and lifestyle
                preferences
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-accent/20">
                <Search className="w-6 h-6 text-accent transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-accent tracking-tight">
                Smart Matching
              </h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Find people who share your vibe through AI-powered cultural
                intelligence
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-highlight/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-highlight/20">
                <Sparkles className="w-6 h-6 text-highlight transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-highlight tracking-tight">
                Social Groups
              </h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Join taste-based communities and discover new experiences
                together
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl group">
            <CardContent className="text-center p-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-destructive/20">
                <Gift className="w-6 h-6 text-destructive transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-destructive tracking-tight">
                Smart Gifting
              </h3>
              <p className="text-muted-foreground text-sm transition-colors duration-200 group-hover:text-foreground">
                Get AI-powered gift recommendations based on friends'
                personalities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seniors Use Cases Section */}
        <div className="bg-card rounded-2xl p-8 max-w-5xl mx-auto shadow-lg mb-20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground transition-colors duration-200 hover:text-primary tracking-tight-pro text-balance">
            Perfect for Active Seniors
          </h2>
          <p className="text-muted-foreground mb-8 text-lg transition-colors duration-200 hover:text-foreground">
            AuraLink helps mature adults find genuine friendships and meaningful
            activities based on shared interests and values.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-primary-foreground">
                <Coffee className="w-8 h-8 text-primary transition-all duration-200 group-hover:scale-110 group-hover:text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-primary-foreground tracking-tight">
                Coffee Companions
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground/80">
                Find local friends who share your morning routine and favorite
                café spots
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-accent-foreground">
                <BookOpen className="w-8 h-8 text-accent transition-all duration-200 group-hover:scale-110 group-hover:text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-accent-foreground tracking-tight">
                Book Clubs
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground/80">
                Connect with fellow readers and join discussions about your
                favorite genres
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-highlight hover:text-white rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-highlight/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-white">
                <Calendar className="w-8 h-8 text-highlight transition-all duration-200 group-hover:scale-110 group-hover:text-highlight" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-white tracking-tight">
                Activity Partners
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-white/80">
                Discover walking groups, gardening clubs, and hobby enthusiasts
                nearby
              </p>
            </div>

            <div className="text-center transition-all duration-300 hover:scale-105 hover:bg-destructive hover:text-destructive-foreground rounded-lg p-4 hover:shadow-lg group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-destructive-foreground">
                <Heart className="w-8 h-8 text-destructive transition-all duration-200 group-hover:scale-110 group-hover:text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 transition-colors duration-200 group-hover:text-destructive-foreground tracking-tight">
                Meaningful Bonds
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-destructive-foreground/80">
                Build lasting friendships based on shared values and life
                experiences
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group mt-16">
          <h2 className="text-3xl font-display font-bold mb-4 transition-colors duration-200 group-hover:text-primary tracking-tight-pro text-balance">
            Ready to Connect?
          </h2>
          <p className="text-muted-foreground mb-6 transition-colors duration-200 group-hover:text-foreground text-lg">
            Join thousands of people building authentic relationships through
            shared culture and interests.{" "}
            <span className="text-pink-500 font-semibold">
              Be the first to experience the future of connection.
            </span>
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="gradient-primary text-white px-8 py-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto py-24 px-4">
          <h2 className="text-4xl font-display font-extrabold text-center mb-10 text-foreground">
            How AuraLink Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white/80 rounded-xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <span className="text-5xl mb-4">🪪</span>
              <h3 className="font-bold text-xl mb-2">Craft Your PersonaCard</h3>
              <p className="text-muted-foreground text-center">
                Showcase your beliefs, values, quirks, and favorites. Your
                digital soul, beautifully captured.
              </p>
            </div>
            <div className="bg-white/80 rounded-xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <span className="text-5xl mb-4">🤝</span>
              <h3 className="font-bold text-xl mb-2">Get Matched Instantly</h3>
              <p className="text-muted-foreground text-center">
                Our AI finds people who truly vibe with you. No more small talk,
                just real connections.
              </p>
            </div>
            <div className="bg-white/80 rounded-xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <span className="text-5xl mb-4">💬</span>
              <h3 className="font-bold text-xl mb-2">Start Meaningful Chats</h3>
              <p className="text-muted-foreground text-center">
                Jump into conversations that matter. Share, laugh, and grow with
                your new friends.
              </p>
            </div>
          </div>
        </div>

        {/* Why AuraLink Section */}
        <div className="bg-gradient-to-r from-pink-50 via-fuchsia-50 to-indigo-50 py-20 px-4">
          <h2 className="text-4xl font-display font-extrabold text-center mb-10 text-foreground">
            Why AuraLink?
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-2xl text-pink-500">
                ✨ 100% You, 0% Algorithmic Fakeness
              </h3>
              <p className="text-muted-foreground">
                No swiping, no pretending. Just your real self, celebrated and
                matched.
              </p>
              <h3 className="font-bold text-2xl text-fuchsia-500">
                🌱 Grow Your Social Garden
              </h3>
              <p className="text-muted-foreground">
                Find friends, mentors, and activity partners who share your
                passions and values.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-2xl text-indigo-500">
                🧑‍🦳 Especially for Seniors
              </h3>
              <p className="text-muted-foreground">
                Bored? Lonely? AuraLink is your gateway to vibrant conversations
                and new adventures, at any age.
              </p>
              <h3 className="font-bold text-2xl text-pink-400">
                🚀 Be a Pioneer
              </h3>
              <p className="text-muted-foreground">
                Join the world's first platform to put your personality at the
                center of connection.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white py-20 px-4">
          <h2 className="text-4xl font-display font-extrabold text-center mb-12 text-foreground">
            What Our Users Say
          </h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
            <div className="bg-pink-50 rounded-xl shadow-lg p-8 flex flex-col items-center">
              <span className="text-4xl mb-4">🌸</span>
              <p className="text-lg italic mb-4">
                “AuraLink helped me find a book club and a walking group in my
                neighborhood. I feel young again!”
              </p>
              <span className="font-bold text-pink-500">— Margaret, 68</span>
            </div>
            <div className="bg-fuchsia-50 rounded-xl shadow-lg p-8 flex flex-col items-center">
              <span className="text-4xl mb-4">💖</span>
              <p className="text-lg italic mb-4">
                “I never thought I’d make new friends after retirement. Now I
                chat every day with people who get me.”
              </p>
              <span className="font-bold text-fuchsia-500">— Raj, 72</span>
            </div>
            <div className="bg-indigo-50 rounded-xl shadow-lg p-8 flex flex-col items-center">
              <span className="text-4xl mb-4">🌟</span>
              <p className="text-lg italic mb-4">
                “The PersonaCard is genius! It’s so easy to show who I am and
                find my kind of people.”
              </p>
              <span className="font-bold text-indigo-500">— Jamie, 34</span>
            </div>
          </div>
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
