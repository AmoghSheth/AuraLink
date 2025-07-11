
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Share2, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string;
  age: number;
  bio?: string;
  tags: string[];
  visibility: "public" | "friends" | "private";
  mutualFriends?: number;
}

interface PersonaCardProps {
  user: User;
  variant?: "default" | "compact";
  showActions?: boolean;
}

const PersonaCard = ({ user, variant = "default", showActions = true }: PersonaCardProps) => {
  const isCompact = variant === "compact";

  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.03] ${isCompact ? 'p-3' : 'p-4'} border border-border/50 hover:border-primary/30 animate-fade-in bg-gradient-to-br from-card to-card/80 backdrop-blur-sm`}>
      <CardContent className={`${isCompact ? 'p-3' : 'p-6'} space-y-4`}>
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`${isCompact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-foreground truncate transition-colors duration-200 group-hover:text-primary ${isCompact ? 'text-base' : 'text-lg'}`}>
                {user.name}
              </h3>
              <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
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
        {!isCompact && user.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-200 group-hover:text-foreground/80">
            {user.bio}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {user.tags.slice(0, isCompact ? 3 : 5).map((tag, index) => (
            <Badge 
              key={tag} 
              className={`transition-all duration-200 hover:scale-105 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-slide-in-left ${isCompact ? 'text-xs px-2 py-0.5' : 'text-xs'}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {tag}
            </Badge>
          ))}
          {user.tags.length > (isCompact ? 3 : 5) && (
            <Badge variant="outline" className="text-xs transition-all duration-200 hover:scale-105 text-foreground border-border">
              +{user.tags.length - (isCompact ? 3 : 5)} more
            </Badge>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`flex gap-2 ${isCompact ? 'pt-2' : 'pt-4'} opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
            <Button 
              size={isCompact ? "sm" : "default"} 
              variant="outline" 
              className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-primary/5"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button 
              size={isCompact ? "sm" : "default"} 
              variant="outline" 
              className="transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-destructive/5"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              size={isCompact ? "sm" : "default"} 
              variant="outline" 
              className="transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-accent/5"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button 
              size={isCompact ? "sm" : "default"} 
              variant="outline" 
              className="transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-secondary/5"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
