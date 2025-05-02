import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("Image upload failed: No active session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("Processing image upload for user:", userId);

    // Get the form data (multipart/form-data) with the image file
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      console.error("No image file provided in the request");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("Image file received:", file.name, file.size, "bytes");

    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Use the server-side bucket creation endpoint to ensure the bucket exists
    try {
      // Create the bucket using our server-side API with service role
      const { error: bucketError } = await supabase.storage.getBucket('profile-images');
      
      // If bucket doesn't exist, create it
      if (bucketError && bucketError.message.includes('not found')) {
        console.log("Creating profile-images bucket with service role...");
        const { error: createError } = await supabase.storage.createBucket('profile-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          return NextResponse.json({ 
            error: "Unable to create storage bucket", 
            details: createError.message 
          }, { status: 500 });
        }
        console.log("Successfully created profile-images bucket");
      }
    } catch (error) {
      console.error("Error preparing bucket:", error);
    }

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image to storage:", uploadError);
      return NextResponse.json({ 
        error: "Failed to upload image", 
        details: uploadError.message 
      }, { status: 400 });
    }

    console.log("Image uploaded successfully to path:", uploadData?.path);

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log("Public image URL:", imageUrl);

    // Update user profile with new image URL
    const { data, error: updateError } = await supabase
      .from("users")
      .update({
        profile_image: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    if (updateError) {
      console.error("Error updating profile with new image URL:", updateError);
      return NextResponse.json({ 
        error: "Failed to update profile with image", 
        details: updateError.message 
      }, { status: 400 });
    }

    if (!data || data.length === 0) {
      console.error("No user found to update with ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile image updated successfully for user:", userId);
    return NextResponse.json({ 
      user: data[0],
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error("Server error during image upload:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: message 
    }, { status: 500 });
  }
}