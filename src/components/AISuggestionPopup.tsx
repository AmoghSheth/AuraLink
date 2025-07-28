import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QlooService from "@/lib/qloo";

interface AISuggestionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  userProfile?: {
    interests: string[];
    values: string[];
    lifestyle: string[];
    openai_persona?: string;
    full_name?: string;
  } | null;
}

interface SuggestionCategory {
  category: string;
  suggestions: string[];
}

const AISuggestionPopup: React.FC<AISuggestionPopupProps> = ({
  isOpen,
  onClose,
  onSuggestionSelect,
  userProfile,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    if (!userProfile) {
      toast.error("User profile not available");
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    const toastId = toast.loading("AI is analyzing your interests...");

    try {
      // First, get QLOO recommendations
      toast.info("Getting personalized recommendations from Qloo...", {
        id: toastId,
      });

      const allUserData = [
        ...userProfile.interests,
        ...userProfile.values,
        ...userProfile.lifestyle,
      ];

      const qlooRecommendations =
        await QlooService.getMultiDomainRecommendations(
          userProfile.interests,
          userProfile.values,
          userProfile.lifestyle
        );

      // Process QLOO data into a readable format
      const qlooSummary = qlooRecommendations
        .map((domain) => {
          const items = domain.results
            .slice(0, 3)
            .map((item) => item.name)
            .join(", ");
          return `${domain.domain}: ${items}`;
        })
        .join("; ");

      // Now use Gemini to generate post suggestions based on QLOO data
      toast.info("Generating creative post ideas...", { id: toastId });

      const geminiPrompt = `
        You are a creative social media AI assistant. Generate engaging group post ideas based on a user's personality and interests.

        **User Profile:**
        - Name: ${userProfile.full_name || "User"}
        - Interests: ${userProfile.interests.join(", ")}
        - Values: ${userProfile.values.join(", ")}
        - Lifestyle: ${userProfile.lifestyle.join(", ")}
        - AI Persona: ${userProfile.openai_persona || "Not available"}
        
        **Personalized Recommendations from Qloo AI:**
        ${qlooSummary}

        **Task:**
        Generate 9 creative, engaging post ideas that this person could share in a group chat. Organize them into 3 categories with 3 suggestions each:

        1. **Discussion Starters**: Questions or topics that encourage group conversation
        2. **Personal Shares**: Things they could share about their interests, experiences, or thoughts
        3. **Group Activities**: Ideas for things the group could do together (online or offline)

        **Requirements:**
        - Each suggestion should be 1-2 sentences maximum
        - Make them feel authentic to the user's personality
        - Incorporate their interests and the Qloo recommendations naturally
        - Keep them friendly and group-appropriate
        - Make them engaging and likely to get responses

        **Format as JSON:**
        {
          "discussion_starters": ["idea1", "idea2", "idea3"],
          "personal_shares": ["idea1", "idea2", "idea3"],
          "group_activities": ["idea1", "idea2", "idea3"]
        }
      `;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: geminiPrompt }],
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error("Failed to generate suggestions");
      }

      const geminiData = await geminiResponse.json();
      const responseText =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const parsedSuggestions = JSON.parse(jsonMatch[0]);

      const formattedSuggestions: SuggestionCategory[] = [
        {
          category: "Discussion Starters",
          suggestions: parsedSuggestions.discussion_starters || [],
        },
        {
          category: "Personal Shares",
          suggestions: parsedSuggestions.personal_shares || [],
        },
        {
          category: "Group Activities",
          suggestions: parsedSuggestions.group_activities || [],
        },
      ];

      setSuggestions(formattedSuggestions);
      toast.success("AI suggestions generated!", { id: toastId });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    toast.success("Copied to clipboard!");
  };

  const handleUseSuggestion = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    onClose();
  };

  // Generate suggestions when popup opens
  React.useEffect(() => {
    if (isOpen && userProfile && suggestions.length === 0 && !isGenerating) {
      generateSuggestions();
    }
  }, [isOpen, userProfile]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 gradient-text">
            <Sparkles className="w-5 h-5" />
            AI Post Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-center">
                AI is analyzing your interests and generating personalized post
                ideas...
              </p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Here are some AI-generated post ideas based on your interests
                and personality:
              </p>

              {suggestions.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  <h3 className="font-semibold text-foreground border-b border-border/50 pb-2">
                    {category.category}
                  </h3>

                  <div className="space-y-2">
                    {category.suggestions.map((suggestion, suggestionIndex) => (
                      <Card
                        key={suggestionIndex}
                        className="glass-effect hover-lift"
                      >
                        <CardContent className="p-4">
                          <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                            {suggestion}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopySuggestion(suggestion)}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUseSuggestion(suggestion)}
                              className="flex-1"
                            >
                              Use This
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Ideas
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                Click "Generate Suggestions" to get AI-powered post ideas!
              </p>
              <Button
                onClick={generateSuggestions}
                disabled={isGenerating || !userProfile}
                className="mt-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Suggestions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionPopup;
