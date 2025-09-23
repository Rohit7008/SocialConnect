import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { detail: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { detail: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${auth.sub}/${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Try to create bucket if it doesn't exist, then upload
    try {
      // First try to list buckets to see if 'posts' exists
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const postsBucketExists = buckets?.some(
        (bucket) => bucket.name === "posts"
      );

      if (!postsBucketExists) {
        // Create the posts bucket
        await supabaseAdmin.storage.createBucket("posts", {
          public: true,
          allowedMimeTypes: ["image/*"],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
      }
    } catch (bucketError) {
      // Bucket might already exist or creation failed, continue with upload
      console.log("Bucket creation/check failed:", bucketError);
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("posts")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("posts")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    return NextResponse.json({ detail: "Upload failed" }, { status: 500 });
  }
}
