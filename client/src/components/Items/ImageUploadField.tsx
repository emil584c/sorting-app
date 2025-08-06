import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadApi } from '@/lib/api';

interface ImageUploadFieldProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  multiple = false,
  required = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (Array.isArray(value)) {
      setPreviews(value.filter(v => v));
    } else if (value) {
      setPreviews([value]);
    } else {
      setPreviews([]);
    }
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      if (multiple) {
        // Upload multiple files
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const response = await uploadApi.single(files[i]);
          uploadedUrls.push(response.data.data.url);
        }
        
        const currentUrls = Array.isArray(value) ? value : (value ? [value] : []);
        const newUrls = [...currentUrls, ...uploadedUrls];
        onChange(newUrls);
      } else {
        // Upload single file
        const response = await uploadApi.single(files[0]);
        onChange(response.data.data.url);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (multiple && Array.isArray(value)) {
      const newUrls = value.filter((_, index) => index !== indexToRemove);
      onChange(newUrls);
    } else {
      onChange(multiple ? [] : '');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={openFileDialog}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : `Upload ${multiple ? 'Images' : 'Image'}`}
      </Button>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {url ? (
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            No {multiple ? 'images' : 'image'} uploaded yet
          </p>
          {required && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
      )}
    </div>
  );
};