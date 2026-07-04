import type { Request } from 'express';
import { ok, created, list as listResponse } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import { resolveProfileId } from '../lib/profile';
import * as leaveService from '../services/leave.service';

function requester(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

const currentYear = () => new Date().getUTCFullYear();
const yearParam = (req: Request) => (req.query.year ? Number(req.query.year) : currentYear());

export const apply = asyncHandler(async (req, res) => {
  created(res, await leaveService.apply(req.user!.id, req.body));
});

export const listMine = asyncHandler(async (req, res) => {
  const { data, meta } = await leaveService.listMine(req.user!.id, req.query as never);
  listResponse(res, data, meta);
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await leaveService.list(req.query as never);
  listResponse(res, data, meta);
});

export const getById = asyncHandler(async (req, res) => {
  ok(res, await leaveService.getById(req.params.id, requester(req)));
});

export const review = asyncHandler(async (req, res) => {
  ok(res, await leaveService.review(req.params.id, req.body, req.user!.id));
});

export const cancel = asyncHandler(async (req, res) => {
  ok(res, await leaveService.cancel(req.params.id, requester(req)));
});

export const balanceMine = asyncHandler(async (req, res) => {
  const employeeProfileId = await resolveProfileId(req.user!.id);
  ok(res, await leaveService.getBalance(employeeProfileId, yearParam(req)));
});

export const balanceFor = asyncHandler(async (req, res) => {
  ok(res, await leaveService.getBalance(req.params.employeeId, yearParam(req)));
});
