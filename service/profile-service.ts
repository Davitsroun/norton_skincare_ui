import { profileRoute } from '@/route/profileRoute';


export async function uploadProfileImageService(file: File) {
  const uploadFormData = new FormData();
  uploadFormData.set('file', file);

  const response = await fetch(profileRoute.uploadFile(), {
    method: 'POST',
    headers: {
      accept: '*/*',
    },
    cache: 'no-store',
    body: uploadFormData,
  });

  const result = await response.json();


  const fileUrl = result?.payload?.fileUrl ?? result?.fileUrl;
  if (!response.ok || !fileUrl) {
    console.error('Profile image upload failed', {
      status: response.status,
      result,
    });

    return {
      success: false,
      error: response.ok
        ? 'Image uploaded, but the upload response did not include a file URL.'
        : `Unable to upload profile image. Upload server returned ${response.status}.`,
    };
  }

  return {
    success: true,
    fileUrl,
  };
}
