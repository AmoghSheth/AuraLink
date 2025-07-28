import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// This interface is designed to be compatible with the 'users' table in Supabase
interface PersonaCardUser {
  id: string;
  username: string;
  full_name: string;
  age: number;
  bio?: string;
  interests?: string[];
  values?: string[];
  lifestyle?: string[];
  openai_persona?: string;
  visibility?: "public" | "friends" | "private"; // Optional, for future use
  mutualFriends?: number; // Optional, for future use
}

interface PersonaCardProps {
  user: PersonaCardUser;
  variant?: "default" | "compact";
  showActions?: boolean;
  customActions?: React.ReactNode;
  onChatClick?: (user: PersonaCardUser) => void;
  onLikeClick?: (user: PersonaCardUser) => void;
  onShareClick?: (user: PersonaCardUser) => void;
  onAddFriendClick?: (user: PersonaCardUser) => void;
}

const PersonaCard = ({
  user,
  variant = "default",
  showActions = true,
  customActions,
  onChatClick,
  onLikeClick,
  onShareClick,
  onAddFriendClick,
}: PersonaCardProps) => {
  const isCompact = variant === "compact";
  const [showAllTags, setShowAllTags] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Combine interests, values, and lifestyle into a single array for display
  const tags = [
    ...(user.interests || []),
    ...(user.values || []),
    ...(user.lifestyle || []),
  ];
  const displayName = user.full_name || user.username || "Anonymous";
  const displayBio = user.openai_persona || user.bio || "";
  
  // Split bio into sentences and use the first complete sentence as preview
  const bioSentences = displayBio.split(/[.!?]+/).filter(sentence => sentence.trim());
  const firstSentence = bioSentences[0]?.trim();
  const isBioLong = bioSentences.length > 1;
  const truncatedBio = firstSentence ? firstSentence + (firstSentence.match(/[.!?]$/) ? '' : '.') : displayBio;

  const maxTagsToShow = isCompact ? 3 : 5;
  const hasMoreTags = tags.length > maxTagsToShow;

  return (
    <Card
      className={`group transition-all duration-500 hover:shadow-2xl hover:scale-[1.05] purple-glow-container ${
        isCompact ? "p-3" : "p-4"
      } border border-border/30 hover:border-primary/50 animate-fade-in bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-lg glass-effect`}
    >
      <div className="purple-glow" />
      <CardContent className={`${isCompact ? "p-3" : "p-6"} space-y-4`}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shadow-md">
            <AvatarImage 
              src={user.id ? getCloudinaryUrl(user.id) : "/logo.png"}
              alt={user.full_name}
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
            />
            <AvatarFallback>
              {user.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-display font-semibold text-foreground truncate transition-all duration-300 group-hover:text-primary tracking-tight gradient-text ${
                  isCompact ? "text-base" : "text-lg"
                }`}
              >
                {displayName}
              </h3>
              <span
                className={`text-muted-foreground ${
                  isCompact ? "text-xs" : "text-sm"
                }`}
              >
                {user.age}
              </span>
            </div>
            {user.mutualFriends && (
              <p className="text-xs text-muted-foreground animate-slide-in-right transition-colors duration-300 group-hover:text-primary/70">
                {user.mutualFriends} mutual friends
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {!isCompact && displayBio && (
          <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4 border border-border/20 transition-all duration-300 group-hover:border-primary/30">
            <div className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/90">
              {/* Show only first sentence as preview */}
              {truncatedBio && (
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="flex-1">{truncatedBio}</p>
                </div>
              )}
              
              {isBioLong && (
                <div className="flex justify-center pt-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Read More
                  </Button>
                </div>
              )}
            </div>
            {/* Dialog for full bio */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                    About {displayName}
                  </DialogTitle>
                </DialogHeader>
                <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                    {displayBio.split(/[.!?]+/).filter(sentence => sentence.trim()).map((sentence, index) => {
                      const trimmedSentence = sentence.trim();
                      if (!trimmedSentence) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="flex-1">{trimmedSentence}{sentence.includes('.') || sentence.includes('!') || sentence.includes('?') ? '' : '.'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(showAllTags ? tags : tags.slice(0, maxTagsToShow)).map(
            (tag, index) => (
              <Badge
                key={tag}
                className={`transition-all duration-300 hover:scale-110 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 px-3 py-1 text-sm animate-slide-in-left shadow-md hover:shadow-lg`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tag}
              </Badge>
            )
          )}
          {hasMoreTags && !showAllTags && (
            <Badge
              className="transition-all duration-300 hover:scale-110 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 px-3 py-1 text-sm cursor-pointer shadow-md"
              onClick={() => setShowAllTags(true)}
            >
              +{tags.length - maxTagsToShow} more
            </Badge>
          )}
          {showAllTags && hasMoreTags && (
            <Badge
              className="transition-all duration-300 hover:scale-110 bg-muted/80 text-muted-foreground hover:bg-muted/60 px-3 py-1 text-sm cursor-pointer"
              onClick={() => setShowAllTags(false)}
            >
              Show less
            </Badge>
          )}
        </div>

        {/* Actions */}
        {showActions &&
          (customActions ? (
            <>{customActions}</>
          ) : (
            <div
              className={`flex gap-2 ${
                isCompact ? "pt-2" : "pt-4"
              } opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0`}
            >
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold hover:scale-110 hover:shadow-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 glass-effect"
                onClick={() => onChatClick?.(user)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold hover:scale-110 hover:shadow-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 glass-effect"
                onClick={() => onShareClick?.(user)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold hover:scale-110 hover:shadow-xl hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 glass-effect"
                onClick={() => onAddFriendClick?.(user)}
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </Button>
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

export const getCloudinaryUrl = (userId: string) => {
  return `https://res.cloudinary.com/ddlpuoyei/image/upload/v1753661631/user-photos/${userId}`;
};

export default PersonaCard;
