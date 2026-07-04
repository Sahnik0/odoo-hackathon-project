import { ok } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import * as notificationService from '../services/notification.service';

// Same envelope as lib/apiResponse.list (success/data/meta), plus an extra
// unreadCount field the frontend badge needs on every page of results.
export const list = asyncHandler(async (req, res) => {
  const { data, meta, unreadCount } = await notificationService.list(req.user!.id, req.query as never);
  res.status(200).json({ success: true, data, meta, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  ok(res, await notificationService.markRead(req.params.id, req.user!.id));
});

export const markAllRead = asyncHandler(async (req, res) => {
  ok(res, await notificationService.markAllRead(req.user!.id));
});
