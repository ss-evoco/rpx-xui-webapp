import {NextFunction, Response} from 'express';
import {sendGet, sendPost} from '../common/crudService';
import {getConfigValue} from '../configuration';
import {SERVICES_HEARINGS_COMPONENT_API} from '../configuration/references';
import * as log4jui from '../lib/log4jui';
import {EnhancedRequest, JUILogger} from '../lib/models';
import {DEFAULT_SCREEN_FLOW} from './data/defaultScreenFlow.data';
import {hmcHearingsUrl} from './hmc.index';
import {HearingListMainModel} from './models/hearingListMain.model';
import {EXUIDisplayStatusEnum} from './models/hearings.enum';
import {hearingStatusMappings} from './models/hearingStatusMappings';
import {
  ServiceLinkedCasesModel
} from './models/linkHearings.model';
import {ServiceHearingValuesModel} from './models/serviceHearingValues.model';

const logger: JUILogger = log4jui.getLogger('hearing-service-api');
const serviceHearingsUrl: string = getConfigValue(SERVICES_HEARINGS_COMPONENT_API);

/**
 * loadServiceHearingValues - get details required to populate the hearing request/amend journey
 */
export async function loadServiceHearingValues(req: EnhancedRequest, res: Response, next: NextFunction) {
  const jurisdictionId = req.query.jurisdictionId;
  const reqBody = req.body;
  const servicePath: string = getServicePath(serviceHearingsUrl, jurisdictionId);
  const markupPath: string = `${servicePath}/serviceHearingValues`;
  try {
    const {status, data}: { status: number, data: ServiceHearingValuesModel } = await sendPost(markupPath, reqBody, req);
    let dataByDefault = data;
    // If service don't supply the screenFlow pre-set the default screen flow from ExUI
    if (!data.screenFlow) {
      dataByDefault = {
        ...data,
        screenFlow: DEFAULT_SCREEN_FLOW,
      };
    }
    res.status(status).send(dataByDefault);
  } catch (error) {
    next(error);
  }
}

/**
 * loadServiceLinkedCases - get linked cases from service
 */
export async function loadServiceLinkedCases(req: EnhancedRequest, res: Response, next: NextFunction) {
  const jurisdictionId = req.query.jurisdictionId;
  const reqBody = req.body;
  const servicePath: string = getServicePath(serviceHearingsUrl, jurisdictionId);
  const markupPath: string = `${servicePath}/serviceLinkedCases`;
  try {
    const {status, data}: { status: number, data: ServiceLinkedCasesModel[] } = await sendPost(markupPath, reqBody, req);
    res.status(status).send(data);
  } catch (error) {
    next(error);
  }
}

export async function getHearings(caseId: string, req: EnhancedRequest) {
  const markupPath: string = `${hmcHearingsUrl}/hearings/${caseId}`;
  try {
    const {data}: {data: HearingListMainModel } = await sendGet(markupPath, req);
    data.caseHearings.forEach(hearing =>
      hearingStatusMappings.filter(mapping => mapping.hmcStatus === hearing.hmcStatus).map(hearingStatusMapping => {
        hearing.exuiSectionStatus = hearingStatusMapping.exuiSectionStatus;
        hearing.exuiDisplayStatus = hearingStatusMapping.exuiDisplayStatus;
      }));
    return data;
  } catch (error) {
    logger.error(error.status, error.statusText, JSON.stringify(error.data));
    throw error;
  }
}

/**
 * loadLinkedCasesWithHearings - get linked cases from service then get hearings from case
 * step 1 - get linked case from service
 * step 2 - after step 1 asynchronously call and get hearings from get /hearings api
 * step 3 - aggregate and return the linkedCasesWithHearings
 */
export async function loadLinkedCasesWithHearings(req: EnhancedRequest, res: Response, next: NextFunction) {
  const jurisdictionId = req.query.jurisdictionId;
  const reqBody = req.body;
  const servicePath: string = getServicePath(serviceHearingsUrl, jurisdictionId);
  const markupPath: string = `${servicePath}/serviceLinkedCases`;
  try {
    const {status, data}: { status: number, data: ServiceLinkedCasesModel[] } = await sendPost(markupPath, reqBody, req);
    const currentCase: ServiceLinkedCasesModel = {
      caseReference: reqBody.caseReference,
      caseName: reqBody.caseName,
      reasonsForLink: [],
    };
    const linkedCaseIds = data.map(linkedCase => linkedCase.caseReference);
    const promises = [];
    const allCaseId = [currentCase.caseReference, ...linkedCaseIds];
    const allData = [currentCase, ...data];
    allCaseId.forEach(caseId => {
      const promise = getHearings(caseId, req);
      promises.push(promise);
    });
    // @ts-ignore
    const allResults = await Promise.allSettled(promises);
    const result = aggregateAllResults(allData, allResults);
    res.status(status).send(result);
  } catch (error) {
    next(error);
  }
}

function aggregateAllResults(data: ServiceLinkedCasesModel[], allResults: any): any {
  const aggregateResult = [];
  allResults.forEach(result => {
    const {status, value}: {status: string, value: any} = result;
    if (status === 'fulfilled') {
      const caseDetails = data.find(d => d.caseReference === value.caseRef);
      const caseHearings = value.caseHearings.filter(hearing =>
        hearing.exuiDisplayStatus === EXUIDisplayStatusEnum.AWAITING_LISTING
        || hearing.exuiDisplayStatus === EXUIDisplayStatusEnum.UPDATE_REQUESTED
        || hearing.exuiDisplayStatus === EXUIDisplayStatusEnum.LISTED);
      const caseWithHearing = {
        ...value,
        caseHearings,
        caseName: caseDetails.caseName,
        reasonsForLink: caseDetails.reasonsForLink,
      };
      aggregateResult.push(caseWithHearing);
    }
  });
  return aggregateResult;
}

function getServicePath(pathTemplate: string, jurisdictionId): string {
  return pathTemplate.replace(/jurisdiction/g, jurisdictionId.toLowerCase());
}