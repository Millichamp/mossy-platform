import React, { useState, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

export interface UploadedImage {
  url: string;
  caption: string;
  isMain?: boolean;
  progress?: number;
  error?: string;
  file?: File;
}

export interface Step5Form {
  images: UploadedImage[];
  floorPlan?: string;
  virtualTourUrl?: string;
}

interface PropertyListingStep5Props {
  data: Partial<Step5Form>;
  onNext: (data: Step5Form) => void;
  onBack: () => void;
}

export const PropertyListingStep5: React.FC<PropertyListingStep5Props> = ({ data, onNext, onBack }) => {
  const [images, setImages] = useState<UploadedImage[]>(data.images || []);
  const [floorPlan, setFloorPlan] = useState(data.floorPlan || '');
  const [virtualTourUrl, setVirtualTourUrl] = useState(data.virtualTourUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);

  const uploadToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `listings/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading file:', fileName, 'Size:', file.size);
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      console.log('Upload successful:', data);
      
      const { data: publicURL } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      if (!publicURL.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      return publicURL.publicUrl;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 20;

    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Please use JPG, PNG, or WEBP.`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Add placeholder with loading state
      const tempImage: UploadedImage = {
        url: '',
        caption: '',
        progress: 0,
        file
      };

      setImages(prev => [...prev, tempImage]);

      try {
        const url = await uploadToSupabase(file);
        setImages(prev => prev.map(img => 
          img.file === file ? { ...img, url, progress: 100 } : img
        ));
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        alert(`Failed to upload ${file.name}: ${errorMessage}`);
        setImages(prev => prev.map(img => 
          img.file === file ? { ...img, error: errorMessage } : img
        ));
      }
    }
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const setMainImage = (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isMain: true } : { ...img, isMain: false }
    ));
  };

  const handleFloorPlanUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please use JPG, PNG, or WEBP format');
      }
      
      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB');
      }
      
      const url = await uploadToSupabase(file);
      setFloorPlan(url);
      
    } catch (error) {
      console.error('Error uploading floor plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`Failed to upload floor plan: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFloorPlan = () => {
    setFloorPlan('');
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const canSubmit = images.length >= 3 && images.every(img => img.url && !img.error);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    onNext({
      images: images.map(({ file, progress, ...img }) => img),
      floorPlan,
      virtualTourUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Photos</label>
        <div 
          className={`border-2 border-dashed rounded p-8 text-center ${
            dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="text-gray-400">
            <p className="mb-2">Drag & drop images here or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Browse Files
            </button>
            <p className="text-xs mt-2">JPG, PNG, WEBP accepted (min 3, max 20, 10MB each)</p>
          </div>
        </div>
        
        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                {img.url ? (
                  <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                {img.isMain && (
                  <div className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-1 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <label className="block font-semibold mb-1">Floor Plan (optional)</label>
        {floorPlan ? (
          <div className="relative">
            <img src={floorPlan} alt="Floor plan" className="w-full max-w-md h-auto border rounded" />
            <button
              type="button"
              onClick={removeFloorPlan}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded p-4 text-center text-gray-400 bg-gray-50">
            <input
              type="file"
              ref={floorPlanInputRef}
              onChange={(e) => e.target.files?.[0] && handleFloorPlanUpload(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => floorPlanInputRef.current?.click()}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP accepted</p>
          </div>
        )}
      </div>
      
      <div>
        <label className="block font-semibold mb-1">Virtual Tour (optional)</label>
        <input
          type="url"
          value={virtualTourUrl}
          onChange={(e) => setVirtualTourUrl(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="https://my.matterport.com/show/?m=example"
        />
      </div>
      
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">
          Back
        </button>
        <button 
          type="submit" 
          disabled={!canSubmit}
          className={`px-6 py-2 rounded font-semibold transition ${
            canSubmit 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </form>
  );
};
