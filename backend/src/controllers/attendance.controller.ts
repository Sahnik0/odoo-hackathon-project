import { ok, created, list as listResponse } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import * as attendanceService from '../services/attendance.service';

export const checkIn = asyncHandler(async (req, res) => {
  created(res, await attendanceService.checkIn(req.user!.id));
});

export const checkOut = asyncHandler(async (req, res) => {
  ok(res, await attendanceService.checkOut(req.user!.id));
});

export const myAttendance = asyncHandler(async (req, res) => {
  const { view } = req.query as { view: 'daily' | 'weekly' | 'monthly' };
  ok(res, await attendanceService.myAttendance(req.user!.id, view));
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await attendanceService.list(req.query as never);
  listResponse(res, data, meta);
});

export const markAbsent = asyncHandler(async (req, res) => {
  created(res, await attendanceService.markAbsent(req.body));
});
