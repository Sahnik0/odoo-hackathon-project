import type { Request } from 'express';
import { ok, created, list as listResponse } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import * as payrollService from '../services/payroll.service';

function requester(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

export const getSalaryStructure = asyncHandler(async (req, res) => {
  ok(res, await payrollService.getSalaryStructure(req.params.employeeId, requester(req)));
});

export const upsertSalaryStructure = asyncHandler(async (req, res) => {
  ok(res, await payrollService.upsertSalaryStructure(req.params.employeeId, req.body));
});

export const generate = asyncHandler(async (req, res) => {
  created(res, await payrollService.generate(req.body, req.user!.id));
});

export const listMine = asyncHandler(async (req, res) => {
  const { data, meta } = await payrollService.listMine(req.user!.id, req.query as never);
  listResponse(res, data, meta);
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await payrollService.list(req.query as never);
  listResponse(res, data, meta);
});

export const getById = asyncHandler(async (req, res) => {
  ok(res, await payrollService.getById(req.params.id, requester(req)));
});
