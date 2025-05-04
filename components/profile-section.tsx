"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Mail, Phone, Upload, Loader2 } from "lucide-react"

type ProfileSectionProps = {
  user: any
  onProfileUpdate?: () => void
}

export function ProfileSection({ user, onProfileUpdate }: ProfileSectionProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    profile_image: user?.profile_image || "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserSupabaseClient()

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        profile_image: user.profile_image || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Supabase client directly - more reliable than API route
      const { data, error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", user.id)
        .select("*");

      if (error) {
        console.error("Error updating profile:", error);
        throw new Error(error.message || "Failed to update profile");
      }

      if (data && data.length > 0) {
        // Update local form data with the response data
        setFormData(prev => ({
          ...prev,
          ...(data[0] as object),
        }));
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a FormData object for the upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "profile-images");
      
      // Use our dedicated upload API endpoint that bypasses RLS restrictions
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important: include auth cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload error:", errorData);
        throw new Error(errorData.error || errorData.details || "Failed to upload image");
      }
      
      const data = await response.json();
      
      // After successful upload, update user profile with the new image URL
      const { data: userData, error: updateError } = await supabase
        .from("users")
        .update({
          profile_image: data.fileUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("Error updating profile with image:", updateError);
        throw new Error("Failed to update profile with new image");
      }

      // Update local form data with the new image URL
      setFormData(prev => ({
        ...prev,
        profile_image: data.fileUrl,
      }));

      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated.",
      });

      // Notify parent component that profile was updated
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Edit Profile
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(false)} variant="outline">
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32 cursor-pointer" onClick={handleImageClick}>
                <AvatarImage src={formData.profile_image || "/placeholder-user.jpg"} alt={formData.name} />
                <AvatarFallback className="text-2xl">{getInitials(formData.name)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer" onClick={handleImageClick}>
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                aria-label="Upload profile image"
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-sm text-gray-500">{user?.role === "both" ? "Provider & Seeker" : user?.role}</p>
            </div>

            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {formData.email}
              </div>
              {formData.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {formData.phone}
                </div>
              )}
              {formData.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {formData.location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell others about yourself..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                    <p>{formData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p>{formData.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                    <p>{formData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p>{formData.location || "Not provided"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                  <p className="whitespace-pre-line">
                    {formData.bio || "No bio provided. Tell others about yourself!"}
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
