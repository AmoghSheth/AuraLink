
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Share2, UserPlus } from "lucide-react";

interface PersonaCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    photo?: string;
    bio?: string;
    tags: string[];
    visibility: 'public' | 'friends' | 'private';
    mutualFriends?: number;
  };
  showActions?: boolean;
  variant?: 'full' | 'compact' | 'preview';
}

const PersonaCard = ({ user, showActions = true, variant = 'full' }: PersonaCardProps) => {
  const isCompact = variant === 'compact';
  const isPreview = variant === 'preview';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 ${
      isCompact ? 'max-w-sm' : isPreview ? 'max-w-xs' : 'max-w-md'
    }`}>
      <CardContent className="p-0">
        {/* Header with photo and basic info */}
        <div className={`relative ${isCompact ? 'p-4' : 'p-6'}`}>
          <div className="flex items-start gap-4">
            <div className={`${isCompact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}>
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-foreground truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
                {user.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {user.age} • {user.visibility}
              </p>
              {user.mutualFriends && user.mutualFriends > 0 && (
                <div className="flex items-center gap-1 text-xs text-accent mt-1">
                  <Users className="w-3 h-3" />
                  {user.mutualFriends} mutual friends
                </div>
              )}
            </div>
          </div>

          {!isPreview && user.bio && (
            <p className={`text-muted-foreground ${isCompact ? 'text-xs mt-2' : 'text-sm mt-3'} line-clamp-2`}>
              {user.bio}
            </p>
          )}
        </div>

        {/* Tags */}
        {!isPreview && (
          <div className={`px-${isCompact ? '4' : '6'} pb-4`}>
            <div className="flex flex-wrap gap-2">
              {user.tags.slice(0, isCompact ? 4 : 6).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="text-xs bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {user.tags.length > (isCompact ? 4 : 6) && (
                <Badge variant="outline" className="text-xs">
                  +{user.tags.length - (isCompact ? 4 : 6)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && !isPreview && (
          <div className={`border-t bg-muted/30 px-${isCompact ? '4' : '6'} py-3`}>
            <div className="flex gap-2">
              <Button size="sm" variant="default" className="flex-1">
                <UserPlus className="w-4 h-4 mr-1" />
                Add Friend
              </Button>
              <Button size="sm" variant="outline">
                <Gift className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
