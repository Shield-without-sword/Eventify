import React, { useState, useCallback, Suspense } from 'react';
import { Upload, Search, Grid, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';

const ImageCard = ({ src, alt, similarity = null }) => (
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

  // Fetch images when component mounts
  React.useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/api/images');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSearchResults(data.results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching faces:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxFiles: 1
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div {...getRootProps()} className="cursor-pointer">
                <div className={`
                  flex flex-col items-center justify-center w-full h-48
                  border-2 border-dashed rounded-xl transition-colors duration-200
                  bg-white/10 backdrop-blur-sm
                  ${isDragActive ? 'border-white border-opacity-80' : 'border-white/30 hover:border-white/50'}
                `}>
                  <Upload className={`w-8 h-8 mb-4 ${isDragActive ? 'text-white' : 'text-white/70'}`} />
                  <input {...getInputProps()} />
                  <p className="text-sm text-white text-center">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
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