import { supabase } from './supabase';

export interface NoteMetadata {
  title: string;
  institution: string;
  course_code: string;
  description: string;
}

export async function uploadRawNote(
  file: File,
  metadata: NoteMetadata,
  onProgress?: (progress: number) => void
) {
  try {
    // 1. Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("You must be logged in to upload notes.");
    }
    
    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${userId}/${Date.now()}_${sanitized}`;

    // 2. Pre-flight: Request Signed Upload URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('raw_notes')
      .createSignedUploadUrl(fileName);

    if (signedUrlError || !signedUrlData) {
      throw new Error(`Failed to generate upload URL: ${signedUrlError?.message || 'Unknown error'}. Ensure the "raw_notes" storage bucket exists in your Supabase project.`);
    }

    const { signedUrl, token } = signedUrlData;

    // 3. Upload directly using XMLHttpRequest for real-time progress tracking
    // Falls back to SDK method if XHR fails (e.g., CORS issues)
    onProgress?.(0);

    const uploadSuccess = await new Promise<boolean>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('x-upsert', 'true');

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
      xhr.onerror = () => resolve(false);
      xhr.send(file);
    });

    // If XHR failed, fall back to the official Supabase SDK method
    if (!uploadSuccess) {
      console.warn('XHR upload failed, falling back to SDK uploadToSignedUrl...');
      onProgress?.(50);

      const { error: uploadError } = await (supabase.storage
        .from('raw_notes') as any)
        .uploadToSignedUrl(fileName, token, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      onProgress?.(100);
    }

    // 4. Database Sync: Insert record with status 'processing'
    const { data: noteData, error: dbError } = await supabase
      .from('notes')
      .insert([
        {
          seller_id: userId,
          title: metadata.title,
          institution: metadata.institution,
          course_code: metadata.course_code,
          description: metadata.description,
          file_path: fileName,
          status: 'processing',
          price_zar: 0 // Placeholder until the valuation engine processes it
        }
      ])
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database sync failed: ${dbError.message}`);
    }

    return noteData;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}
