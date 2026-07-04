'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { fetchDocumentBlobUrl } from '@/services/document.service';
import { useMyDocuments, useUploadDocument } from '@/hooks/use-documents';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

export function ProfilePictureUpload({
  profileId,
  currentPicture,
}: {
  profileId: string;
  currentPicture: string | null;
}) {
  const { data } = useMyDocuments({ category: 'PROFILE_PICTURE' });
  const uploadMutation = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const latestPicture = data?.data.find((d) => d.status !== 'REJECTED');

  useEffect(() => {
    if (!latestPicture) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    fetchDocumentBlobUrl(latestPicture.id).then((url) => {
      if (cancelled) return;
      objectUrl = url;
      setPreviewUrl(url);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // Re-run only when the underlying document id changes, not on every
    // `data` re-render — `latestPicture` is derived fresh from `data` each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestPicture?.id]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ category: 'PROFILE_PICTURE', file });
      toast.success('Profile picture uploaded');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 pb-2">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-ash bg-periwinkle-mist">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- authenticated blob URL, not a static asset
          <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="font-serif text-[32px] text-off-black">{profileId.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? 'Uploading…' : currentPicture ? 'Change photo' : 'Upload photo'}
      </Button>
    </div>
  );
}
