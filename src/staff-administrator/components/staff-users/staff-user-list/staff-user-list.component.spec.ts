import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StaffDataAccessService } from '../../../services/staff-data-access/staff-data-access.service';
import { StaffStatusComponent } from '../../staff-status/staff-status.component';
import { StaffDataFilterService } from '../services/staff-data-filter/staff-data-filter.service';
import { StaffUserListComponent } from './staff-user-list.component';

describe('StaffUserListComponent', () => {
  let component: StaffUserListComponent;
  let fixture: ComponentFixture<StaffUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffUserListComponent, StaffStatusComponent ],
      imports: [
        HttpClientTestingModule,
        CdkTableModule,
        RouterTestingModule
      ],
      providers: [
        StaffDataFilterService,
        StaffDataAccessService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});