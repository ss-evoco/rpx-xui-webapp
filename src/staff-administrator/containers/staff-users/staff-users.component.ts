import { Component } from '@angular/core';
import { StaffDataFilterService } from '../../components/staff-users/services/staff-data-filter/staff-data-filter.service';

@Component({
  selector: 'exui-staff-users',
  templateUrl: './staff-users.component.html',
  styleUrls: ['./staff-users.component.scss']
})
export class StaffUsersComponent {
  public advancedSearchEnabled = false;
  constructor(public staffDataFilterService: StaffDataFilterService) { }
}