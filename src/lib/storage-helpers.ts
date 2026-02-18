import { supabase } from "@/lib/supabaseClient"
import { STORAGE_BUCKETS } from "@/lib/constants"

export function getPublicImageUrl(path: string) {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
    .getPublicUrl(path)

  return data.publicUrl
}
