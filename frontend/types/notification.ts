export type NotificationType =
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PAYROLL_GENERATED'
  | 'EMAIL_VERIFIED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_REJECTED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}
