import { z } from 'zod';
import { paginationSchema } from './common';

export const listNotificationsSchema = paginationSchema.extend({
  unreadOnly: z.coerce.boolean().optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>;
