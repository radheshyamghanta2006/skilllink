import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Create a server-side Supabase client with service role key
    const supabase = createServerSupabaseClient();
    
    const { bucketName } = await request.json();
    
    if (!bucketName) {
      return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
    }
    
    console.log(`Creating storage bucket: ${bucketName}`);
    
    // Try to get the bucket first to see if it already exists
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucketName);
    
    // If the bucket already exists, return success
    if (existingBucket) {
      console.log(`Bucket "${bucketName}" already exists`);
      return NextResponse.json({ 
        success: true, 
        message: `Bucket "${bucketName}" already exists`,
        bucket: existingBucket
      });
    }
    
    // Create the bucket using service role permissions
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (error) {
      console.error(`Error creating bucket "${bucketName}":`, error);
      return NextResponse.json({ 
        error: "Failed to create storage bucket", 
        details: error.message 
      }, { status: 500 });
    }
    
    console.log(`Successfully created bucket "${bucketName}"`);
    return NextResponse.json({ 
      success: true, 
      message: `Bucket "${bucketName}" created successfully`,
      bucket: data
    });
  } catch (error) {
    console.error("Server error creating bucket:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: message 
    }, { status: 500 });
  }
}