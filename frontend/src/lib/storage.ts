import { supabase } from './supabase';

export interface NoteMetadata {
  title: string;
  institution: string;
  course_code: string;
}

export async function uploadFileDirectly(file: File, metadata: NoteMetadata) {
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

    if (signedUrlError) {
      throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
    }

    const { token } = signedUrlData;

    // 3. Upload: PUT directly using the signed URL token
    const { error: uploadError } = await supabase.storage
      .from('raw_notes')
      .uploadToSignedUrl(fileName, token, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 4. Database Sync: Insert record
    const { data: noteData, error: dbError } = await supabase
      .from('notes')
      .insert([
        {
          seller_id: userId,
          title: metadata.title,
          institution: metadata.institution,
          course_code: metadata.course_code,
          file_path: fileName,
          status: 'processing',
          price_zar: 0 // Placeholder until AI processes it
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
