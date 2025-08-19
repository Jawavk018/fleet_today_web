import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { User } from 'src/app/pages/membership/membership.model';
import { map, Observable, startWith } from 'rxjs';
import * as bootstrap from 'bootstrap'; // Import Bootstrap JavaScript module
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { MatPaginator } from '@angular/material/paginator';
declare var $: any;

@Component({
  selector: 'app-assign-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AutocompleteLibModule, ConfirmDialogModule],
  templateUrl: './assign-driver.component.html',
  styleUrls: ['./assign-driver.component.scss']
})
export class AssignDriverComponent implements OnInit {
  @ViewChild('auto') auto;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  orgvehicles: any = [];
  driverList: any = [];
  user: any;
  isLoad: boolean = false;
  isAdmin: boolean;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  isNoRecord: boolean = true;
  totalCount: number;
  isFirstTime: boolean = true;
  searchForm: any = FormGroup;
  driverVehicleForm: any = FormGroup;
  vehecleDriverList: any = [];
  keyword = 'vehicleRegNumber';
  driverkeyword = 'driverName';
  constructor(private api: ApiService,
    private tokenStorageService: TokenStorageService,
    private toastrService: ToastrService, private confirmDialogService: ConfirmDialogService) {
    this.user = this.tokenStorageService.getUser();
    this.searchForm = new FormGroup({
      vehicleSno: new FormControl(null),
      driverSno: new FormControl(null),
    });
    this.driverVehicleForm = new FormGroup({
      vehicleSno: new FormControl(null, Validators.required),
      driverSno: new FormControl(null, Validators.required),
    })

    this.limit = this.itemPerPage.toString().split(',')[0];
  }



  ngOnInit(): void {
    this.getOrgVehicle();
    this.getVehicleDriver();
    this.getAssignDriverCount();

    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/assign-driver');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }

  }



  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_vehicles_and_drivers", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.driverList = result?.data[0]?.driverList
        this.orgvehicles = result?.data[0]?.busList;
        console.log(this.orgvehicles)
      } else {
      }
    });
  }



  clearDriverVehicleForm() {
    this.driverVehicleForm.reset();
    // this.driverVehicleForm.vehicleSno = '';
    // this.driverVehicleForm.driverSno = '';
  }

  selectVehicleEvent(item) {
    this.searchForm.patchValue({
      vehicleSno: item.vehicleSno
    })
    // do something with selected item
    console.log(this.searchForm.value)
  }

  selectDriverEvent(item) {
    this.searchForm.patchValue({
      driverSno: item.driverSno
    })
    // do something with selected item
    console.log(this.searchForm.value)
  }

  clearVehicle() {
    this.driverVehicleForm.patchValue({
      vehicleSno: null
    })
  }
  clearDriver() {
    this.driverVehicleForm.patchValue({
      driverSno: null
    })
  }

  removeVehicle() {
    this.searchForm.patchValue({
      vehicleSno: null
    })
  }
  removeDriver() {
    this.searchForm.patchValue({
      driverSno: null
    })
  }

  // onChangeSearch(val: string) {
  //   // fetch remote data from here
  //   // And reassign the 'data' which is binded to 'data' property.
  // }


  // onFocused(e){
  //   // do something when input is focused
  // }
  assigntVehicleEvent(item) {
    this.driverVehicleForm.patchValue({
      vehicleSno: item.vehicleSno
    })
    // do something with selected item
    console.log(this.driverVehicleForm.value)
  }

  assignDriverEvent(item) {
    this.driverVehicleForm.patchValue({
      driverSno: item.driverSno
    })
    // do something with selected item
    console.log(this.driverVehicleForm.value)
    console.log(this.driverVehicleForm.valid)
  }

  save() {
    let body: any = Object.assign(this.driverVehicleForm.value, {});
    console.log(body)
    this.isLoad = true;
    // body.createdOn = this.api.networkData?.timezone;
    body.createdOn = 'Asia/Kolkata';
    this.api.post('8053/api/insert_vehicle_driver', body).subscribe(result => {
      this.isLoad = false;
      console.log(result)
      if (result != null && result.data != null) {
        if (result.data.msg) {
          this.toastrService.error(result?.data?.msg);
        } else {
          this.auto.clear();
          this.toastrService.success('Driver Assigned successfully');
          $("#assignDriverModal").modal("hide");
          this.getVehicleDriver();
        }
      } else {

      }
    });
  }


  getVehicleDriver() {
    this.getAssignDriverCount();
    let params: any = { orgSno: this.user.orgSno };
    params.skip = this.skip
    params.limit = this.limit
    if (this.searchForm.value.vehicleSno != null) {
      params.vehicleSno = this.searchForm.value.vehicleSno;
    }
    if (this.searchForm.value.driverSno != null) {
      params.driverSno = this.searchForm.value.driverSno;
    }
    console.log(params)
    this.api.get("8053/api/get_vehicle_driver", params).subscribe(result => {
      console.log(result)
      this.vehecleDriverList = result.data;
    });
  }

  deleteVehicle(i: any) {
    let confirmText = "Are you sure to Delete ? ";
    this.confirmDialogService.confirmThis(confirmText, () => {
      let body: any = { vehicleDriverSno: this.vehecleDriverList[i]?.vehicleDriverSno };
      this.api.post('8053/api/insert_vehicle_driver', body).subscribe(result => {
        console.log(result);
        if (result != null && result.data) {
          this.vehecleDriverList.splice(i, 1);
        }
      })
      this.toastrService.success(" Deleted Successfully");
    }, () => {
    });
  }

  getMoreAssignDriver(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      // this.goToSearch();
      this.getVehicleDriver();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      // this.goToSearch();
      this.getVehicleDriver();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      // this.busReportList = [];
      this.vehecleDriverList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      // this.busReportList = [];
      this.vehecleDriverList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      // this.goToSearch();
      this.getVehicleDriver();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  getAssignDriverCount() {
    let params: any = { orgSno: this.user.orgSno };
    if (this.searchForm.value.vehicleSno != null) {
      params.vehicleSno = this.searchForm.value.vehicleSno;
    }
    if (this.searchForm.value.driverSno != null) {
      params.driverSno = this.searchForm.value.driverSno;
    }
    this.isNoRecord = false;
    this.api.get("8053/api/get_assign_driver_count", params).subscribe(
      (result) => {
        console.log(result);
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
              if (this.isFirstTime) {
                this.totalCount = this.count;
                this.isFirstTime = false
              }
            }
          } else {
            this.isNoRecord = true;
          }
        } else {
          // this.toastService.showError("Something went wrong");
        }
      },
      (err) => {
        // this.isShowLoad =false;
        // this.isNoRecord = true;
        // this.toastService.showError(err)
      }
    );
  }

}
