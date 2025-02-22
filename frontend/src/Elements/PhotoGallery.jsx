import React, { useState, useCallback, Suspense } from 'react';
import { Upload, Search, Grid, Loader2, Plus, X, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'sonner';

const ImageCard = ({ src, alt, similarity = null, onRemove = null }) => (
  <Card className="group transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm">
    <CardContent className="p-0 relative">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {similarity !== null && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm backdrop-blur-sm">
          Match: {(similarity * 100).toFixed(1)}%
        </div>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </CardContent>
  </Card>
);

const UploadPreview = ({ file, onRemove, uploadProgress, uploadStatus }) => (
  <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm">
    <CardContent className="p-0">
      <img
        src={URL.createObjectURL(file)}
        alt="Upload preview"
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
        {uploadStatus === 'uploading' && (
          <>
            <div className="mb-2">Uploading... {uploadProgress}%</div>
            <div className="w-3/4 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        )}
        {uploadStatus === 'success' && (
          <CheckCircle className="w-12 h-12 text-green-400" />
        )}
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </CardContent>
  </Card>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-64">
    <Loader2 className="w-8 h-8 animate-spin text-white" />
  </div>
);

const PhotoGallery = () => {
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [uploadQueue, setUploadQueue] = useState([]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchImages();
  }, []);

  const uploadImage = async (file) => {
    const uploadId = Date.now().toString();
    const newUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading'
    };
    
    setUploadQueue(prev => [...prev, newUpload]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      setUploadQueue(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'success', progress: 100 }
            : upload
        )
      );

      fetchImages();
      toast.success('Image uploaded successfully');

      setTimeout(() => {
        setUploadQueue(prev => prev.filter(upload => upload.id !== uploadId));
      }, 2000);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadQueue(prev => prev.filter(upload => upload.id !== uploadId));
    }
  };

  const onGalleryDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.forEach(file => {
      toast.promise(uploadImage(file), {
        loading: 'Uploading image...',
        success: 'Image uploaded successfully',
        error: 'Failed to upload image'
      });
    });
  }, []);

  const onSearchDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    toast.promise(
      fetch('http://localhost:8000/api/search', {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        const data = await response.json();
        setSearchResults(data.results);
        setActiveTab('search');
      }).finally(() => setIsLoading(false)),
      {
        loading: 'Searching faces...',
        success: 'Search completed',
        error: 'Face search failed'
      }
    );
  }, []);

  const { getRootProps: getGalleryRootProps, getInputProps: getGalleryInputProps, isDragActive: isGalleryDragActive } = useDropzone({
    onDrop: onGalleryDrop,
    accept: {'image/*': []},
  });

  const { getRootProps: getSearchRootProps, getInputProps: getSearchInputProps, isDragActive: isSearchDragActive } = useDropzone({
    onDrop: onSearchDrop,
    accept: {'image/*': []},
    maxFiles: 1
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500">
      <Toaster 
        position="top-right"
        expand={true}
        richColors
      />
      <div className="container mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 gap-4 p-1 bg-white/10 rounded-lg">
              <TabsTrigger 
                value="gallery" 
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Grid className="w-4 h-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="flex items-center gap-2 text-white data-[state=active]:bg-white/20"
              >
                <Search className="w-4 h-4" />
                Face Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="space-y-6">
              <div {...getGalleryRootProps()} className="cursor-pointer">
                <div className={`
                  flex flex-col items-center justify-center w-full h-32
                  border-2 border-dashed rounded-xl transition-colors duration-200
                  bg-white/10 backdrop-blur-sm
                  ${isGalleryDragActive ? 'border-white border-opacity-80' : 'border-white/30 hover:border-white/50'}
                `}>
                  <Plus className={`w-8 h-8 mb-4 ${isGalleryDragActive ? 'text-white' : 'text-white/70'}`} />
                  <input {...getGalleryInputProps()} />
                  <p className="text-sm text-white text-center">
                    {isGalleryDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select'}
                  </p>
                </div>
              </div>

              {uploadQueue.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {uploadQueue.map(upload => (
                    <UploadPreview
                      key={upload.id}
                      file={upload.file}
                      uploadProgress={upload.progress}
                      uploadStatus={upload.status}
                      onRemove={() => setUploadQueue(prev => prev.filter(u => u.id !== upload.id))}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {images.map((image) => (
                    <ImageCard 
                      key={image._id}
                      src={image.cloudinary_url}
                      alt={image.filename}
                    />
                  ))}
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-8">
              <div {...getSearchRootProps()} className="cursor-pointer">
                <div className={`
                  flex flex-col items-center justify-center w-full h-48
                  border-2 border-dashed rounded-xl transition-colors duration-200
                  bg-white/10 backdrop-blur-sm
                  ${isSearchDragActive ? 'border-white border-opacity-80' : 'border-white/30 hover:border-white/50'}
                `}>
                  <Upload className={`w-8 h-8 mb-4 ${isSearchDragActive ? 'text-white' : 'text-white/70'}`} />
                  <input {...getSearchInputProps()} />
                  <p className="text-sm text-white text-center">
                    {isSearchDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
                  </p>
                </div>
              </div>

              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((result) => (
                    <ImageCard
                      key={result._id}
                      src={result.cloudinary_url}
                      alt="Search result"
                      similarity={result.similarity}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;