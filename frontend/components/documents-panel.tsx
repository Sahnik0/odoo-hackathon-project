'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { useDocumentList, useMyDocuments, useReviewDocument, useUploadDocument } from '@/hooks/use-documents';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import type { DocumentCategory } from '@/types/document';

const CATEGORIES: DocumentCategory[] = ['ID_PROOF', 'CONTRACT', 'OTHER'];

export function DocumentsPanel({
  employeeId,
  canReview,
}: {
  employeeId: string;
  canReview: boolean; // true on an admin viewing someone else's profile
}) {
  const ownQuery = useMyDocuments();
  const adminQuery = useDocumentList({ employeeId });
  const { data, isLoading } = canReview ? adminQuery : ownQuery;

  const uploadMutation = useUploadDocument();
  const reviewMutation = useReviewDocument();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const category = (categoryRef.current?.value ?? 'OTHER') as DocumentCategory;
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ category, file });
      toast.success('Document uploaded — pending review');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      e.target.value = '';
    }
  }

  async function handleReview(id: string, status: 'APPROVED' | 'REJECTED') {
    try {
      await reviewMutation.mutateAsync({ id, status });
      toast.success(`Document ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const documents = data?.data.filter((d) => d.category !== 'PROFILE_PICTURE') ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          {canReview ? 'Review uploaded ID proof and contracts.' : 'ID proof, contracts and other files.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!canReview && (
          <div className="flex items-center gap-3">
            <Select ref={categoryRef} defaultValue="ID_PROOF">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </Select>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              hidden
              onChange={handleUpload}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              {uploadMutation.isPending ? 'Uploading…' : 'Upload document'}
            </Button>
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={2} />
        ) : documents.length === 0 ? (
          <EmptyState title="No documents yet" description="Uploaded files will show up here for review." />
        ) : (
          <div className="flex flex-col divide-y divide-ash">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[14px] text-off-black">{doc.fileName}</p>
                  <p className="text-[12px] uppercase text-smoke">{doc.category.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={doc.status} />
                  {canReview && doc.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => handleReview(doc.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReview(doc.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
