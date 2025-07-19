
import { supabase } from '../lib/supabaseClient';
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

/**
 * Downloads an image from a URL and uploads it to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageToSupabase(imageUrl: string, bucket: string = 'Images'): Promise<string> {
  // Download the image as a buffer
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
  const buffer = await response.buffer();

  // Generate a unique filename with extension
  const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${uuidv4()}.${ext}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: response.headers.get('content-type') || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  // Return the public URL
  const publicUrl = `${supabase.storage.from(bucket).getPublicUrl(filename).data.publicUrl}`;
  return publicUrl;
}
