import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
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
  Users,
  Plus,
  Mic,
  Video,
  Image,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

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
  type: "text" | "image" | "file";
  files?: AttachedFile[];
  isDelivered?: boolean;
  isSending?: boolean;
}

interface ChatMessage {
  id: string;
  sender_username: string;
  receiver_username: string;
  content: string;
  files?: AttachedFile[];
  created_at: string;
  is_delivered: boolean;
  is_read: boolean;
  isSending?: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  friends?: string[];
  last_message_time?: string;
  bio?: string;
  interests?: string[];
  mutualFriends?: number;
  location?: string;
  joinedDate?: string;
  email?: string;
  phone?: string;
  openai_persona?: string;
  phone_number?: string;
}

// Add this interface for friend data with unread count
interface FriendWithUnreadCount extends UserProfile {
  unread_count: number;
}

const Chats = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [chatFriends, setChatFriends] = useState<FriendWithUnreadCount[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(
    userId || null
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isChatOptionsOpen, setIsChatOptionsOpen] = useState(false);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user and their friends
  useEffect(() => {
    const fetchUserAndFriends = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);

        // Fetch friends with their last message time and unread counts
        if (profile.friends && profile.friends.length > 0) {
          const { data: friends } = await supabase
            .from("users")
            .select(`
              *,
              messages!inner(count)
            `)
            .in("username", profile.friends)
            .eq('messages.receiver_username', profile.username)
            .eq('messages.is_read', false)
            .order("last_message_time", { ascending: false, nullsFirst: false });

          // Calculate total unread messages
          const total = friends?.reduce((sum, friend) => sum + (friend.messages?.[0]?.count || 0), 0) || 0;
          setTotalUnreadCount(total);

          // Format friends with unread counts
          const friendsWithCounts = friends?.map(friend => ({
            ...friend,
            unread_count: friend.unread_count?.[0]?.count || 0
          })) || [];

          setChatFriends(friendsWithCounts);
        }
      }
    };

    fetchUserAndFriends();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('new_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_username=eq.${currentUser?.username}`
        },
        () => {
          // Refresh friends list when new message arrives
          fetchUserAndFriends();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.username]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const fetchMessages = async () => {
      // First get the selected user's profile
      const { data: receiver } = await supabase
        .from('users')
        .select('username')
        .eq('id', selectedChat)
        .single();

      if (!receiver?.username) return;

      // Fetch messages where either user is sender or receiver
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_username.eq.${currentUser.username},receiver_username.eq.${receiver.username}),and(sender_username.eq.${receiver.username},receiver_username.eq.${currentUser.username})`)
        .order('created_at');

      setMessages(messages || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .match({
          sender_username: receiver.username,
          receiver_username: currentUser.username,
          is_read: false
        });
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_username=eq.${currentUser.username}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedChat, currentUser]);

  // Mock data for styling purposes - enhanced with more details
  const mockChats: ChatUser[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      username: "sarah_j",
      avatar: "",
      lastMessage:
        "That sounds like a great idea! I'd love to join you for hiking this weekend.",
      timestamp: "2 min ago",
      unreadCount: 2,
      isOnline: true,
      bio: "Adventure seeker, book lover, and coffee enthusiast. Always up for exploring new places and meeting interesting people!",
      interests: ["Hiking", "Photography", "Reading", "Travel", "Coffee"],
      mutualFriends: 12,
      location: "San Francisco, CA",
      joinedDate: "March 2023",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
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
      phone: "+1 (555) 987-6543",
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
      email: "alex.rodriguez@email.com",
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
      email: "emma.wilson@email.com",
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
      phone: "+1 (555) 456-7890",
    },
  ];

  // Try to find the chat user in the mockChats list
  let currentChatUser = mockChats.find((chat) => chat.id === selectedChat);

  // If not found and userId is present, create a temporary ChatUser from location.state or fallback
  if (!currentChatUser && userId) {
    // Try to get user info from location.state (passed via navigation)
    const stateUser = location.state?.user;
    currentChatUser = stateUser
      ? {
          id: stateUser.id,
          name: stateUser.name || stateUser.full_name || "New User",
          username: stateUser.username || "",
          avatar: stateUser.avatar || stateUser.avatar_url || "",
          lastMessage: "",
          timestamp: "",
          unreadCount: 0,
          isOnline: false,
          bio: stateUser.bio || stateUser.openai_persona || "",
          interests: stateUser.interests || [],
          mutualFriends: stateUser.mutualFriends || 0,
          location: stateUser.location || "",
          joinedDate: stateUser.joinedDate || "",
          email: stateUser.email || "",
          phone: stateUser.phone || stateUser.phone_number || "",
        }
      : {
          id: userId,
          name: "New User",
          username: "",
          avatar: "",
          lastMessage: "",
          timestamp: "",
          unreadCount: 0,
          isOnline: false,
          bio: "",
          interests: [],
          mutualFriends: 0,
          location: "",
          joinedDate: "",
          email: "",
          phone: "",
        };
  }

  useEffect(() => {
    if (currentChatUser && currentChatUser.id) {
      const dms = JSON.parse(localStorage.getItem("activeDms") || "[]");
      if (!dms.includes(currentChatUser.id)) {
        dms.push(currentChatUser.id);
        localStorage.setItem("activeDms", JSON.stringify(dms));
      }
    }
  }, [currentChatUser?.id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
          preview:
            file.type.startsWith("image/")
              ? (e.target?.result as string)
              : undefined,
        };

        setAttachedFiles((prev) => [...prev, attachedFile]);
      };

      reader.readAsDataURL(file);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Update the handleSendMessage function
  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachedFiles.length === 0) return;
    if (!currentUser || !selectedChat) return;

    // Get the selected friend's profile
    const { data: receiver } = await supabase
      .from('users')
      .select('username')
      .eq('id', selectedChat)
      .single();

    if (!receiver?.username) {
      toast.error("Couldn't find recipient");
      return;
    }

    const newMessage = {
      sender_username: currentUser.username,
      receiver_username: receiver.username,
      content: messageInput.trim(),
      files: attachedFiles.length > 0 ? attachedFiles : null,
      created_at: new Date().toISOString(),
      is_delivered: false,
      is_read: false
    };

    // Optimistically add message to UI
    const tempMessage = { ...newMessage, id: Date.now().toString(), isSending: true };
    setMessages(prev => [...prev, tempMessage as ChatMessage]);

    // Clear input and files
    setMessageInput('');
    setAttachedFiles([]);

    try {
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      // Update messages with the actual message from the database
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? { ...data, isSending: false } : msg
        )
      );

      // Update last message time for both users
      const now = new Date().toISOString();
      await supabase
        .from('users')
        .update({ last_message_time: now })
        .in('username', [currentUser.username, receiver.username]);

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast.error('Failed to send message');
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    navigate(`/chats/${chatId}`);
  };

  const renderFilePreview = (file: AttachedFile) => {
    const isImage = file.type.startsWith("image/");

    return (
      <div key={file.id} className="relative group animate-fade-in">
        {isImage ? (
          <div className="relative">
            <img
              src={file.preview}
              alt={file.name}
              className="w-20 h-20 object-cover rounded-xl border border-border/30 shadow-md"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
              onClick={() => removeAttachedFile(file.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="relative flex items-center gap-3 p-3 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl border border-border/30 min-w-[220px] shadow-md">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
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
      <div className="mt-3 space-y-2">
        {message.files.map((file) => {
          const isImage = file.type.startsWith("image/");

          return (
            <div key={file.id}>
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-[280px] rounded-xl cursor-pointer hover:opacity-90 transition-all duration-200 shadow-md"
                  onClick={() => window.open(file.url, "_blank")}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-background/30 rounded-xl border border-border/30 max-w-[280px] hover:bg-background/50 transition-all duration-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:scale-110 transition-transform duration-200"
                    onClick={() => window.open(file.url, "_blank")}
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background purple-glow-container">
      <div className="purple-glow" />
      {/* Navigation Header */}
      <nav className="border-b bg-card/30 backdrop-blur-xl sticky top-0 z-50 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="AuraLink Logo"
                  className="w-10 h-10 transition-transform duration-300 hover:scale-110"
                />
                <span className="text-2xl font-display font-bold gradient-text tracking-tight">AuraLink</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform duration-200">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Chat List Sidebar */}
          <Card className="lg:col-span-1 flex flex-col glass-effect">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold tracking-tight gradient-text">Messages</h2>
                {totalUnreadCount > 0 && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary animate-pulse shadow-sm">
                    {totalUnreadCount} new
                  </Badge>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 rounded-xl"
                />
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {chatFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedChat(friend.username)}
                      className={`p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] hover-lift group ${
                        selectedChat === friend.username ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 shadow-md ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold">
                              {friend.full_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {friend.unread_count > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-primary to-accent text-white animate-pulse shadow-lg text-xs"
                            >
                              {friend.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate text-foreground">{friend.full_name}</h3>
                            {friend.last_message_time && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(friend.last_message_time), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {friend.last_message_time
                              ? "Last message sent"
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-3 flex flex-col glass-effect overflow-hidden">
            {selectedChat && currentChatUser ? (
              <>
                {/* Enhanced Chat Header */}
                <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 shadow-lg ring-2 ring-primary/20">
                          <AvatarImage src={currentChatUser.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-semibold text-lg">
                            {currentChatUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {currentChatUser.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse shadow-sm"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-xl gradient-text">
                          {currentChatUser.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {currentChatUser.isOnline ? (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Online
                            </>
                          ) : (
                            "Last seen recently"
                          )}
                          {isTyping && (
                            <span className="text-primary animate-pulse">• typing...</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={() => setIsUserInfoOpen(true)}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={() => setIsChatOptionsOpen(true)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages Area */}
                <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background/30 to-background/10">
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwnMessage = message.sender_username === currentUser?.username;
                      const showAvatar = index === 0 || messages[index - 1]?.sender_username !== message.sender_username;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-3 animate-fade-in ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {!isOwnMessage && showAvatar && (
                            <Avatar className="h-8 w-8 shadow-md">
                              <AvatarImage src={currentChatUser.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-secondary/30 to-secondary/20 text-secondary text-sm">
                                {currentChatUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          {!isOwnMessage && !showAvatar && (
                            <div className="w-8 h-8"></div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group ${
                              isOwnMessage
                                ? "bg-gradient-to-br from-primary via-primary/90 to-accent text-white shadow-primary/20"
                                : "bg-gradient-to-br from-card via-card/95 to-card/90 shadow-muted/20 glass-effect"
                            } ${message.isSending ? "opacity-70 animate-pulse" : ""}`}
                          >
                            {message.content && (
                              <p className={`text-sm leading-relaxed ${
                                isOwnMessage ? "text-white" : "text-foreground"
                              }`}>
                                {message.content}
                              </p>
                            )}
                            
                            {renderMessageFiles({
                              id: message.id,
                              senderId: message.sender_username,
                              content: message.content,
                              timestamp: message.created_at,
                              type: message.files ? "file" : "text",
                              files: message.files,
                              isDelivered: message.is_delivered,
                              isSending: message.isSending
                            })}
                            
                            <div className={`flex items-center gap-2 mt-2 ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}>
                              <p className={`text-xs ${
                                isOwnMessage ? "text-white/70" : "text-muted-foreground"
                              }`}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                              
                              {isOwnMessage && (
                                <div className="flex items-center">
                                  {message.isSending ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-white/50" />
                                  ) : message.is_delivered ? (
                                    <CheckCircle2 className="w-3 h-3 text-white/70" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-white/50" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Enhanced Message Input */}
                <div className="p-6 border-t border-border/50 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
                  {/* File Attachments Preview */}
                  {attachedFiles.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/30 glass-effect">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {attachedFiles.length} file{attachedFiles.length > 1 ? "s" : ""} attached
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {attachedFiles.map(renderFilePreview)}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    
                    {/* Attachment Options */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={handleFileAttachment}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex-1 relative">
                                              <Input
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="pr-12 bg-background/60 border-border/30 focus:border-primary/50 rounded-2xl transition-all duration-200 focus:scale-[1.01] min-h-[44px]"
                        />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:scale-110 transition-transform duration-200"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Send Button */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() && attachedFiles.length === 0}
                      className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 w-12 h-12"
                      size="icon"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Enhanced Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center animate-fade-in max-w-md">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl float-animation">
                    <Send className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-4 gradient-text tracking-tight">
                    Start a Conversation
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Select a chat from the sidebar to start messaging, or go back to discover new people to connect with.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild className="transition-all duration-200 hover:scale-105">
                      <Link to="/search">Find New Connections</Link>
                    </Button>
                    <Button variant="outline" asChild className="transition-all duration-200 hover:scale-105">
                      <Link to="/friends">View Friends</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* User Info Dialog */}
      <Dialog open={isUserInfoOpen} onOpenChange={setIsUserInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentChatUser?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-lg">
                  {currentChatUser?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">
                  {currentChatUser?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{currentChatUser?.username}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Bio */}
            {currentChatUser?.bio && (
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                  About
                </h4>
                <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4 border border-border/30">
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                    {currentChatUser.bio.split(/[.!?]+/).filter(sentence => sentence.trim()).map((sentence, index) => {
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
                  <span className="text-sm">
                    Joined {currentChatUser.joinedDate}
                  </span>
                </div>
              )}
            </div>

            {/* Interests */}
            {currentChatUser?.interests &&
              currentChatUser.interests.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentChatUser.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
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
                <span className="text-sm font-medium">
                  {currentChatUser.mutualFriends} mutual friends
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setIsUserInfoOpen(false);
                  toast.success("Profile viewed", {
                    description: "Navigate to full profile page",
                  });
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/persona/${currentChatUser?.id}`
                  );
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
        <DialogContent className="max-w-md">
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
                  <Label
                    htmlFor="notifications"
                    className="text-sm font-medium"
                  >
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
                  toast.success(
                    checked ? "Notifications enabled" : "Notifications muted"
                  );
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
                  toast.success("Chat exported", {
                    description: "Download will begin shortly",
                  });
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
                  toast.success("Chat cleared", {
                    description: "All messages have been removed locally",
                  });
                }}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear Chat History
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://auralink.app/chats/${currentChatUser?.id}`
                  );
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
                  toast.warning("User blocked", {
                    description: "You won't receive messages from this user",
                  });
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
                  toast.error("Report submitted", {
                    description: "We'll review this conversation",
                  });
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
