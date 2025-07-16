import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Search,
  Info,
  Settings,
  X,
  FileText,
  ImageIcon,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  Heart,
  UserPlus,
  Share2,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Shield,
  Flag,
  Copy,
  Eye,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  bio?: string;
  interests?: string[];
  mutualFriends?: number;
  location?: string;
  joinedDate?: string;
  email?: string;
  phone?: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  files?: AttachedFile[];
  isDelivered?: boolean;
  isSending?: boolean;
}

const Chats = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(userId || null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "other",
      content: "Hey! How are you doing today?",
      timestamp: "10:30 AM",
      type: "text",
      isDelivered: true
    },
    {
      id: "2",
      senderId: "me",
      content: "I'm doing great! Just finished a really interesting book. How about you?",
      timestamp: "10:32 AM",
      type: "text",
      isDelivered: true
    },
    {
      id: "3",
      senderId: "other",
      content: "That's awesome! What book was it? I'm always looking for good recommendations 📚",
      timestamp: "10:35 AM",
      type: "text",
      isDelivered: true
    },
    {
      id: "4",
      senderId: "me",
      content: "It was 'Atomic Habits' by James Clear. Really changed my perspective on building good habits and breaking bad ones. Highly recommend it!",
      timestamp: "10:38 AM",
      type: "text",
      isDelivered: true
    },
    {
      id: "5",
      senderId: "other",
      content: "That sounds like a great idea! I'd love to join you for hiking this weekend.",
      timestamp: "2 min ago",
      type: "text",
      isDelivered: true
    }
  ]);

  // Mock data for styling purposes - enhanced with more details
  const mockChats: ChatUser[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      username: "sarah_j",
      avatar: "",
      lastMessage: "That sounds like a great idea! I'd love to join you for hiking this weekend.",
      timestamp: "2 min ago",
      unreadCount: 2,
      isOnline: true,
      bio: "Adventure seeker, book lover, and coffee enthusiast. Always up for exploring new places and meeting interesting people!",
      interests: ["Hiking", "Photography", "Reading", "Travel", "Coffee"],
      mutualFriends: 12,
      location: "San Francisco, CA",
      joinedDate: "March 2023",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567"
    },
    {
      id: "2", 
      name: "Mike Chen",
      username: "mike_c",
      avatar: "",
      lastMessage: "Thanks for the book recommendation! 📚",
      timestamp: "1 hour ago",
      unreadCount: 0,
      isOnline: true,
      bio: "Tech enthusiast and lifelong learner. Building amazing things one line of code at a time.",
      interests: ["Programming", "Gaming", "Books", "Music"],
      mutualFriends: 8,
      location: "Seattle, WA",
      joinedDate: "January 2023",
      email: "mike.chen@email.com",
      phone: "+1 (555) 987-6543"
    },
    {
      id: "3",
      name: "Alex Rodriguez",
      username: "alex_r",
      avatar: "",
      lastMessage: "Let's grab coffee soon and catch up",
      timestamp: "Yesterday",
      unreadCount: 1,
      isOnline: false,
      bio: "Marketing professional with a passion for creative campaigns and meaningful connections.",
      interests: ["Marketing", "Design", "Coffee", "Networking"],
      mutualFriends: 15,
      location: "Austin, TX",
      joinedDate: "February 2023",
      email: "alex.rodriguez@email.com"
    },
    {
      id: "4",
      name: "Emma Wilson",
      username: "emma_w",
      avatar: "",
      lastMessage: "The concert was amazing! You should have been there 🎵",
      timestamp: "2 days ago",
      unreadCount: 0,
      isOnline: false,
      bio: "Music lover and event coordinator. Always discovering new artists and planning memorable experiences.",
      interests: ["Music", "Events", "Dancing", "Art"],
      mutualFriends: 6,
      location: "Nashville, TN",
      joinedDate: "April 2023",
      email: "emma.wilson@email.com"
    },
    {
      id: "5",
      name: "David Kim",
      username: "david_k",
      avatar: "",
      lastMessage: "How's the new job going?",
      timestamp: "3 days ago",
      unreadCount: 0,
      isOnline: true,
      bio: "Product designer focused on creating intuitive user experiences and beautiful interfaces.",
      interests: ["Design", "UX/UI", "Photography", "Minimalism"],
      mutualFriends: 10,
      location: "Los Angeles, CA",
      joinedDate: "May 2023",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890"
    }
  ];

  const currentChatUser = mockChats.find(chat => chat.id === selectedChat);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const attachedFile: AttachedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
          preview: file.type.startsWith('image/') ? e.target?.result as string : undefined
        };
        
        setAttachedFiles(prev => [...prev, attachedFile]);
      };
      
      reader.readAsDataURL(file);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && attachedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: attachedFiles.length > 0 ? 'file' : 'text',
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      isDelivered: false,
      isSending: true
    };

    // Add message immediately to UI
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    setAttachedFiles([]);

    // Show success toast
    toast.success("Message sent!", {
      description: attachedFiles.length > 0 ? `Sent with ${attachedFiles.length} file(s)` : undefined
    });

    // Simulate message delivery after a short delay
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, isSending: false, isDelivered: true }
          : msg
      ));
    }, 1500);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    navigate(`/chats/${chatId}`);
  };

  const renderFilePreview = (file: AttachedFile) => {
    const isImage = file.type.startsWith('image/');
    
    return (
      <div key={file.id} className="relative group">
        {isImage ? (
          <div className="relative">
            <img 
              src={file.preview} 
              alt={file.name}
              className="w-20 h-20 object-cover rounded-lg border border-border/50"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeAttachedFile(file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 p-2 bg-muted rounded-lg border border-border/50 min-w-[200px]">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeAttachedFile(file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderMessageFiles = (message: Message) => {
    if (!message.files || message.files.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {message.files.map((file) => {
          const isImage = file.type.startsWith('image/');
          
          return (
            <div key={file.id}>
              {isImage ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(file.url, '_blank')}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-border/20 max-w-[250px]">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src="/logo.png" alt="AuraLink Logo" className="w-10 h-10" />
                <span className="text-2xl font-bold">AuraLink</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Chat List Sidebar */}
          <Card className="lg:col-span-1 flex flex-col bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {mockChats.filter(chat => chat.unreadCount > 0).length} new
                </Badge>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {mockChats.map((chat) => (
                                         <div
                       key={chat.id}
                       onClick={() => handleChatSelect(chat.id)}
                       className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-muted/50 hover:shadow-md ${
                         selectedChat === chat.id 
                           ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 shadow-lg' 
                           : 'hover:scale-[1.02] hover:shadow-sm'
                       }`}
                     >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                              {chat.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {chat.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate leading-relaxed">
                            {chat.lastMessage}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs rounded-full">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-3 flex flex-col bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50">
            {selectedChat && currentChatUser ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={currentChatUser.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                            {currentChatUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {currentChatUser.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{currentChatUser.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentChatUser.isOnline ? 'Online' : 'Last seen recently'}
                        </p>
                      </div>
                    </div>
                                         <div className="flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="rounded-full hover:bg-primary/10 transition-colors"
                         onClick={() => setIsUserInfoOpen(true)}
                       >
                         <Info className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="rounded-full hover:bg-primary/10 transition-colors"
                         onClick={() => setIsChatOptionsOpen(true)}
                       >
                         <MoreVertical className="w-4 h-4" />
                       </Button>
                     </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                                                                          <div
                           className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                             message.senderId === 'me'
                               ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground ml-12'
                               : 'bg-gradient-to-r from-muted to-muted/80 mr-12'
                           } ${message.isSending ? 'opacity-70' : ''}`}
                         >
                           {message.content && (
                             <p className="text-sm leading-relaxed">{message.content}</p>
                           )}
                           {renderMessageFiles(message)}
                           <div className={`flex items-center justify-between mt-1 ${
                             message.senderId === 'me' ? 'flex-row-reverse' : ''
                           }`}>
                             <p className={`text-xs ${
                               message.senderId === 'me' 
                                 ? 'text-primary-foreground/70' 
                                 : 'text-muted-foreground'
                             }`}>
                               {message.timestamp}
                             </p>
                             {message.senderId === 'me' && (
                               <div className="flex items-center gap-1 ml-2">
                                 {message.isSending ? (
                                   <Loader2 className="w-3 h-3 animate-spin text-primary-foreground/50" />
                                 ) : message.isDelivered ? (
                                   <CheckCircle2 className="w-3 h-3 text-primary-foreground/70" />
                                 ) : (
                                   <Clock className="w-3 h-3 text-primary-foreground/50" />
                                 )}
                               </div>
                             )}
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                                {/* Message Input */}
                <div className="p-6 border-t border-border/50">
                  {/* File Attachments Preview */}
                  {attachedFiles.length > 0 && (
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attachedFiles.map(renderFilePreview)}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-primary/10 transition-colors"
                      onClick={handleFileAttachment}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-12 bg-background/50 border-border/50 focus:border-primary/50 rounded-full"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() && attachedFiles.length === 0}
                      className="rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a chat from the sidebar to start messaging, or go back to discover new people to connect with.
                  </p>
                  <Button asChild className="mt-6">
                    <Link to="/search">Find New Connections</Link>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* User Info Dialog */}
      <Dialog open={isUserInfoOpen} onOpenChange={setIsUserInfoOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentChatUser?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                  {currentChatUser?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">{currentChatUser?.name}</div>
                <div className="text-sm text-muted-foreground">@{currentChatUser?.username}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Bio */}
            {currentChatUser?.bio && (
              <div>
                <h4 className="font-medium text-sm mb-2">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{currentChatUser.bio}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              {currentChatUser?.email && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentChatUser.email}</span>
                </div>
              )}
              {currentChatUser?.phone && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentChatUser.phone}</span>
                </div>
              )}
              {currentChatUser?.location && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{currentChatUser.location}</span>
                </div>
              )}
              {currentChatUser?.joinedDate && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Joined {currentChatUser.joinedDate}</span>
                </div>
              )}
            </div>

            {/* Interests */}
            {currentChatUser?.interests && currentChatUser.interests.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {currentChatUser.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-primary/10 text-primary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Mutual Friends */}
            {currentChatUser?.mutualFriends && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{currentChatUser.mutualFriends} mutual friends</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  setIsUserInfoOpen(false);
                  toast.success("Profile viewed", { description: "Navigate to full profile page" });
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/persona/${currentChatUser?.id}`);
                  toast.success("Profile link copied!");
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Options Dialog */}
      <Dialog open={isChatOptionsOpen} onOpenChange={setIsChatOptionsOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle>Chat Options</DialogTitle>
            <DialogDescription>
              Manage your conversation with {currentChatUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {isNotificationsMuted ? (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Bell className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isNotificationsMuted ? "Muted" : "Enabled"}
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={!isNotificationsMuted}
                onCheckedChange={(checked) => {
                  setIsNotificationsMuted(!checked);
                  toast.success(checked ? "Notifications enabled" : "Notifications muted");
                }}
              />
            </div>

            {/* Chat Actions */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsChatOptionsOpen(false);
                  toast.success("Chat exported", { description: "Download will begin shortly" });
                }}
              >
                <Archive className="w-4 h-4 mr-3" />
                Export Chat History
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setIsChatOptionsOpen(false);
                  toast.success("Chat cleared", { description: "All messages have been removed locally" });
                }}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear Chat History
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(`https://auralink.app/chats/${currentChatUser?.id}`);
                  toast.success("Chat link copied!");
                }}
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy Chat Link
              </Button>
            </div>

            <Separator />

            {/* Moderation Actions */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={() => {
                  setIsChatOptionsOpen(false);
                  toast.warning("User blocked", { description: "You won't receive messages from this user" });
                }}
              >
                <Shield className="w-4 h-4 mr-3" />
                Block User
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setIsChatOptionsOpen(false);
                  toast.error("Report submitted", { description: "We'll review this conversation" });
                }}
              >
                <Flag className="w-4 h-4 mr-3" />
                Report Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chats; 