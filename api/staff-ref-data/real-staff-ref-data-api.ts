import { StaffRefDataAPI } from './models/staff-ref-data.model';
import { SERVICES_CASE_CASEWORKER_REF_PATH, SERVICE_REF_DATA_MAPPING } from '../configuration/references';
import { getConfigValue } from '../configuration';
import { handleGet, handlePost } from '../common/crudService';
import * as querystring from 'querystring';
import { NextFunction, Response } from 'express';
import { StaffDataUser, StaffDataAPI, WorkArea } from './models/staff-data-user.model';
import { GroupOption, StaffFilterOption, Service } from './models/staff-filter-option.model';

export class RealStaffRefDataAPI implements StaffRefDataAPI {
  public baseCaseWorkerRefUrl = getConfigValue(SERVICES_CASE_CASEWORKER_REF_PATH);

  async getFilteredUsers(req: any, res: Response, next: NextFunction) {
    const parsed = querystring.stringify(req.query);
    try {
      const apiPath = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/profile/search?${parsed}`;
      const { status, data }: { status: number, data: StaffDataUser[] } = await handleGet(apiPath, req, next);
      res.status(status).send(data);
    } catch (error) {
      next(error);
    }
  }

  async getUserTypes(req, res: Response, next: NextFunction) {
    const apiPath: string = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/user-type`;

    try {
      const { status, data }: { status: number, data } = await handleGet(apiPath, req, next);

      const options: StaffFilterOption[] = [];
      data.user_type.forEach(element => {
        options.push({ key: element.id, label: element.code });
      });

      res.status(status).send(this.sortArray(options));
    } catch (error) {
      next(error);
    }
  }

  async getJobTitles(req, res: Response, next: NextFunction) {
    const apiPath: string = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/job-title`;

    try {
      const { status, data }: { status: number, data } = await handleGet(apiPath, req, next);

      const options: StaffFilterOption[] = [];
      data.job_title.forEach(element => {
        options.push({ key: element.role_id, label: element.role_description });
      });

      res.status(status).send(this.sortArray(options));
    } catch (error) {
      next(error);
    }
  }

  async getServices(req, res: Response, next: NextFunction) {
    const apiPath: string = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/skill`;

    try {
      const { status, data }: { status: number, data } = await handleGet(apiPath, req, next);

      const options: StaffFilterOption[] = [];
      const serviceRefData = getConfigValue(SERVICE_REF_DATA_MAPPING) as Service[];
      data.service_skill.forEach(element => {
        serviceRefData.forEach(service => {
          const selectedServiceCodes = service.serviceCodes.filter(s => s === element.id);
          if (selectedServiceCodes.length > 0) {
            options.push({ key: element.id, label: service.service });
          }
        });
      });

      res.status(status).send(options);
    } catch (error) {
      next(error);
    }
  }

  async getSkills(req, res: Response, next: NextFunction) {
    const apiPath: string = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/skill`;

    try {
      const { status, data }: { status: number, data } = await handleGet(apiPath, req, next);

      const groupOptions: GroupOption[] = [];
      data.service_skill.forEach(services => {
        const options: StaffFilterOption[] = [];
        services.skills.forEach(skill => {
          options.push({ key: skill.id, label: skill.description });
        });
        groupOptions.push({ group: services.id, options });
      });

      res.status(status).send(groupOptions);
    } catch (error) {
      next(error);
    }
  }

  async getUsersByPartialName(req, res: Response, next: NextFunction) {
    const searchParam = req.query.search ? req.query.search : '';
    const apiPath = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/profile/search-by-name?search=${searchParam}`;
    try {
      const { status, data }: { status: number, data: StaffDataUser[] } = await handleGet(apiPath, req, next);
      res.status(status).send(data);
    } catch (error) {
      next(error);
    }
  }

  sortArray(array: StaffFilterOption[]) {
    return array.sort((a, b) => a.label.localeCompare(b.label));
  }

  async addNewUser(req, res: Response, next: NextFunction) {
    const reqBody = req.body;
    const apiPath: string = `/refdata/case-worker/profile`;

    try {
      const {status, data}: { status: number, data: StaffDataUser } =
        await handlePost(`${this.baseCaseWorkerRefUrl}${apiPath}`, reqBody, req, next);
      res.status(status).send(data);
    } catch (error) {
      next(error);
    }
  }

  async getStaffRefUserDetails(req, res, next: NextFunction) {
    const reqbody = req.body;
    const apiPath = `${this.baseCaseWorkerRefUrl}/refdata/case-worker/users/fetchUsersById`;

    try {
      const { status, data }: { status: number; data: StaffDataAPI[] } = await handlePost(apiPath, reqbody, req, next);
      const thisUser = this.getUserInfoFromDetails(data);
      res.status(status).send(thisUser);
    } catch (error) {
      next(error);
    }
  }

  getUserInfoFromDetails(userInfo: StaffDataAPI[]): StaffDataUser[] {
    const finalUserInfo = [];
    userInfo.forEach(userDetails => {
      let newUserInfo;
      newUserInfo = this.setRoleInfo(userDetails);
      newUserInfo = this.setLocationInfo(newUserInfo);
      newUserInfo.services = this.getServiceLabels(newUserInfo.work_area);
      newUserInfo.firstName = newUserInfo.first_name;
      newUserInfo.lastName = newUserInfo.last_name;
      newUserInfo.email = newUserInfo.email_id;
      newUserInfo.userType = newUserInfo.user_type;
      finalUserInfo.push(newUserInfo);
    });
    return finalUserInfo;
  }

  setRoleInfo(userInfo: StaffDataUser): StaffDataUser {
    let primaryRole;
    const roleList = [];
    userInfo.role.forEach(role => {
      roleList.push(role.role);
      if (role.is_primary) {
        primaryRole = role;
      }
    });
    userInfo.primaryRole = primaryRole ? primaryRole : userInfo.role[0];
    userInfo.roles = roleList;
    return userInfo;
  }

  setLocationInfo(userInfo: StaffDataAPI): StaffDataUser {
    let primaryLocation;
    const locationList = [];
    userInfo.base_location.forEach(location => {
      if (location.is_primary) {
        primaryLocation = location;
      } else {
        locationList.push(location.location);
      }
    });
    userInfo.primaryLocation = primaryLocation ? primaryLocation : userInfo.base_location[0];
    userInfo.additionalLocations = locationList;
    return userInfo;
  }

  getServiceLabels(workarea: WorkArea[]): string[] {
    const services = [];
    workarea.forEach(workArea => {
      services.push(workArea.area_of_work);
    })
    return services;
  }

  async updateUserStatus(req, res, next: NextFunction) {
    const id = req.params.id;
    const reqBody = req.body;
    const apiPath: string = `/refdata/case-worker/user-status/${id}`;

    try {
      const {status, data}: { status: number, data: { suspended: boolean } } = await handlePost(apiPath, reqBody, req, next);
      res.status(status).send(data);
    } catch (error) {
      next(error);
    }
  }
}