
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  // Add other fields you might want to display, like email if you collect it
}

interface ContactInfoCardProps {
  user: UserProfile;
}

const ContactInfoCard = ({ user }: ContactInfoCardProps) => {
  // In a real app, you would pull this data from the user's profile
  const contact = {
    email: `${user.username}@example.com`, // Placeholder
    phone: "+1 (555) 123-4567", // Placeholder
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact {user.full_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Here are a few ways to get in touch with {user.full_name}.
        </p>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-3">
            <Mail className="w-4 h-4" />
            <span>{contact.email}</span>
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </Button>
          <Button className="w-full justify-start gap-3">
            <MessageSquare className="w-4 h-4" />
            <span>Send a Message (In-App)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfoCard;
