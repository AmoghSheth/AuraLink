import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Mail, Phone, Cake } from "lucide-react";

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatarUrl: string;
    email: string;
    phone: string;
    age: number;
    conversationTips: string[];
  } | null;
  onDmClick?: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
  isOpen,
  onClose,
  user,
  onDmClick,
}) => {
  if (!isOpen || !user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <DialogDescription className="text-base">
                Ready to connect. Here are some details to get the conversation
                started.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 gradient-text">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <span>
                  {user.age ? `${user.age} years old` : "Age not provided"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 gradient-text">Conversation Tips</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              {user.conversationTips.map((tip, index) => (
                <li key={index} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={onClose} variant="outline" className="hover:scale-105 transition-transform duration-200">
            Close
          </Button>
          <Button 
            onClick={() => window.open(`mailto:${user.email}`)}
            variant="outline"
            className="hover:scale-105 transition-transform duration-200"
          >
            Email {user.name.split(" ")[0]}
          </Button>
          <Button
            onClick={onDmClick}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            DM {user.name.split(" ")[0]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPopup;
