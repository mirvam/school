'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { UserFormData } from '@/types/marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { 
  X, 
  User, 
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';

export function CreateUserModal() {
  const { connected, publicKey } = useWallet();
  const { 
    isCreateUserModalOpen, 
    setCreateUserModalOpen,
    setUserAccount 
  } = useMarketplaceStore();

  const [formData, setFormData] = useState<UserFormData>({
    displayName: '',
    bio: '',
    location: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    if (formData.displayName.length > 50) {
      toast.error('Display name must be 50 characters or less');
      return;
    }

    if (formData.bio.length > 500) {
      toast.error('Bio must be 500 characters or less');
      return;
    }

    if (formData.location.length > 100) {
      toast.error('Location must be 100 characters or less');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the smart contract to create user account
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network call
      
      // Create user account object
      const userAccount = {
        authority: publicKey,
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        reputationScore: 0,
        totalReviews: 0,
        totalSales: 0,
        totalPurchases: 0,
        isVerified: false,
        verificationAttestation: undefined,
        createdAt: Math.floor(Date.now() / 1000),
        bump: 255,
      };

      // Update store
      setUserAccount(userAccount);
      
      // Reset form
      setFormData({
        displayName: '',
        bio: '',
        location: '',
      });
      
      // Close modal
      setCreateUserModalOpen(false);
      
      toast.success('Profile created successfully!');
      
    } catch (error) {
      console.error('Failed to create user account:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreateUserModalOpen(false);
    setFormData({
      displayName: '',
      bio: '',
      location: '',
    });
  };

  if (!isCreateUserModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Create Your Profile</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.displayName.length}/50 characters
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City, Country"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  maxLength={100}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.location.length}/100 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Creating your on-chain profile</p>
                  <p className="text-muted-foreground">
                    Your profile will be stored on the Solana blockchain. This enables reputation 
                    tracking and allows other users to verify your identity and transaction history.
                  </p>
                </div>
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
                  'Create Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateUserModal;