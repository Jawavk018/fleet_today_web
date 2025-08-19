import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {


  orgList: any = [];
  vehicleList: any = [];
  driverList: any = [];
  selectedOperators: any;
  reason: any;
  authUser: any;
  selectedVehicle: any;
  selectedDriver: any;

  constructor(
    public api: ApiService,
    private router: Router,
    private tokenService: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.authUser = this.tokenService.getUser();
    this.getApproval();
  }

  getApproval() {
    let param: any = {}
    this.api.get('8053/api/get_approval', param).subscribe(result => {
      // console.log(result.data)
      if (result != null && result?.data?.length) {
        this.orgList = result?.data[0]?.orgList;
        this.vehicleList = result?.data[0]?.vehicleList;
        this.driverList = result?.data[0]?.driverList;
      }
      console.log(this.orgList);
      console.log(this.vehicleList);
      console.log(this.driverList);
    });
  }

  viewOperatorPage(i: number) {
    let navigationExtras: any = {
      state: {
        data: { orgSno: this.orgList[i].orgSno },
      }
    };
    this.router.navigate(['/operator'], navigationExtras);
  }

  goToEdit(i: number) {
    let navigationExtras: any = {
      state: {
        operator: this.orgList[i],
        isCopy: false
      }
    };
    this.router.navigate(['/addoperator'], navigationExtras);
  }

  openModal(index: any) {
    this.reason = null;
    this.selectedOperators = this.orgList[index];
  }

  changeStatus(type: any) {
    let body: any = { orgSno: this.selectedOperators.orgSno, orgStatusCd: type == 'Approve' ? 19 : 58, type: type };
    body.appUserSno = this.authUser.appUserSno;
    // body.createdOn = this.api.networkData.timezone;
    body.createdOn = 'Asia/Kolkata';
    if (type == 'Reject') {
      body.reason = this.reason
    }
    this.api.post('8053/api/accept_reject_operator_kyc', body).subscribe(result => {
      if (result != null) {
        let index: number = this.orgList.indexOf(this.selectedOperators);
        if (index != -1) {
          this.orgList[index].orgStatusCd = body.orgStatusCd;
          if (body?.orgStatusCd == 58) {
            this.orgList[index].reason = this.reason;
          } else {
            this.orgList.splice(index, 1);
          }
        }
      }

    })
  }

  openVehicleModal(i: number) {
    this.reason = null;
    this.selectedVehicle = this.vehicleList[i];
  }

  openDriverModal(i: number) {
    this.reason = null;
    this.selectedDriver = this.driverList[i];
  }

  goToEditVehicle(i: number) {
    if (!this.vehicleList[i]?.vehicleInfo) {
      this.getVehicle(i, 'edit')
    } else {
      let navigationExtras: any = {
        state: {
          vehicle: this.vehicleList[i]?.vehicleInfo,
          isCopy: false
        }
      };
      this.router.navigate(['/addvehicle'], navigationExtras);
    }
  }

  changeStatusVehicle(type: any) {
    let body: any = { vehicleSno: this.selectedVehicle.vehicleSno, kycStatus: type == 'Approve' ? 19 : 58, type: type };
    body.orgSno = this.selectedVehicle.orgSno;
    body.createdOn = this.api.zone_name
    body.appUserSno = this.authUser.appUserSno;
    if (type == 'Reject') {
      body.rejectReason = this.reason
    }
    this.api.post('8053/api/accept_reject_vehicle_kyc', body).subscribe(result => {
      let i: number = this.vehicleList.findIndex((vehicle: any) => vehicle?.vehicleSno == this.selectedVehicle.vehicleSno);
      console.log(i);
      if (result != null) {
        this.vehicleList[i].kycStatus = body.kycStatus;
        if (body.kycStatus == 19) {
          if (i != -1) {
            this.vehicleList.splice(i, 1);
          }
        } else {
          this.vehicleList[i].reason = body.rejectReason;
        }
      }
    })
  }

  changeStatusDriver(type: any) {
    let body: any = { driverSno: this.selectedDriver.driverSno, kycStatus: type == 'Approve' ? 19 : 58, type: type };
    body.createdOn = this.api.zone_name;
    if (type == 'Reject') {
      body.rejectReason = this.reason
    }
    console.log('BODY', body)
    this.api.post('8053/api/accept_reject_driver_kyc', body).subscribe(result => {
      let i: number = this.driverList.findIndex((driver: any) => driver?.driverSno == this.selectedDriver.driverSno);
      if (result != null) {
        this.driverList[i].kycStatus = body.kycStatus;
        if (body.kycStatus == 19) {
          if (i != -1) {
            this.driverList.splice(i, 1);
          }
        } else {
          this.driverList[i].reason = body.rejectReason;
        }
      }
    })
  }

  gotoviewVehicle(i: any) {
    if (!this.vehicleList[i]?.vehicleInfo) {
      this.getVehicle(i, 'view')
    } else {
      if(!this.vehicleList[i].vehicleInfo?.isFalse){
      let navigationExtras: any = {
        state: {
          vehicle: this.vehicleList[i].vehicleInfo,
          isCopy: false
        }
      };
      this.router.navigate(['/viewvehicle'], navigationExtras);
    }
    }
  }

  getVehicle(i: number, type) {
    let param: any = {};
    param.vehicleSno = this.vehicleList[i]?.vehicleSno;
    param.activeFlag = true;
    this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
      console.log(result.data)
      if (result != null && result?.data?.length) {
        this.vehicleList[i].vehicleInfo = result.data[0];
      } else {
        this.vehicleList[i].vehicleInfo = {
          isFalse: false
        }
      }
      if (type == 'view') {
        this.gotoviewVehicle(i);
      } else {
        this.goToEditVehicle(i);
      }
    });
  }

  gotoViewDriver(i: any) {
    if (!this.driverList[i]?.driverInfo) {
      this.getDriver(i, 'view')
    } else {
      console.log(this.driverList[i]);
      let navigationExtras: any = {
        state: {
          driver: this.driverList[i]?.driverInfo,
          isCopy: false
        }
      };
      this.router.navigate(['/view-driver'], navigationExtras);
    }
  }

  getDriver(i, type) {
    let params: any = {};
    params.driverSno = this.driverList[i]?.driverSno
    this.api.get('8055/api/get_driver_dtl', params).subscribe(result => {
      if (result != null && result.data) {
        this.driverList[i].driverInfo = result.data[0];
      }
      if (type == 'view') {
        this.gotoViewDriver(i);
      } else {
        // this.goToEditVehicle(i);
      }
    })
  }
}
