import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../login/token-storage.service';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, PipesModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  appUser: any;
  notificationList: any = [];


  constructor(
    private router: Router,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,

  ) {

    this.appUser = this.tokenStorageService.getUser();
    console.log(this.appUser)
  }

  ngOnInit(): void {
    this.getNotification()
  }

  getNotification() {
    let param = { appUserSno: this.appUser.appUserSno, activeFlag: true }
    console.log(param)
    this.api.get('8056/api/get_notification', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.notificationList = result.data
        console.log(this.notificationList)
      }
    });
  }

  readNotification(i: number) {
    let body: any = {};
    // body.orgSno=this.appUser.orgSno;
    body.notificationSno = this.notificationList[i]?.notificationSno;
    this.api.put('8056/api/update_notification', body).subscribe((result:any) => {
      console.log(result)
      if (result != null && result?.data) {
       this.notificationList[i].notificationStatusCd = result?.data?.notificationStatusCd;
      }
      // this.router.navigate([this.notificationList[i].routerLink]);
    });
  }

}
