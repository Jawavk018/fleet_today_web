import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { ReplaySubject, Subject, debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, MaterialModule, NgxMatSelectSearchModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnInit {

  vehicleList: any = [];
  selectedVehicle: any;
  reason: any;
  user: any;
  isShow: boolean = false;
  searchKey: String = '';
  searchVehicle = new Subject<any>();


  public statusCtrl: FormControl = new FormControl();
  public statusList: any = [];
  public vehicleStatusFilterCtrl: FormControl = new FormControl();
  public filteredStatusTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  public vehicleTypeList: any = [];
  public vehicleTypeCtrl: FormControl = new FormControl();
  public vehicleTypeFilterCtrl: FormControl = new FormControl();
  public filteredVehicleTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public vehicleExpiryList: any = [];
  public vehicleExpiryCtrl: FormControl = new FormControl();
  public vehicleExpiryFilterCtrl: FormControl = new FormControl();
  public filteredExpiryTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  protected _onDestroy = new Subject<void>();
  isIndeterminate = false;
  isChecked = false;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  isNoRecord: boolean = true;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;

  constructor(private api: ApiService, private router: Router, private datePipe: DatePipe,
    private tokenStorage: TokenStorageService) {
    this.limit = this.itemPerPage.toString().split(',')[0];
    // @Pipe({
    //   name: 'join'
    // })
    // export class JoinPipe implements PipeTransform {
    //   transform(input:Array<any>, sep = ','): string {
    //     return input.join(sep);
    //   }
    // }
  }

  ngOnInit() {
    this.vehicleList = [];

  

    // this.getOperaterVehicle();
    this.user = this.tokenStorage.getUser();

    let param: any = window.history.state;
    this.vehicleExpiryCtrl.patchValue(param.name);

    this.statusCtrl.patchValue(param.status)

    this.getVehicleTypeEnum();
    this.getVehicleExpiryList();
    this.getStatusList();
    this.getVehicleCount();

    this.searchVehicle
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value: any) => {
        this.vehicleList = [];
        this.getVehicleCount();
        this.getOperaterVehicle();
      });

    this.vehicleTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.getVehicleCount();
        this.filterVehicleType();
      });

    this.vehicleExpiryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.getVehicleCount();
        this.filterVehicleExpiry();
      });

      this.vehicleStatusFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.getVehicleCount();
        this.filterStatusExpiry();
      });  
  }

  getOperaterVehicle() {
    let param: any = { searchKey: this.searchKey }
    param.skip = this.skip
    param.limit = this.limit
    if (this.vehicleTypeCtrl.value && this.vehicleTypeCtrl.value != '') {
      param.vehicleTypes = JSON.stringify(this.vehicleTypeCtrl.value);
    }
    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    if (this.statusCtrl.value && this.statusCtrl.value != '') {
      param.status = this.statusCtrl.value;
    }
    console.log(param)
    this.vehicleList = [];
    this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
      console.log(result.data)
      if (result != null && result.data) {
        this.vehicleList = result.data;
        for (let i in this.vehicleList) {
          this.vehicleList[i].isShow = false;
          // if(this.vehicleList[i]?.vehicleDetails?.fcExpiryDate)
          // this.checkFcExpiry(i);
        }
      }
    });
  }

  openModal(index: any) {
    this.selectedVehicle = this.vehicleList[index];
    console.log(JSON.stringify(this.selectedVehicle))
  }


  getVehicleTypeEnum() {
    this.vehicleTypeList = [];

    let params: any = { codeType: 'vehicle_type_cd' };

    this.api.get('8052/api/get_enum_names', params).subscribe(result => {
      if (result != null && result.data) {
        this.vehicleTypeList = result.data;
        this.filteredVehicleTypes.next(this.vehicleTypeList.slice());
      }
    });
  }

  getVehicleExpiryList() {
    this.vehicleExpiryList = [{ name: 'All' }, { name: 'FC Expiry' }, { name: 'Insurance Expiry' }, { name: 'Tax Expiry' }, { name: 'Permit Expiry' }, { name: 'Pollution Expiry' }];
    this.filteredExpiryTypes.next(this.vehicleExpiryList.slice());
    if (!this.vehicleExpiryCtrl.value)
      this.vehicleExpiryCtrl.patchValue('All');
  }

  getStatusList(){
    this.statusList = [{status : 'All'}, {status : 'Active Vehicle'}, {status : 'Inactive Vehicle'}];
    this.filteredStatusTypes.next(this.statusList.slice());
    if (!this.statusCtrl.value)
      this.statusCtrl.patchValue('All');
  }

  protected filterVehicleType() {
    if (!this.vehicleTypeList) {
      return;
    }
    let search = this.vehicleTypeFilterCtrl.value;
    if (!search) {
      this.filteredVehicleTypes.next(this.vehicleTypeList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredVehicleTypes.next(
      this.vehicleTypeList.filter((obj) => obj.cdValue?.toLowerCase().indexOf(search) > -1)
    );
  }

  toggleVehicleTypeSelectAll(selectAllValue: boolean) {
    this.filteredVehicleTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let vehicleTypeList = [];
          for (let obj of val) {
            vehicleTypeList.push(obj?.codesDtlSno)
          }
          this.vehicleTypeCtrl.patchValue(vehicleTypeList);
        } else {
          this.vehicleTypeCtrl.patchValue([]);
        }
      });
  }




  protected filterVehicleExpiry() {
    if (!this.vehicleExpiryList) {
      return;
    }
    let search = this.vehicleExpiryFilterCtrl.value;
    if (!search) {
      this.filteredExpiryTypes.next(this.vehicleExpiryList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredExpiryTypes.next(
      this.vehicleExpiryList.filter((obj) => obj.name?.toLowerCase().indexOf(search) > -1)
    );
  }


  protected filterStatusExpiry() {
    if (!this.statusList) {
      return;
    }
    let search = this.vehicleStatusFilterCtrl.value;
    if (!search) {
      this.filteredStatusTypes.next(this.statusList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredStatusTypes.next(
      this.statusList.filter((obj) => obj.status?.toLowerCase().indexOf(search) > -1)
    );
  }



  toggleVehicleExpirySelectAll(selectAllValue: boolean) {
    this.filteredExpiryTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let expiryList = [];
          for (let obj of val) {
            expiryList.push(obj?.name)
          }
          this.vehicleExpiryCtrl.patchValue(expiryList);
        } else {
          this.vehicleExpiryCtrl.patchValue([]);
        }
        // console.log(this.selectedClient)
      });
  }


  toggleVehicleStatusSelectAll(selectAllValue: boolean) {
    this.filteredStatusTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let vehicleStatusList = [];
          for (let obj of val) {
            vehicleStatusList.push(obj?.status)
          }
          this.statusCtrl.patchValue(vehicleStatusList);
        } else {
          this.statusCtrl.patchValue([]);
        }
        // console.log(this.selectedClient)
      });
  }


  goToEditProject(i?: any, isCopy?: string) {

    let navigationExtras: any = {
      state: {
        vehicle: this.vehicleList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/addvehicle'], navigationExtras);
  }


  changeStatus(type: any) {
    let body: any = { vehicleSno: this.selectedVehicle.vehicleSno, kycStatus: type == 'Approve' ? 19 : 58, type: type };
    body.orgSno = this.selectedVehicle.orgSno;
    // body.createdOn = this.api.networkData.timezone;
    body.createdOn = 'Asia/Kolkata';
    body.appUserSno = this.user.appUserSno;
    if (type == 'Reject') {
      body.rejectReason = this.reason
    }
    this.api.post('8053/api/accept_reject_vehicle_kyc', body).subscribe(result => {
      if (result != null) {
        this.getOperaterVehicle();
        this.reason = null;
      }

    })
  }

  goToAddNewVehicle() {
    let navigationExtras: any = {
      state: {
        roleCd: this.user.roleCd,
      }
    };
    this.router.navigate(['/addvehicle'], navigationExtras);
  }

  gotoviewVehicle(i?: any, isCopy?: string) {
    let navigationExtras: any = {
      state: {
        vehicle: this.vehicleList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/viewvehicle'], navigationExtras);

  }

  getMoreVehicle(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getOperaterVehicle();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getOperaterVehicle();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.vehicleList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.vehicleList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getOperaterVehicle();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  getVehicleCount() {
    let param: any = {
      // orgSno: this.user.orgSno
      searchKey: this.searchKey
    };
    if (this.statusCtrl.value && this.statusCtrl.value != '') {
      param.status = this.statusCtrl.value;
    }
    if (this.vehicleTypeCtrl.value && this.vehicleTypeCtrl.value != '') {
      param.vehicleTypes = JSON.stringify(this.vehicleTypeCtrl.value);
    }
    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    this.vehicleList =[];
    console.log(param)
    this.isNoRecord = false;
    this.api.get("8053/api/get_all_vehicle_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
            console.log(this.count)
            this.getOperaterVehicle();
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
