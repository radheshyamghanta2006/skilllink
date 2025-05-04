// filepath: c:\Users\Suman Jana\Desktop\skilllink\app\api\storage\upload\route.ts
import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    console.log("Storage upload API: Starting process");
    
    // Create a standard client to verify authentication
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });
    
    // Create a service role client with admin privileges to bypass RLS
    const serviceClient = createServerSupabaseClient();

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Upload failed: No active session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("Processing upload for user:", userId);

    // Get form data containing the file
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucketName = formData.get("bucket") as string || "profile-images";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`File received: ${file.name}, size: ${file.size} bytes, bucket: ${bucketName}`);

    // Check if bucket exists, create if it doesn't
    try {
      const { data: bucket, error: bucketError } = await serviceClient.storage.getBucket(bucketName);
      
      if (bucketError) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createError } = await serviceClient.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          return NextResponse.json({ 
            error: "Failed to create storage bucket", 
            details: createError.message 
          }, { status: 500 });
        }
        
        console.log("Setting public access policy for bucket");
        await serviceClient.storage.from(bucketName).setPublic(true);
      }
    } catch (error) {
      console.error("Error with bucket operation:", error);
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    console.log(`Uploading file as: ${fileName}`);

    // Upload the file using the service client (with admin privileges)
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ 
        error: "Failed to upload file", 
        details: uploadError.message,
        code: uploadError.code
      }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = serviceClient.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;
    console.log("File uploaded successfully, public URL:", fileUrl);

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      fileName: fileName,
      filePath: uploadData.path
    });
    
  } catch (error) {
    console.error("Server error during upload:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: message 
    }, { status: 500 });
  }
}