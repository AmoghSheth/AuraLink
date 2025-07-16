
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Mail, Phone, Cake } from 'lucide-react';

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
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <DialogDescription>
                Ready to connect. Here are some details to get the conversation started.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <span>{user.age ? `${user.age} years old` : 'Age not provided'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Conversation Tips</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {user.conversationTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
          <Button onClick={() => window.open(`mailto:${user.email}`)}>Email {user.name.split(' ')[0]}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPopup;
