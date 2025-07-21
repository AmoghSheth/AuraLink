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
  const maxBioLength = 120;
  const isBioLong = displayBio.length > maxBioLength;
  const truncatedBio = isBioLong
    ? displayBio.slice(0, maxBioLength) + "..."
    : displayBio;

  const maxTagsToShow = isCompact ? 3 : 5;
  const hasMoreTags = tags.length > maxTagsToShow;

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.03] ${
        isCompact ? "p-3" : "p-4"
      } border border-border/50 hover:border-primary/30 animate-fade-in bg-gradient-to-br from-card to-card/80 backdrop-blur-sm`}
    >
      <CardContent className={`${isCompact ? "p-3" : "p-6"} space-y-4`}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className={`${
              isCompact ? "w-16 h-16" : "w-20 h-20"
            } rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-display font-semibold text-foreground truncate transition-colors duration-200 group-hover:text-primary tracking-tight ${
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
              <p className="text-xs text-muted-foreground animate-slide-in-right">
                {user.mutualFriends} mutual friends
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {!isCompact && displayBio && (
          <div className="text-sm text-muted-foreground leading-relaxed transition-colors duration-200 group-hover:text-foreground/80">
            {truncatedBio}
            {isBioLong && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 text-pink-500 underline hover:bg-pink-50 hover:text-pink-600 px-2 py-0.5"
                onClick={() => setIsDialogOpen(true)}
              >
                Read More
              </Button>
            )}
            {/* Dialog for full bio */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About {displayName}</DialogTitle>
                  <DialogDescription>{displayBio}</DialogDescription>
                </DialogHeader>
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
                className={`transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm animate-slide-in-left`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tag}
              </Badge>
            )
          )}
          {hasMoreTags && !showAllTags && (
            <Badge
              className="transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/80 px-3 py-1 text-sm cursor-pointer"
              onClick={() => setShowAllTags(true)}
            >
              +{tags.length - maxTagsToShow} more
            </Badge>
          )}
          {showAllTags && hasMoreTags && (
            <Badge
              className="transition-all duration-200 hover:scale-105 bg-muted text-muted-foreground hover:bg-muted/80 px-3 py-1 text-sm cursor-pointer"
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
              } opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}
            >
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => onChatClick?.(user)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                onClick={() => onShareClick?.(user)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                size={isCompact ? "sm" : "default"}
                variant="outline"
                className="flex-1 font-semibold shadow-pink-200 hover:scale-105 hover:shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
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

export default PersonaCard;
