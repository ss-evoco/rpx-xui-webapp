import {APP_BASE_HREF} from '@angular/common';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {inject, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {initialState} from '../hearing.test.data';
import {JudicialUserModel} from '../models/judicialUser.model';
import {JudicialRefDataService} from '../services/judicial-ref-data.service';
import {PanelMemberSearchResponseResolver} from './panel-member-search-response-resolver';

describe('Panel Member Search Response Resolver', () => {
  let judicialRefDataService: JudicialRefDataService;
  const dataRef: JudicialUserModel[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([]),
          HttpClientTestingModule,
        ],
        providers: [
          provideMockStore({initialState}),
          PanelMemberSearchResponseResolver,
          JudicialRefDataService,
          {provide: APP_BASE_HREF, useValue: '/'}
        ]
      }
    );
    judicialRefDataService = TestBed.get(JudicialRefDataService) as JudicialRefDataService;
  });

  it('should be created', () => {
    const service: PanelMemberSearchResponseResolver = TestBed.get(PanelMemberSearchResponseResolver);
    expect(service).toBeTruthy();
  });

  it('resolves reference data', inject([PanelMemberSearchResponseResolver], (service: PanelMemberSearchResponseResolver) => {
    spyOn(judicialRefDataService, 'searchJudicialUserByPersonalCodes').and.returnValue(of(dataRef));
    spyOn(service, 'getUsersByPanelRequirements$').and.callThrough();
    spyOn(service, 'getUsersData$').and.callThrough();
    service.resolve().subscribe((refData: JudicialUserModel[]) => {
      expect(service.getUsersByPanelRequirements$).toHaveBeenCalled();
      expect(service.getUsersData$).toHaveBeenCalled();
      expect(refData).toEqual([]);
      service.getUsersData$([]);
      expect(judicialRefDataService.searchJudicialUserByPersonalCodes).toHaveBeenCalled();
    });
  }));
});