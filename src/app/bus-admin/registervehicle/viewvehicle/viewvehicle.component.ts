import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate, Location } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../../login/token-storage.service';
import { QrCodeModule } from 'ng-qrcode';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewvehicle',
  standalone: true,
  imports: [CommonModule, QrCodeModule,FormsModule,ReactiveFormsModule],
  templateUrl: './viewvehicle.component.html',
  styleUrls: ['./viewvehicle.component.scss']
})
export class ViewvehicleComponent implements OnInit {

  appUser: any;
  vehicle: any;
  mileageList:any = [];
  vehicleList = [];
  reason:any;
  selectedImageIndex: number = 0;
  isVehicle:boolean=false;
  isPrimaryDtl:boolean=false;
  isvehicleDtl:boolean=false;

  constructor(
    public location:Location,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
  ) {
    let param: any = window.history.state;
    this.vehicle = param.vehicle;
    console.log(this.vehicle);
    this.appUser = this.tokenStorageService.getUser();
  }

  ngOnInit(): void {
    console.log(this.vehicle);
    this.getVehicleMileageDtl()
  }

  closeView(){
    this.location.back();
  }

  getVehicleMileageDtl() {
    let params = { vehicleSno: this.vehicle.vehicleSno };
    this.api.get('8053/api/get_mileage_dtl', params).subscribe(result => {
      if (result != null && result.data) {
        this.mileageList = result.data
        console.log(this.mileageList)
      }
    })
  }
  
  checkFcExpiry() {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicle?.vehicleDetails?.fcExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }

  checkTaxExpiry() {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicle?.vehicleDetails?.taxExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }

  checkPollutionExpiry(){
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicle?.vehicleDetails?.pollutionExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }

  checkInsuranceExpiry(){
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicle?.vehicleDetails?.insuranceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }
  
  checkPermitExpiry(){
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicle?.vehicleDetails?.permitExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }

  changeStatus(type: any) {
    let body: any = { vehicleSno: this.vehicle.vehicleSno, kycStatus: type == 'Approve' ? 19 : 20, rejectReason: null };
    body.orgSno=this.vehicle.orgSno;
    // body.createdOn=this.api.networkData.timezone;
    body.createdOn = 'Asia/Kolkata';
    body.appUserSno=this.appUser.appUserSno;
    if (type == 'Reject') {
      body.rejectReason = this.reason
    }
    this.api.post('8053/api/accept_reject_vehicle_kyc', body).subscribe(result => {
      if (result != null) {
        this.vehicle.kycStatus = (type == 'Approve')? 'KYC Verified':'KYC Not Verified';
        this.reason = null;
      }

    })
  }
  vehicleDtlEvent(){
    this.isVehicle=!this.isVehicle;
  }
  isPrimaryDtlEvent(){
    this.isPrimaryDtl=!this.isPrimaryDtl;
  }
  isvehicleDtlEvent(){
    this.isvehicleDtl=!this.isvehicleDtl;
  }
}
