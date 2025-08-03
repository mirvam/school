'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { Category, Condition, CreateListingFormData } from '@/types/marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryToDisplay, conditionToDisplay, uploadToIPFS, uploadMetadataToArweave } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Upload, 
  Loader2,
  ImageIcon,
  DollarSign
} from 'lucide-react';

export function CreateListingModal() {
  const { connected, publicKey } = useWallet();
  const { 
    isCreateListingModalOpen, 
    setCreateListingModalOpen,
    addListing 
  } = useMarketplaceStore();

  const [formData, setFormData] = useState<CreateListingFormData>({
    title: '',
    description: '',
    category: Category.Other,
    price: 0,
    condition: Condition.Good,
    images: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleInputChange = (field: keyof CreateListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const selectedFiles = files.slice(0, 5);
    setFormData(prev => ({ ...prev, images: selectedFiles }));

    // Create preview URLs
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images to IPFS (mock implementation)
      let imagesUri = '';
      if (formData.images.length > 0) {
        toast.loading('Uploading images...');
        imagesUri = await uploadToIPFS(formData.images[0]); // Use first image for demo
      }

      // Create metadata and upload to Arweave
      const metadata = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        images: imagePreview,
        seller: publicKey.toString(),
        createdAt: new Date().toISOString(),
      };
      
      toast.loading('Uploading metadata...');
      const metadataUri = await uploadMetadataToArweave(metadata);

      // Create the listing (mock - in production this would call the smart contract)
      const newListing = {
        publicKey: publicKey, // Mock listing ID
        seller: publicKey,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price * 1_000_000_000, // Convert to lamports
        condition: formData.condition,
        imagesUri,
        metadataUri,
        isActive: true,
        isSold: false,
        createdAt: Math.floor(Date.now() / 1000),
        bump: 255,
      };

      // Add to store
      addListing(newListing);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: Category.Other,
        price: 0,
        condition: Condition.Good,
        images: [],
      });
      setImagePreview([]);
      
      // Close modal
      setCreateListingModalOpen(false);
      
      toast.success('Listing created successfully!');
      
    } catch (error) {
      console.error('Failed to create listing:', error);
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      toast.dismiss();
    }
  };

  const handleClose = () => {
    setCreateListingModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: Category.Other,
      price: 0,
      condition: Condition.Good,
      images: [],
    });
    setImagePreview([]);
  };

  if (!isCreateListingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Listing</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="What are you selling?"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={2000}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(Category).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={formData.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('category', category)}
                  >
                    {categoryToDisplay(category)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Condition).map((condition) => (
                  <Badge
                    key={condition}
                    variant={formData.condition === condition ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleInputChange('condition', condition)}
                  >
                    {conditionToDisplay(condition)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Price (SOL)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">Images (Optional)</label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload images</span>
                    <span className="text-xs">PNG, JPG up to 10MB (max 5 images)</span>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="solana" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateListingModal;