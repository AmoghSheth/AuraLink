
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    photo: null as File | null,
    username: "",
    age: "",
    bio: "",
    interests: [] as string[],
    values: [] as string[],
    lifestyle: [] as string[],
  });

  const interestOptions = [
    "Indie Music", "Coffee", "Hiking", "Photography", "Cooking", "Reading",
    "Art", "Travel", "Yoga", "Gaming", "Dancing", "Movies", "Fashion",
    "Technology", "Sports", "Gardening", "Wine", "Fitness", "Theatre"
  ];

  const valueOptions = [
    "Sustainability", "Authenticity", "Creativity", "Adventure", "Community",
    "Mindfulness", "Innovation", "Tradition", "Independence", "Family",
    "Learning", "Helping Others", "Excellence", "Simplicity"
  ];

  const lifestyleOptions = [
    "Early Bird", "Night Owl", "Homebody", "Social Butterfly", "Minimalist",
    "Maximalist", "Active", "Relaxed", "Spontaneous", "Planner", "Urban",
    "Nature Lover", "Foodie", "Health Conscious"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleValueToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.includes(value)
        ? prev.values.filter(v => v !== value)
        : [...prev.values, value]
    }));
  };

  const handleLifestyleToggle = (lifestyle: string) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("You are not logged in.");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Fetch user's full name from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        setIsLoading(false);
        console.error("Error fetching user's name:", userError);
        alert("Could not fetch your profile information to generate a persona.");
        return;
      }

      // 1. Save initial user data to Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({
          username: formData.username,
          age: formData.age ? parseInt(formData.age, 10) : null,
          bio: formData.bio,
          interests: formData.interests,
          "values": formData.values,
          lifestyle: formData.lifestyle,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (updateError) {
        setIsLoading(false);
        console.error("Error updating user profile:", updateError);
        // Check for unique constraint violation
        if (updateError.code === '23505') {
          alert("Username is already taken. Please choose another one.");
          setCurrentStep(1); // Go back to the first step
        } else {
          alert(`Failed to save your profile: ${updateError.message}`);
        }
        return;
      }

              // 2. Call OpenAI API to generate persona from all collected user data
      try {
        const allUserData = {
          name: userData.full_name,
          age: formData.age,
          bio: formData.bio,
          interests: formData.interests,
          values: formData.values,
          lifestyle: formData.lifestyle,
        };

        const openAIPrompt = `
          You are an expert in human personality and connection. Based on the detailed user profile for a person named ${allUserData.name}, create an insightful and engaging "Persona Card". 
          This card should be a short, vibrant paragraph (3-5 sentences) that captures their essence, making them sound like a real, interesting person someone would want to meet.

          Instructions:
          1.  **Synthesize, Don't Just List:** Do not just list the interests. Weave them into a narrative about the user's personality.
          2.  **Infer Personality:** What do their choices say about them? Are they adventurous, creative, a homebody, intellectual?
          3.  **Suggest Connection:** Briefly mention what they might be looking for in a friend or partner.
          4.  **Propose an Activity:** Suggest a fun, creative activity that aligns with their profile.
          5.  **Tone:** Make it sound warm, authentic, and appealing.

          **User Profile to Analyze:**
          - **Name:** ${allUserData.name}
          - **Age:** ${allUserData.age}
          - _
          - **Bio:** "${allUserData.bio}"
          - **Core Interests:** ${allUserData.interests.join(', ')}
          - **Guiding Values:** ${allUserData.values.join(', ')}
          - **Lifestyle:** ${allUserData.lifestyle.join(', ')}
        `;

        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: openAIPrompt }],
            max_tokens: 250,
            temperature: 0.75, // Slightly higher for more creative, less robotic text
            top_p: 0.9,
          }),
        });

        if (!openAIResponse.ok) {
          const errorText = await openAIResponse.text();
          throw new Error(`OpenAI API request failed: ${errorText}`);
        }

        const openAIData = await openAIResponse.json();
        const personaText = openAIData.choices[0].message.content.trim();

        // 3. Save the OpenAI-generated persona to Supabase
        const { error: finalUpdateError } = await supabase
          .from('users')
          .update({ 
            openai_persona: personaText,
            qloo_persona: null, // Ensure Qloo data is cleared if it existed before
          })
          .eq('id', user.id);

        if (finalUpdateError) {
          throw new Error(`Failed to save persona data: ${finalUpdateError.message}`);
        }

        // On success, navigate to dashboard
        setIsLoading(false);
        navigate("/dashboard");

      } catch (error) {
        setIsLoading(false);
        console.error("Error during persona generation:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
        // On error, user stays on the page and can retry
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6">
            <img 
              src="/logo.png" 
              alt="AuraLink Logo" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-foreground">AuraLink</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your PersonaCard</h1>
          <p className="text-muted-foreground mb-6">
            Help us understand your unique taste and personality
          </p>
          
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Your Interests"}
              {currentStep === 3 && "Core Values"}
              {currentStep === 4 && "Lifestyle Preferences"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
                    {formData.photo ? "📸" : "👤"}
                  </div>
                  <Button variant="outline" className="mb-4">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo (Optional)
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Tell us about yourself</Label>
                    <textarea
                      id="bio"
                      placeholder="What makes you unique? Share your passions, interests, or what you're looking for in connections..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 border rounded-md resize-none h-24 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Select your main interests and hobbies (choose 5-10):
                </p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        formData.interests.includes(interest)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {formData.interests.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected ({formData.interests.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} className="bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Values */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  What values are most important to you? (choose 3-6):
                </p>
                <div className="flex flex-wrap gap-2">
                  {valueOptions.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleValueToggle(value)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        formData.values.includes(value)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background text-muted-foreground border-border hover:border-accent"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {formData.values.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected ({formData.values.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.values.map((value) => (
                        <Badge key={value} className="bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Lifestyle */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  How would you describe your lifestyle? (choose 3-5):
                </p>
                <div className="flex flex-wrap gap-2">
                  {lifestyleOptions.map((lifestyle) => (
                    <button
                      key={lifestyle}
                      onClick={() => handleLifestyleToggle(lifestyle)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                        formData.lifestyle.includes(lifestyle)
                          ? "bg-highlight text-white border-highlight"
                          : "bg-background text-muted-foreground border-border hover:border-highlight"
                      }`}
                    >
                      {lifestyle}
                    </button>
                  ))}
                </div>
                {formData.lifestyle.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected ({formData.lifestyle.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.lifestyle.map((lifestyle) => (
                        <Badge key={lifestyle} className="bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm">
                          {lifestyle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === totalSteps && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-primary">Ready to create your PersonaCard!</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Qloo AI will analyze your preferences and create a unique PersonaCard that represents your taste and personality.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={isLoading}>
                {currentStep === totalSteps ? (
                  isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create PersonaCard
                    </>
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
