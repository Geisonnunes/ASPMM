import { supabase } from "@/integrations/supabase/client";

const BUCKET = "photos";

/** Extrai o caminho do objeto a partir da URL pública do bucket `photos`. */
export function parsePhotosBucketPath(publicUrl: string): string | null {
  const marker = "/object/public/photos/";
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(publicUrl.slice(i + marker.length));
}

/** Upload para `photos/{pathPrefix}/{uuid}-{nome}` — URL pública de leitura. */
export async function uploadToPhotosBucket(
  file: File,
  pathPrefix: string,
): Promise<{ publicUrl: string; path: string } | { error: string }> {
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `${pathPrefix.replace(/\/$/, "")}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export async function removePhotosObjectByUrl(
  publicUrl: string | null | undefined,
): Promise<void> {
  if (!publicUrl) return;
  const path = parsePhotosBucketPath(publicUrl);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
