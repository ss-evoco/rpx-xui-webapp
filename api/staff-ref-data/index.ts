import { NextFunction, Response } from 'express';
import { handleGet, handlePost } from '../common/mockService';
import { StaffDataUser } from './models/staff-data-user.model';
import { StaffFilterOption } from './models/staff-filter-option.model';
import * as mock from './staff-ref-data.mock';

mock.init();

export async function getFilteredUsers(req, res: Response, next: NextFunction) {
  const reqBody = req.body;
  const apiPath: string = `/refdata/case-worker/profile`;

  try {
    const {status, data}: { status: number, data: StaffDataUser[] } = await handlePost(apiPath, reqBody, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function getUserTypes(req, res: Response, next: NextFunction) {
  const apiPath: string = `/refdata/case-worker/user-type`;

  try {
    const {status, data}: { status: number, data: StaffFilterOption[] } = await handleGet(apiPath, req);
    res.status(status).send(sortArray(data));
  } catch (error) {
    next(error);
  }
}

export async function getJobTitles(req, res: Response, next: NextFunction) {
  const apiPath: string = `/refdata/case-worker/job-title`;

  try {
    const {status, data}: { status: number, data: StaffFilterOption[] } = await handleGet(apiPath, req);
    res.status(status).send(sortArray(data));
  } catch (error) {
    next(error);
  }
}

export async function getSkills(req, res: Response, next: NextFunction) {
  const apiPath: string = `/refdata/case-worker/skill`;

  try {
    const {status, data}: { status: number, data } = await handleGet(apiPath, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function getServices(req, res: Response, next: NextFunction) {
  const apiPath: string = `/refdata/case-worker/services`;

  try {
    const {status, data}: { status: number, data: StaffFilterOption[] } = await handleGet(apiPath, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function getUsersByPartialName(req, res: Response, next: NextFunction) {
  const searchParam = req.query.search ? req.query.search : '';
  const apiPath: string = `/refdata/case-worker/profile/search?search=${searchParam}`;

  try {
    const {status, data}: { status: number, data: StaffDataUser[] } = await handleGet(apiPath, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function getStaffRefUserDetails(req, res: Response, next: NextFunction) {
  const id = req.params.id;
  const apiPath: string = `/refdata/case-worker/user-details/${id}`;

  try {
    const {status, data}: { status: number, data: StaffDataUser } = await handleGet(apiPath, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function addNewUser(req, res: Response, next: NextFunction) {
  const reqBody = req.body;
  const apiPath: string = `/refdata/case-worker/profile`;

  try {
    const {status, data}: { status: number, data: StaffDataUser } = await handlePost(apiPath, reqBody, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export function sortArray(array: StaffFilterOption[]) {
  return array.sort((a, b) => a.label.localeCompare(b.label));
}