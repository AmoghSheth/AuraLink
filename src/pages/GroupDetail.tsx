import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Send,
  Plus,
  MessageSquare,
  Calendar,
  Reply,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import AISuggestionPopup from "@/components/AISuggestionPopup";

const GroupDetail = () => {
  const { id } = useParams();

  // Profile Picture Component with fallback
  const ProfilePicture = ({
    userId,
    userName,
    size = "w-10 h-10",
    textSize = "text-sm",
  }: {
    userId: string | null;
    userName: string;
    size?: string;
    textSize?: string;
  }) => {
    const [imageError, setImageError] = useState(false);
    const profileUrl = userId
      ? `https://res.cloudinary.com/ddlpuoyei/image/upload/v1753661631/user-photos/${userId}`
      : null;

    if (!userId || imageError) {
      // Fallback to colored circle with initials
      return (
        <div
          className={`${size} rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary shadow-md`}
        >
          <span className={textSize}>{userName.charAt(0).toUpperCase()}</span>
        </div>
      );
    }

    return (
      <img
        src={profileUrl}
        alt={userName}
        className={`${size} rounded-full object-cover shadow-md ring-2 ring-border/20`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  // State for group data and posts
  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // New post state
  const [newPostContent, setNewPostContent] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Comment state
  const [commentingOnPost, setCommentingOnPost] = useState<number | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

  // Delete state
  const [deletingPost, setDeletingPost] = useState<number | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null); // Format: "postIndex-commentIndex"

  // AI suggestion state
  const [isAISuggestionOpen, setIsAISuggestionOpen] = useState(false);

  // Load group data and posts
  useEffect(() => {
    const loadGroupData = async () => {
      if (!id) return;

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to view groups");
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from("users")
          .select("full_name, interests, values, lifestyle, openai_persona")
          .eq("id", user.id)
          .single();

        setCurrentUser({
          id: user.id,
          name: userProfile?.full_name || "Anonymous",
          profilePicture: `https://res.cloudinary.com/ddlpuoyei/image/upload/v1753661631/user-photos/${user.id}`,
          interests: userProfile?.interests || [],
          values: userProfile?.values || [],
          lifestyle: userProfile?.lifestyle || [],
          openai_persona: userProfile?.openai_persona,
        });

        // Get group data including comments
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", id)
          .single();

        if (groupError) {
          console.error("Error fetching group:", groupError);
          toast.error("Failed to load group");
          return;
        }

        if (!groupData) {
          toast.error("Group not found");
          return;
        }

        // Check if user is a member
        const isMember =
          Array.isArray(groupData.members) &&
          groupData.members.includes(user.id);
        if (!isMember) {
          toast.error("You must be a member to view this group");
          return;
        }

        setGroup({
          ...groupData,
          memberCount: Array.isArray(groupData.members)
            ? groupData.members.length
            : 0,
          isMember: true,
        });

        // Load posts (they're stored as text array in the posts column)
        setPosts(Array.isArray(groupData.posts) ? groupData.posts : []);

        // Load comments (they're stored as JSONB object in the comments column)
        setComments(groupData.comments || {});
      } catch (error) {
        console.error("Error loading group data:", error);
        toast.error("Failed to load group");
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [id]);

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser || !group || posting) return;

    setPosting(true);
    try {
      // Format the post as "User - content..." with timestamp and user ID
      const timestamp = new Date().toISOString();
      const formattedPost = `${
        currentUser.name
      } - ${newPostContent.trim()} - ${timestamp} - ${currentUser.id}`;

      // Add to existing posts array
      const updatedPosts = [...posts, formattedPost];

      // Update in Supabase
      const { error } = await supabase
        .from("groups")
        .update({ posts: updatedPosts })
        .eq("id", group.id);

      if (error) {
        console.error("Error creating post:", error);
        toast.error("Failed to create post");
        return;
      }

      // Update local state
      setPosts(updatedPosts);
      setNewPostContent("");
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  // Parse a post to extract user name, content, timestamp, and user ID
  const parsePost = (post: string) => {
    const parts = post.split(" - ");
    if (parts.length < 2) {
      return {
        userName: "Unknown",
        content: post,
        timestamp: null,
        userId: null,
      };
    }

    // Check if we have the new format with user ID (4 parts) or old format (3 parts)
    let timestamp = null;
    let content = "";
    let userId = null;

    if (parts.length >= 4) {
      // New format: "User - content - timestamp - userId"
      const lastPart = parts[parts.length - 2]; // timestamp is second to last
      userId = parts[parts.length - 1]; // userId is last

      try {
        const parsedDate = new Date(lastPart);
        if (!isNaN(parsedDate.getTime()) && lastPart.includes("T")) {
          timestamp = parsedDate;
          content = parts.slice(1, -2).join(" - "); // exclude user, timestamp, and userId
        } else {
          content = parts.slice(1, -1).join(" - "); // fallback if timestamp parsing fails
        }
      } catch {
        content = parts.slice(1, -1).join(" - ");
      }
    } else {
      // Legacy format: "User - content - timestamp" or "User - content"
      const lastPart = parts[parts.length - 1];

      try {
        const parsedDate = new Date(lastPart);
        if (!isNaN(parsedDate.getTime()) && lastPart.includes("T")) {
          timestamp = parsedDate;
          content = parts.slice(1, -1).join(" - ");
        } else {
          content = parts.slice(1).join(" - ");
        }
      } catch {
        content = parts.slice(1).join(" - ");
      }
    }

    return {
      userName: parts[0],
      content: content,
      timestamp: timestamp,
      userId: userId,
    };
  };

  // Handle adding a comment to a post
  const handleAddComment = async (postIndex: number) => {
    if (!newCommentContent.trim() || !currentUser || !group || addingComment)
      return;

    setAddingComment(true);
    try {
      const timestamp = new Date().toISOString();
      const newComment = {
        user: currentUser.name,
        userId: currentUser.id,
        content: newCommentContent.trim(),
        timestamp: timestamp,
      };

      // Get existing comments for this post
      const postIndexStr = postIndex.toString();
      const existingComments = comments[postIndexStr] || [];

      // Add new comment
      const updatedComments = [...existingComments, newComment];

      // Update the comments object
      const updatedCommentsObj = {
        ...comments,
        [postIndexStr]: updatedComments,
      };

      // Update in Supabase
      const { error } = await supabase
        .from("groups")
        .update({ comments: updatedCommentsObj })
        .eq("id", group.id);

      if (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
        return;
      }

      // Update local state
      setComments(updatedCommentsObj);
      setNewCommentContent("");
      setCommentingOnPost(null);

      // Expand the post to show the new comment
      setExpandedPosts((prev) => new Set([...prev, postIndex]));

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postIndex: number) => {
    if (!currentUser || !group) return;

    const post = parsePost(group.posts[postIndex]);
    const canDelete =
      post.userId === currentUser.id || group.admin === currentUser.id;

    if (!canDelete) return;

    setDeletingPost(postIndex);
    try {
      // Remove post from posts array
      const updatedPosts = group.posts.filter(
        (_, index) => index !== postIndex
      );

      // Remove comments for this post and reindex remaining comments
      const updatedComments = { ...comments };
      delete updatedComments[postIndex.toString()];

      // Reindex comments for posts that come after the deleted post
      const reindexedComments: any = {};
      Object.keys(updatedComments).forEach((key) => {
        const index = parseInt(key);
        if (index > postIndex) {
          reindexedComments[(index - 1).toString()] = updatedComments[key];
        } else {
          reindexedComments[key] = updatedComments[key];
        }
      });

      const { error } = await supabase
        .from("groups")
        .update({
          posts: updatedPosts,
          comments: reindexedComments,
        })
        .eq("id", id);

      if (error) throw error;

      setGroup((prev) =>
        prev
          ? {
              ...prev,
              posts: updatedPosts,
            }
          : null
      );
      setPosts(updatedPosts);
      setComments(reindexedComments);

      // Update expanded posts set to account for reindexing
      setExpandedPosts((prev) => {
        const newSet = new Set<number>();
        prev.forEach((expandedIndex) => {
          if (expandedIndex < postIndex) {
            newSet.add(expandedIndex);
          } else if (expandedIndex > postIndex) {
            newSet.add(expandedIndex - 1);
          }
        });
        return newSet;
      });

      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setDeletingPost(null);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (
    postIndex: number,
    commentIndex: number
  ) => {
    if (!currentUser || !group) return;

    const postComments = comments[postIndex.toString()] || [];
    const comment = postComments[commentIndex];
    if (!comment) return;

    // Check if user can delete (comment author or group admin)
    const canDelete =
      comment.userId === currentUser.id || group.admin === currentUser.id;
    if (!canDelete) return;

    const deleteKey = `${postIndex}-${commentIndex}`;
    setDeletingComment(deleteKey);

    try {
      // Remove comment from the array
      const updatedComments = postComments.filter(
        (_, index) => index !== commentIndex
      );

      // Update the comments object
      const updatedCommentsObj = {
        ...comments,
        [postIndex.toString()]: updatedComments,
      };

      // Update in Supabase
      const { error } = await supabase
        .from("groups")
        .update({ comments: updatedCommentsObj })
        .eq("id", group.id);

      if (error) {
        console.error("Error deleting comment:", error);
        toast.error("Failed to delete comment");
        return;
      }

      // Update local state
      setComments(updatedCommentsObj);
      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  // Toggle post expansion to show/hide comments
  const togglePostExpansion = (postIndex: number) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postIndex)) {
        newSet.delete(postIndex);
      } else {
        newSet.add(postIndex);
      }
      return newSet;
    });
  };

  // Get comment count for a post
  const getCommentCount = (postIndex: number) => {
    const postComments = comments[postIndex.toString()];
    return postComments ? postComments.length : 0;
  };

  // Handle AI suggestion selection
  const handleAISuggestionSelect = (suggestion: string) => {
    setNewPostContent(suggestion);
    toast.success("AI suggestion added to your post!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Group not found</h1>
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Button asChild>
            <Link to="/groups">Back to Groups</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navigation */}
      <nav className="border-b bg-card/30 backdrop-blur-xl glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/groups">
              <Button
                variant="ghost"
                size="icon"
                className="hover:scale-110 transition-transform duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="AuraLink Logo"
                className="w-10 h-10 transition-transform duration-300 hover:scale-110"
              />
              <span className="text-xl font-display font-bold gradient-text tracking-tight-pro">
                AuraLink
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Group Header */}
          <Card className="glass-effect hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-display font-bold gradient-text mb-2 tracking-tight-pro">
                    {group.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.memberCount} members
                    </span>
                    <span>•</span>
                    <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary">
                      {group.tag}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-muted-foreground max-w-2xl">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Post Section */}
          <Card className="glass-effect hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 gradient-text">
                  <Plus className="w-5 h-5" />
                  Create Post
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAISuggestionOpen(true)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Get AI suggestions"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Share something with the group..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                disabled={posting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || posting}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {posting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Thread */}
          <Card className="glass-effect hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 gradient-text">
                <MessageSquare className="w-5 h-5" />
                Group Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
                    No posts yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with the group!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Reverse the posts array to show newest first */}
                  {[...posts].reverse().map((post, index) => {
                    const { userName, content, timestamp, userId } =
                      parsePost(post);
                    const originalIndex = posts.length - 1 - index; // Original index in the posts array
                    const commentCount = getCommentCount(originalIndex);
                    const isExpanded = expandedPosts.has(originalIndex);
                    const postComments =
                      comments[originalIndex.toString()] || [];

                    return (
                      <div
                        key={`${posts.length - 1 - index}`}
                        className="p-4 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 transition-all duration-300 hover:shadow-lg border border-border/50"
                      >
                        <div className="flex items-start gap-3">
                          <ProfilePicture userId={userId} userName={userName} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-foreground">
                                {userName}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {timestamp
                                  ? formatDistanceToNow(timestamp, {
                                      addSuffix: true,
                                    })
                                  : "Just now"}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed mb-3">
                              {content}
                            </p>

                            {/* Post Actions */}
                            <div className="flex items-center gap-4 text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setCommentingOnPost(originalIndex)
                                }
                                className="text-muted-foreground hover:text-primary transition-colors duration-200 p-0 h-auto"
                              >
                                <Reply className="w-4 h-4 mr-1" />
                                Reply
                              </Button>

                              {commentCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    togglePostExpansion(originalIndex)
                                  }
                                  className="text-muted-foreground hover:text-primary transition-colors duration-200 p-0 h-auto"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                  )}
                                  {commentCount}{" "}
                                  {commentCount === 1 ? "comment" : "comments"}
                                </Button>
                              )}

                              {/* Delete button - only show if user is post author or group admin */}
                              {(userId === currentUser?.id ||
                                group?.admin === currentUser?.id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeletePost(originalIndex)
                                  }
                                  disabled={deletingPost === originalIndex}
                                  className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-0 h-auto ml-auto"
                                >
                                  {deletingPost === originalIndex ? (
                                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive border-b-transparent" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Comment Input */}
                            {commentingOnPost === originalIndex && (
                              <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border/50">
                                <Textarea
                                  placeholder="Write a comment..."
                                  value={newCommentContent}
                                  onChange={(e) =>
                                    setNewCommentContent(e.target.value)
                                  }
                                  className="min-h-[60px] mb-3 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                                  disabled={addingComment}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setCommentingOnPost(null);
                                      setNewCommentContent("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleAddComment(originalIndex)
                                    }
                                    disabled={
                                      !newCommentContent.trim() || addingComment
                                    }
                                  >
                                    {addingComment ? (
                                      <>
                                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                                        Adding...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-3 h-3 mr-1" />
                                        Comment
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Comments Display */}
                            {isExpanded && postComments.length > 0 && (
                              <div className="mt-4 space-y-3 border-l-2 border-primary/20 pl-4">
                                {postComments.map((comment, commentIndex) => (
                                  <div
                                    key={commentIndex}
                                    className="flex items-start gap-2 group"
                                  >
                                    <ProfilePicture
                                      userId={comment.userId || null}
                                      userName={comment.user}
                                      size="w-8 h-8"
                                      textSize="text-xs"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm text-foreground">
                                            {comment.user}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                              new Date(comment.timestamp),
                                              {
                                                addSuffix: true,
                                              }
                                            )}
                                          </span>
                                        </div>

                                        {/* Delete comment button - only show if user is comment author or group admin */}
                                        {(comment.userId === currentUser?.id ||
                                          group?.admin === currentUser?.id) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleDeleteComment(
                                                originalIndex,
                                                commentIndex
                                              )
                                            }
                                            disabled={
                                              deletingComment ===
                                              `${originalIndex}-${commentIndex}`
                                            }
                                            className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-1 h-auto opacity-0 group-hover:opacity-100"
                                          >
                                            {deletingComment ===
                                            `${originalIndex}-${commentIndex}` ? (
                                              <div className="w-3 h-3 animate-spin rounded-full border-2 border-destructive border-b-transparent" />
                                            ) : (
                                              <Trash2 className="w-3 h-3" />
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Suggestion Popup */}
      <AISuggestionPopup
        isOpen={isAISuggestionOpen}
        onClose={() => setIsAISuggestionOpen(false)}
        onSuggestionSelect={handleAISuggestionSelect}
        userProfile={
          currentUser
            ? {
                interests: currentUser.interests || [],
                values: currentUser.values || [],
                lifestyle: currentUser.lifestyle || [],
                openai_persona: currentUser.openai_persona,
                full_name: currentUser.name,
              }
            : null
        }
      />
    </div>
  );
};

export default GroupDetail;
