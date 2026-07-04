import type { Request } from 'express';
import { ok, created, list as listResponse, noContent } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import * as employeeService from '../services/employee.service';

function requester(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await employeeService.list(req.query as never);
  listResponse(res, data, meta);
});

export const getMine = asyncHandler(async (req, res) => {
  ok(res, await employeeService.getMine(req.user!.id));
});

export const getById = asyncHandler(async (req, res) => {
  ok(res, await employeeService.getById(req.params.id, requester(req)));
});

export const create = asyncHandler(async (req, res) => {
  const profile = await employeeService.create(req.body, req.user!.id);
  created(res, profile);
});

export const update = asyncHandler(async (req, res) => {
  ok(res, await employeeService.update(req.params.id, req.body, requester(req)));
});

export const remove = asyncHandler(async (req, res) => {
  await employeeService.softDelete(req.params.id);
  noContent(res);
});
