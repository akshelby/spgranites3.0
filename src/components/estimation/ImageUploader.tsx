import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

export function ImageUploader({
  onImagesChange,
  existingImages = [],
  maxImages = 5,
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more image(s)`);
        return;
      }

      const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        toast.error('Please select valid image files');
        return;
      }

      setUploading(true);
      try {
        const uploadPromises = imageFiles.map(uploadImage);
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);

        const newImages = [...images, ...validUrls];
        setImages(newImages);
        onImagesChange(newImages);
        toast.success(`${validUrls.length} image(s) uploaded`);
      } catch (error) {
        toast.error('Failed to upload some images');
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          images.length >= maxImages && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={images.length >= maxImages || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxImages} images • JPG, PNG, WEBP
            </p>
          </label>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <img
                src={url}
                alt={`Reference ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {images.length < maxImages && !uploading && (
            <label
              htmlFor="image-upload"
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add more</span>
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Upload reference images, design inspirations, or existing stone samples
      </p>
    </div>
  );
}
