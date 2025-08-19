import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { TokenStorageService } from '../login/token-storage.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { debounceTime, distinctUntilChanged, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-registervehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, MaterialModule, NgxMatSelectSearchModule],
  templateUrl: './registervehicle.component.html',
  styleUrls: ['./registervehicle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})

export class RegistervehicleComponent implements OnInit {

  selectedVehicle: any;
  temp = [];
  vehicleList = [];
  projectUsers: any = [];
  isLoading: boolean = false;
  searchKey: String = '';
  showVehicle: boolean = false;
  searchVehicle = new Subject<any>();
  isNoRecord: boolean = false;
  public record: any = [];
  public action: string = "";
  public actionMode: string = "";
  public modalRef: NgbModalRef;
  setBuiltRules = ''
  orgStatusCd: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  kycStatus: any;
  // loadingIndicator: boolean = true;
  reorderable: boolean = true;
  selected = [];
  editing = {};
  isEdit: boolean = false;
  public form: FormGroup;
  isNoData: boolean = false;
  appUser: any;
  isAdmin: any;


  public expiryCtrl: FormControl = new FormControl();


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
  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;

  constructor(
    private api: ApiService,
    public fb: FormBuilder,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private tokenStorageService: TokenStorageService,
    private datePipe: DatePipe,
    private router: Router
  ) {

    this.appUser = this.tokenStorageService.getUser();
    this.getOrganization();
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit() {
    let index = this.appUser?.menus?.findIndex((menu) => menu?.routerLink == '/registervehicle');
    if (index != -1) {
      this.isAdmin = this.appUser?.menus[index].isAdmin;

      let param: any = window.history.state;
      console.log(param)

      if(param.name != null){
        this.expiryCtrl.patchValue(param.selecteDate);
  
      }

    }

    console.log('isAdmin', this.isAdmin)

    this.vehicleList = [];
    let param: any = window.history.state;
    console.log(param)
    this.vehicleExpiryCtrl.patchValue(param.name);

    this.expiryCtrl.patchValue(param.selecteDate);

    this.getVehicleTypeEnum();
    this.getVehicleExpiryList();
    this.getVehicleCount();
    // this.getOperaterVehicle();



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
        this.filterVehicleType();
        this.getVehicleCount();

      });

    this.vehicleExpiryFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterVehicleExpiry();
      });
  }

  getOrganization() {
    let params = { orgSno: this.appUser?.orgSno };
    this.api.get('8053/api/get_org', params).subscribe(result => {
      if (result != null && result.data) {
        this.orgStatusCd = result.data[0].orgStatusCd;
        this.appUser.orgStatusCd = this.orgStatusCd;
        this.tokenStorageService.saveUser(this.appUser)

      } else {
      }
    })
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
          this.getVehicleCount();
          for (let obj of val) {
            vehicleTypeList.push(obj?.codesDtlSno)
          }
          this.vehicleTypeCtrl.patchValue(vehicleTypeList);
        } else {
          this.vehicleTypeCtrl.patchValue([]);
        }
      });
  }

  getVehicleExpiryList() {
    this.vehicleExpiryList = [{ name: 'All' }, { name: 'FC Expiry' }, { name: 'Insurance Expiry' }, { name: 'Tax Expiry' }, { name: 'Permit Expiry' }, { name: 'Pollution Expiry' }];
    this.filteredExpiryTypes.next(this.vehicleExpiryList.slice());
    if (!this.vehicleExpiryCtrl.value)
      this.vehicleExpiryCtrl.patchValue('All');
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


  public openModal(i, modalContent, mode) {
    this.actionMode = mode;
    this.record = this.vehicleList;
    if (this.record && mode == 'u') {
      this.goToEditProject(i);
    }

    else if (this.record && mode == 'v') {
      this.selectedVehicle = this.vehicleList[i];
      window.scrollTo(0, 0)
      this.action = "Viewing vehicle..";
    }
    else {
      this.action = "Adding New vehicle...";
    }
    this.modalRef = this.modalService.open(modalContent, { container: '.app' });
    this.modalRef.result.then((result) => {
      this.form?.reset();
    }, (reason) => {
      this.form?.reset();
    });
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


  getOperaterVehicle() {
    let param: any = { orgSno: this.appUser.orgSno, activeFlag: true, searchKey: this.searchKey };
    param.skip = this.skip
    param.limit = this.limit

    if (this.expiryCtrl.value != null) {
      param.selecteDate = this.vehicleExpiryCtrl.value
    }

    if (this.vehicleTypeCtrl.value && this.vehicleTypeCtrl.value != '') {
      param.vehicleTypes = JSON.stringify(this.vehicleTypeCtrl.value);
    }
    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    this.vehicleList = [];
    this.isLoading = true;
    console.log(param)
    this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
      this.isLoading = false;
      if (result.data != null) {
        if (result.data) {
          this.vehicleList = result.data;
          console.log(this.vehicleList)
          for (let i in this.vehicleList) {
            if (this.vehicleList[i]?.vehicleDetails?.fcExpiryDate)
              this.checkFcExpiry(i);
            if (this.vehicleList[i]?.vehicleDetails?.taxExpiryDate)
              this.checkTaxExpiry(i);
            if (this.vehicleList[i]?.vehicleDetails?.pollutionExpiryDate)
              this.checkPollutionExpiry(i);
            if (this.vehicleList[i]?.vehicleDetails?.insuranceExpiryDate)
              this.checkInsuranceExpiry(i);
            if (this.vehicleList[i]?.vehicleDetails?.permitExpiryDate) {
              this.checkPermitExpiry(i)
            }

            // for (let j in this.vehicleList[i].passList) {
            //   if (this.vehicleList[i]?.passList[j]?.passEndDate)
            //     this.checkPassExpiry(i)
            // }

          }
        } else {
          this.vehicleList = [];
          this.isNoRecord = true;
        }
      } else {
        this.isNoRecord = true;
      }
    });
  }
  
  // checkPassExpiry(index: any) {
  //   for (let i in this.vehicleList[index]?.passList) {
  //     let currentDate: any = new Date();
  //     let dateSent: any = new Date(this.vehicleList[index]?.passList[i]?.passEndDate);
  //     let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
  //     if (count < 0) {
  //       this.vehicleList[index].tollExpiryDays = 'Expired';
  //     } else {
  //       this.vehicleList[index].tollExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
  //     }
  //   }

  // }

  goToAddNewVehicle() {
    if (this.appUser.orgSno) {
      if (this.appUser.orgStatusCd == 19) {
        let navigationExtras: any = {
          state: {
            orgSno: this.appUser.orgSno,
            showVehicle: this.vehicleList.length == 0 ? true : false
          }
        };
        this.router.navigateByUrl('/addvehicle', navigationExtras);
      } else {
        this.toastrService.info("your organization KYC is not verified");
      }
    } else {
      this.toastrService.info("Register your organization");
    }
  }

  goToEditProject(i?: any, isCopy?: string) {

    let navigationExtras: any = {
      state: {
        vehicle: this.vehicleList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/editvehicle'], navigationExtras);
  }

  updateValue(event, cell, cellValue, row) {
    this.editing[row.$$index + '-' + cell] = false;
    this.vehicleList[row.$$index][cell] = event.target.value;
  }
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    console.log('Activate Event', event);
  }
  deleteVehicle(i: any) {
    let confirmText = "Are you sure to Delete ? ";
    this.confirmDialogService.confirmThis(confirmText, () => {
      let param: any = { vehicleSno: this.vehicleList[i]?.vehicleSno, activeFlag: false };
      this.api.put('8053/api/update_active_status', param).subscribe((result: any) => {
        if (result != null && result.data) {
          this.vehicleList.splice(i, 1);
        }
      })
      if (this.vehicleList.length == 0) {
        this.isNoData = true;
      }
      this.toastrService.success("Vehicle Deleted Successfully");
    }, () => {
    });
  }
  public closeModal() {
    this.ngOnInit();
    this.modalRef.close();
  }


  checkFcExpiry(index: any) {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicleList[index]?.vehicleDetails?.fcExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));

    if (count < 0) {
      this.vehicleList[index].fcExpiryDays = 'Expired';
    } else {
      this.vehicleList[index].fcExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
    }

  }
  checkTaxExpiry(index: any) {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicleList[index]?.vehicleDetails?.taxExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count < 0) {
      this.vehicleList[index].taxExpirydays = 'Expired';
    } else {
      this.vehicleList[index].taxExpirydays = count + (count <= 1 ? ' Day' : ' Days');
    }
  }
  checkPollutionExpiry(index: any) {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicleList[index]?.vehicleDetails?.pollutionExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count < 0) {
      this.vehicleList[index].pollutionExpiryDays = 'Expired';
    } else {
      this.vehicleList[index].pollutionExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
    }
  }
  checkInsuranceExpiry(index: any) {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicleList[index]?.vehicleDetails?.insuranceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count < 0) {
      this.vehicleList[index].insuranceExpiryDays = 'Expired';
    } else {
      this.vehicleList[index].insuranceExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
    }
  }
  checkPermitExpiry(index: any) {
    let currentDate: any = new Date();
    let dateSent: any = new Date(this.vehicleList[index]?.vehicleDetails?.permitExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count < 0) {
      this.vehicleList[index].permitExpiryDays = 'Expired';
    } else {
      this.vehicleList[index].permitExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
    }
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
      orgSno: this.appUser.orgSno,
      activeFlag: true,
      searchKey: this.searchKey
    };
    if (this.expiryCtrl.value != null) {
      param.selecteDate = this.vehicleExpiryCtrl.value
    }

    if (this.vehicleTypeCtrl.value && this.vehicleTypeCtrl.value != '') {
      param.vehicleTypes = JSON.stringify(this.vehicleTypeCtrl.value);
    }
    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    this.vehicleList = [];
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
