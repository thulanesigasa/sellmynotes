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
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 2. Pre-flight: Request Signed Upload URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('raw_notes')
      .createSignedUploadUrl(fileName);

    if (signedUrlError || !signedUrlData) {
      throw new Error(`Failed to generate signed URL: ${signedUrlError?.message || 'Unknown error'}`);
    }

    const { signedUrl } = signedUrlData;

    // 3. Upload: PUT directly using XMLHttpRequest for native progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload.'));
      };

      xhr.send(file);
    });

    // 4. Database Sync: Insert record
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
          price_zar: 0 // Placeholder until valuation algorithm processes it
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
