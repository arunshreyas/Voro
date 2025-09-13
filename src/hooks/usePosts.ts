import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { name: string; avatar: string; username: string };
};

export type Post = {
  id: string;
  user_id: string;
  type: 'post' | 'spark';
  caption: string;
  description?: string;
  category: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: { name: string; avatar: string; username: string };
};

export type CreatePostData = {
  type: 'post' | 'spark';
  caption: string;
  description?: string;
  category: string;
  image_url?: string;
  video_url?: string;
};

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: postData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(postData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, any>) || {};

      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);
        userLikes = likesData?.map(l => l.post_id) || [];
      }

      const transformed: Post[] = postData.map(p => ({
        ...p,
        type: p.type as 'post' | 'spark',
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        user: {
          name: profileMap[p.user_id]?.full_name || 'User',
          avatar: profileMap[p.user_id]?.avatar_url || '/placeholder.svg',
          username: profileMap[p.user_id]?.username || `@user${p.user_id.slice(0, 8)}`,
        },
        isLiked: userLikes.includes(p.id),
      }));

      setPosts(transformed);
    } catch (err) {
      console.error('Error fetching posts:', err);
      toast({ title: 'Error', description: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: CreatePostData) => {
    if (!user) return false;
    try {
      const { data: newPostData, error } = await supabase
        .from('posts')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const post: Post = {
        ...newPostData,
        type: newPostData.type as 'post' | 'spark',
        likes_count: 0,
        comments_count: 0,
        user: {
          name: profile?.full_name || user.user_metadata?.full_name || 'You',
          avatar: profile?.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg',
          username: profile?.username || `@${user.email?.split('@')[0]}`,
        },
      };

      setPosts(prev => [post, ...prev]);
      toast({ title: 'Success!', description: `${data.type === 'post' ? 'Post' : 'Voro Spark'} created!` });
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
      return false;
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (existingLike) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
        await supabase.from('posts').update({ likes_count: post.likes_count - 1 }).eq('id', postId);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1, isLiked: false } : p));
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
        await supabase.from('posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1, isLiked: true } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
      toast({ title: 'Error', description: 'Failed to like post', variant: 'destructive' });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!commentsData) return [];

      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = profiles?.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>) || {};

      return commentsData.map(c => ({
        ...c,
        user: {
          name: profileMap[c.user_id]?.full_name || 'User',
          avatar: profileMap[c.user_id]?.avatar_url || '/placeholder.svg',
          username: profileMap[c.user_id]?.username || `@user${c.user_id.slice(0, 8)}`,
        },
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: user.id, content }])
        .select()
        .single();
      if (error) throw error;

      const post = posts.find(p => p.id === postId);
      if (post) setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));

      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  return { posts, loading, createPost, likePost, fetchComments, addComment, refetch: fetchPosts };
};
