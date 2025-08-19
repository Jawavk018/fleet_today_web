import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../../login/token-storage.service';

@Component({
  selector: 'app-view-driver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-driver.component.html',
  styleUrls: ['./view-driver.component.scss']
})
export class ViewDriverComponent implements OnInit {
 
  appUser: any;
  driver: any;
  mileageList:any = [];
  driverList:any = [];

  constructor(
    public location:Location,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService) { 
      let param: any = window.history.state;
      console.log(param);
      this.driver = param.driver;
      this.appUser = this.tokenStorageService.getUser();
    }

  ngOnInit(): void {
    this.getDriverDtl();
  }

  closeView(){
    this.location.back();
  }

  getDriverDtl() {
    let params = { driverSno: this.driver.driverSno };
    this.api.get('8055/api/get_driver_dtl', params).subscribe(result => {
      if (result != null && result.data) {
        this.driverList = result.data
        console.log(this.driverList)
      }
    })
  }

  checkLicenseExpiry(driver){
    let currentDate: any = new Date();
    let dateSent: any = new Date(driver.licenceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }
  checkTransportlicenceExpiry(driver){
    let currentDate: any = new Date();
    let dateSent: any = new Date(driver.transportlicenceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }
}
