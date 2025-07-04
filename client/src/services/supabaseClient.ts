import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage.from('videos').getPublicUrl(path)
  return data.publicUrl
}

export const uploadVideo = async (file: File, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    return {
      data: {
        path: data.path,
        id: data.id || fileName,
        fullPath: data.fullPath
      },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error as Error
    }
  }
}