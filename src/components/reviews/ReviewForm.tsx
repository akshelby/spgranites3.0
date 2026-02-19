import { useState, useRef } from 'react';
import { Star, ImagePlus, Video, X, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CustomerReview } from '@/types/database';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ReviewFormProps {
  editReview?: CustomerReview | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ editReview, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(editReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(editReview?.review_text || '');
  const [customerName, setCustomerName] = useState(editReview?.customer_name || '');
  const [city, setCity] = useState(editReview?.city || '');
  const [photos, setPhotos] = useState<string[]>(editReview?.photos || []);
  const [videoUrl, setVideoUrl] = useState(editReview?.video_url || '');
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
        <LogIn className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <h3 className="text-sm sm:text-base font-semibold mb-1">Sign in to leave a review</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
          Share your experience with SP Granites products and services
        </p>
        <Link to="/auth?redirect=/testimonials">
          <Button className="bg-primary text-primary-foreground">
            <LogIn className="h-4 w-4 mr-1.5" />
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = photos.length + newPhotos.length + files.length;
    if (totalPhotos > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setNewPhotos(prev => [...prev, ...validFiles]);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50MB');
      return;
    }
    setNewVideo(file);
    setVideoUrl('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeExistingPhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setNewVideo(null);
    setVideoUrl('');
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('reviews')
      .upload(`${folder}/${fileName}`, file, { cacheControl: '3600', upsert: false });
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(`${folder}/${fileName}`);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedPhotos = [...photos];
      let uploadFailed = false;
      for (const photo of newPhotos) {
        const url = await uploadFile(photo, 'photos');
        if (url) {
          uploadedPhotos.push(url);
        } else {
          uploadFailed = true;
        }
      }

      let finalVideoUrl = videoUrl;
      if (newVideo) {
        const url = await uploadFile(newVideo, 'videos');
        if (url) {
          finalVideoUrl = url;
        } else {
          uploadFailed = true;
        }
      }

      if (uploadFailed) {
        toast.error('Some files failed to upload. Your review will be saved without them.');
      }

      const reviewData = {
        user_id: user!.id,
        customer_name: customerName.trim(),
        rating,
        review_text: reviewText.trim(),
        photos: uploadedPhotos,
        video_url: finalVideoUrl || null,
        city: city.trim() || null,
        is_approved: true,
      };

      if (editReview) {
        const { error } = await supabase
          .from('customer_reviews')
          .update(reviewData as any)
          .eq('id', editReview.id)
          .eq('user_id', user!.id);
        if (error) throw error;
        toast.success('Review updated successfully!');
      } else {
        const { error } = await supabase
          .from('customer_reviews')
          .insert(reviewData as any);
        if (error) throw error;
        toast.success('Review posted successfully!');
      }

      setRating(5);
      setReviewText('');
      setCustomerName('');
      setCity('');
      setPhotos([]);
      setNewPhotos([]);
      setNewVideo(null);
      setVideoUrl('');
      onSuccess();
    } catch (err) {
      console.error('Review error:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allPhotoPreviews = [
    ...photos.map((url, i) => ({ type: 'existing' as const, url, index: i })),
    ...newPhotos.map((file, i) => ({ type: 'new' as const, url: URL.createObjectURL(file), index: i })),
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-3 sm:p-5">
      <h3 className="text-sm sm:text-base font-semibold mb-3">
        {editReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs sm:text-sm font-medium mb-1 block">Your Name</label>
          <Input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            className="text-xs sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1 block">City (optional)</label>
          <Input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter your city"
            className="text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1.5 block">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1 block">Your Review</label>
          <Textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your experience with SP Granites..."
            rows={3}
            className="text-xs sm:text-sm resize-none"
            required
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1.5 block">
            Photos ({photos.length + newPhotos.length}/5)
          </label>
          <div className="flex flex-wrap gap-2">
            {allPhotoPreviews.map((photo, idx) => (
              <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => photo.type === 'existing' ? removeExistingPhoto(photo.index) : removeNewPhoto(photo.index)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length + newPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[8px] sm:text-[10px] mt-0.5">Add Photo</span>
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium mb-1.5 block">Video (optional)</label>
          {(videoUrl || newVideo) ? (
            <div className="relative inline-flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm truncate max-w-[200px]">
                {newVideo ? newVideo.name : 'Video attached'}
              </span>
              <button type="button" onClick={removeVideo} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Video className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Add Video (max 50MB)</span>
            </button>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={submitting} className="text-xs sm:text-sm">
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              {editReview ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            editReview ? 'Update Review' : 'Submit Review'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs sm:text-sm">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
