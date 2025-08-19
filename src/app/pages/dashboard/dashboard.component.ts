import { HttpHeaders } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';
import { TokenStorageService } from 'src/app/bus-admin/login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent  {
  userInfo:any;
  constructor(){

  }

  ngOnInit(): void {
    
}


}
