import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image, Video, Zap, FileText } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define type for post form
type PostForm = {
  caption: string;
  description: string;
  category: string;
  type: 'post' | 'spark';
  image: File | null;
  video: File | null;
};

const CreatePost = () => {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    'Retail & E-commerce',
    'Food & Beverage',
    'Automotive',
    'Real Estate',
    'Healthcare',
    'Creative Services',
    'Technology',
    'Construction'
  ];

  const [newPost, setNewPost] = useState<PostForm>({
    caption: '',
    description: '',
    category: '',
    type: 'post',
    image: null,
    video: null
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.caption.trim()) return;

    if (!user) {
      console.log('User not authenticated');
      return;
    }

    setIsCreating(true);
    try {
      const upload = async (file: File, bucket: 'post-images' | 'post-videos') => {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      };

      let imageUrl: string | undefined = undefined;
      let videoUrl: string | undefined = undefined;

      if (newPost.image) {
        imageUrl = await upload(newPost.image, 'post-images');
      }
      if (newPost.video) {
        videoUrl = await upload(newPost.video, 'post-videos');
      }

      const success = await createPost({
        caption: newPost.caption,
        description: newPost.description,
        category: newPost.category,
        type: newPost.type,
        image_url: imageUrl,
        video_url: videoUrl,
      });

      if (success) {
        setNewPost({
          caption: '',
          description: '',
          category: '',
          type: 'post',
          image: null,
          video: null,
        });
        
        // Navigate back to ideas page after successful creation
        navigate('/ideas');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost(prev => ({ ...prev, image: file, video: null }));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost(prev => ({ ...prev, video: file, image: null }));
    }
  };

  return (
    <div className="min-h-screen bg-background pl-16">
      <Navbar />
      <main className="container mx-auto px-4 py-8 transition-all duration-300">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 form-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Create New Content
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your ideas with the community
            </p>
          </div>

          {/* Create Post Form */}
          <Card className="shadow-card border-border form-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New {newPost.type === 'spark' ? 'Voro Spark' : 'Post'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newPost.type === 'post' ? 'gradient' : 'outline'}
                    onClick={() => setNewPost(prev => ({ ...prev, type: 'post' }))}
                    className="flex-1 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Post
                  </Button>
                  <Button
                    type="button"
                    variant={newPost.type === 'spark' ? 'gradient' : 'outline'}
                    onClick={() => setNewPost(prev => ({ ...prev, type: 'spark' }))}
                    className="flex-1 gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Voro Spark
                  </Button>
                </div>

                <Input
                  placeholder="What's your idea?"
                  value={newPost.caption}
                  onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                  required
                />

                <Textarea
                  placeholder="Tell us more about it..."
                  value={newPost.description}
                  onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-accent/10 transition-colors">
                      <Image className="w-4 h-4" />
                      <span className="text-sm">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md hover:bg-accent/10 transition-colors">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">Add Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {newPost.image && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(newPost.image)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                {newPost.video && (
                  <div className="relative">
                    <video
                      src={URL.createObjectURL(newPost.video)}
                      className="w-full h-48 object-cover rounded-md"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setNewPost(prev => ({ ...prev, video: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/ideas')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newPost.caption.trim() || !newPost.category}
                    className="flex-1"
                    variant="gradient"
                  >
                    {isCreating ? 'Creating...' : `Create ${newPost.type === 'spark' ? 'Voro Spark' : 'Post'}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;