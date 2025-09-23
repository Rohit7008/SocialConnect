import { supabaseClient } from "./supabaseClient";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function uploadImage(
  file: File,
  pathPrefix: string
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image exceeds 2MB");
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "avatars";
  const filePath = `${pathPrefix}/${Date.now()}-${file.name}`;
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;

  const { data: urlData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}
