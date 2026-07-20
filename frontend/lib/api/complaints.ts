import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export async function uploadPhotoToCloudinary(file: File): Promise<string> {
  // Upload through backend endpoint which has Cloudinary credentials
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'casecraft/complaints');
  
  try {
    const res = await axios.post(`${API_BASE}/api/upload`, formData);
    return res.data.url || res.data.secure_url;
  } catch (err: any) {
    console.error('Photo upload failed:', {
      status: err?.response?.status,
      errorMessage: err?.response?.data?.detail || err?.message,
    });
    throw err;
  }
}
