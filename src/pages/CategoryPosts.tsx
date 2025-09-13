import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, ArrowLeft, Zap, FileText, Send, VolumeX, Volume2, Play } from 'lucide-react';
import { usePosts, Comment } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

const CategoryPosts = () => {
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const { posts, loading, likePost, fetchComments, addComment } = usePosts();

  // Decode the category from URL
  const decodedCategory = category ? decodeURIComponent(category) : '';

  // Filter posts by category
  const categoryPosts = posts.filter(post => 
    post.category.toLowerCase() === decodedCategory.toLowerCase()
  );

  // Filter by type
  const normalPosts = categoryPosts.filter(post => post.type === 'post');
  const voroSparks = categoryPosts.filter(post => post.type === 'spark');

  // Get category display name
  const getCategoryDisplayName = (cat: string) => {
    const categoryMap: Record<string, string> = {
      'retail': 'Retail & E-commerce',
      'food': 'Food & Beverage',
      'automotive': 'Automotive',
      'realestate': 'Real Estate',
      'healthcare': 'Healthcare',
      'creative': 'Creative Services',
      'technology': 'Technology',
      'construction': 'Construction'
    };
    return categoryMap[cat] || cat;
  };

  const displayName = getCategoryDisplayName(decodedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pl-16">
      <Navbar />
      <main className="container mx-auto px-4 py-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="form-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/categories">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Categories
                </Button>
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {displayName}
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore ideas and innovations in {displayName.toLowerCase()}
              </p>
              <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>{categoryPosts.length} total posts</span>
                <span>•</span>
                <span>{normalPosts.length} posts</span>
                <span>•</span>
                <span>{voroSparks.length} sparks</span>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="gap-2">
                All ({categoryPosts.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="w-4 h-4" />
                Posts ({normalPosts.length})
              </TabsTrigger>
              <TabsTrigger value="sparks" className="gap-2">
                <Zap className="w-4 h-4" />
                Voro Sparks ({voroSparks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <PostFeed
                posts={categoryPosts}
                user={user}
                fetchComments={fetchComments}
                addComment={addComment}
                likePost={likePost}
                emptyMessage={`No posts found in ${displayName}. Be the first to share an idea in this category!`}
              />
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <PostFeed
                posts={normalPosts}
                user={user}
                fetchComments={fetchComments}
                addComment={addComment}
                likePost={likePost}
                emptyMessage={`No posts found in ${displayName}. Create the first post in this category!`}
              />
            </TabsContent>

            <TabsContent value="sparks" className="space-y-4">
              <PostFeed
                posts={voroSparks}
                user={user}
                fetchComments={fetchComments}
                addComment={addComment}
                likePost={likePost}
                emptyMessage={`No Voro Sparks found in ${displayName}. Share the first spark of inspiration in this category!`}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

type PostFeedProps = {
  posts: any[];
  user: any;
  fetchComments: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  likePost: (postId: string) => Promise<void>;
  emptyMessage?: string;
};

// Video component with Instagram Reels-like behavior
const VideoPlayer: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to detect when video is 50% visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVideoVisible = entry.intersectionRatio >= 0.5;
          setIsVisible(isVideoVisible);
          
          if (isVideoVisible) {
            // Auto-play when 50% visible
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              setIsPlaying(false);
            });
          } else {
            // Pause and mute when scrolled away
            video.pause();
            video.muted = true;
            setIsPlaying(false);
            setIsMuted(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  // Handle video tap to toggle play/pause
  const handleVideoTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  // Handle mute/unmute toggle
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video tap handler
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
  }, [isMuted]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16] overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        src={src}
        className={`absolute top-0 left-0 w-full h-full object-cover cursor-pointer ${className || ''}`}
        muted={isMuted}
        loop
        playsInline
        onClick={handleVideoTap}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Play/Pause overlay - only show when paused and visible */}
      {!isPlaying && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
      
      {/* Mute/Unmute button overlay - bottom right */}
      <button
        onClick={handleMuteToggle}
        className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all duration-200"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
};

const PostFeed: React.FC<PostFeedProps> = ({ posts, user, fetchComments, addComment, likePost, emptyMessage = "No content yet. Be the first to share an idea!" }) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  const toggleComments = async (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (expandedComments.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);

      if (!postComments[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId));
        const comments = await fetchComments(postId);
        setPostComments(prev => ({ ...prev, [postId]: comments }));
        setLoadingComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    }

    setExpandedComments(newExpanded);
  };

  const handleAddComment = async (postId: string) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    const success = await addComment(postId, content);
    if (success) {
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      const comments = await fetchComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setNewComments(prev => ({ ...prev, [postId]: value }));
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Error liking post', error);
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <p className="text-muted-foreground text-lg">{emptyMessage}</p>
          <Link to="/create" className="mt-4 inline-block">
            <Button variant="gradient" className="gap-2">
              <FileText className="w-4 h-4" />
              Create First Post
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const avatarSrc = post.user?.avatar?.trim() && post.user.avatar !== '/placeholder.svg' ? post.user.avatar : undefined;

        return (
          <Card key={post.id} className="overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                    {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{post.user?.name || 'Anonymous User'}</div>
                  <div className="text-sm text-muted-foreground">
                    {post.user?.username || '@anonymous'} • {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge
                  variant={post.type === 'spark' ? 'secondary' : 'default'}
                  className={post.type === 'spark' ? 'bg-accent/20 text-accent border-accent/30' : ''}
                >
                  {post.type === 'spark' ? (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Voro Spark
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 mr-1" />
                      Post
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-xl text-foreground">{post.caption}</h3>
                {post.description && <p className="text-muted-foreground mt-2 leading-relaxed">{post.description}</p>}
              </div>

              {post.image_url && (
                <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.caption}
                    className="w-full h-auto object-contain"
                    onError={handleImageError}
                  />
                </div>
              )}

              {post.video_url && (
                <VideoPlayer src={post.video_url} />
              )}

              <div className="flex items-center gap-6 pt-2 border-t border-border">
                <Button onClick={() => handleLike(post.id)} variant="ghost" size="sm" className="flex items-center gap-2 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count || 0}</span>
                </Button>
                <Button onClick={() => toggleComments(post.id)} variant="ghost" size="sm" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-green-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {expandedComments.has(post.id) && (
                <div className="border-t border-border pt-4 space-y-4">
                  {user && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                          {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={newComments[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComments[post.id]?.trim()}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {loadingComments.has(post.id) ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground">Loading comments...</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {postComments[post.id]?.map(comment => {
                        const commentAvatarSrc = comment.user?.avatar?.trim() && comment.user.avatar !== '/placeholder.svg'
                          ? comment.user.avatar
                          : undefined;

                        return (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={commentAvatarSrc} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg px-3 py-2">
                                <div className="font-medium text-sm text-foreground">
                                  {comment.user?.name || 'Anonymous User'}
                                </div>
                                <p className="text-sm text-foreground mt-1">{comment.content}</p>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 ml-3">
                                {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {postComments[post.id]?.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Badge variant="outline" className="w-fit">{post.category}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryPosts;