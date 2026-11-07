'use client';

import { createClient } from '@supabase/supabase-js';

let client;

/** Browser Supabase client (public anon key). Only used for one-time signed uploads. */
export function supabaseBrowser() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return client;
}

export async function uploadToSignedUrl(bucket, path, token, blob) {
  const { error } = await supabaseBrowser()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
  if (error) throw error;
}
