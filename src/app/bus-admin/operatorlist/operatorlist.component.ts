import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../theme/components/menu/menu.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/providers/api/api.service';
import { OperatorListService } from './operatorlist.service';
import { ToastrService } from 'ngx-toastr';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { TokenStorageService } from '../login/token-storage.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-operatorlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, MaterialModule, NgxPaginationModule, NgxMatSelectSearchModule],
  templateUrl: './operatorlist.component.html',
  styleUrls: ['./operatorlist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [OperatorListService, MenuService]
})

export class OperatorlistComponent implements OnInit {

  temp = [];
  myVaultList = [];
  sharedVaultList = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;

  appUser: any;

  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  selected = [];
  editing = {};
  isNoData: boolean = false;
  authUser: any;
  isSelectAll: boolean = false;
  public p: any;

  searchKey: any = '';
  userList: any = [];
  selectedVaultSno: any;
  isNoOperators: boolean = false;
  isNoSharedVaultList: boolean = false;
  public operatorDistrictCtrl: FormControl = new FormControl();
  public operatorCityCtrl: FormControl = new FormControl();

  public operatorDistrictFilterCtrl: FormControl = new FormControl();
  public operatorCityFilterCtrl: FormControl = new FormControl();


  public filteredDistrict: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public filteredCity: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);



  protected _onDestroy = new Subject<void>();


  public messages: Array<Object>;
  public files: Array<Object>;
  public meetings: Array<Object>;
  public sharedVaultUsers = [];
  searchVehicle = new Subject<any>();


  public selectedSharedVaultIndex: any;

  public selectFilter: any = 'all';
  public folders: any = [];
  public selectFolder: any = '0';


  operatorList: any = [];
  reason: any;
  selectedOperators: any;

  isIndeterminate = false;
  isChecked = false;

  public districtList: any = [];
  public cityList: any = [];

  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  isNoRecord: boolean = true;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;

  constructor(
    private router: Router,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenService: TokenStorageService,
    private tokenStorageService: TokenStorageService,

  ) {
    this.authUser = this.tokenService.getUser();
    this.appUser = this.tokenStorageService.getUser();
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  goToAddNewOperator() {
    let navigationExtras: any = {
      state: {
        roleCd: this.authUser.roleCd,
      }
    };
    this.router.navigate(['/addoperator'], navigationExtras);
  }

  goToEdit(i?: any, isCopy?: string) {

    let navigationExtras: any = {
      state: {
        operator: this.operatorList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/addoperator'], navigationExtras);
  }


  open(index) {
    if (index != null)
      this.selectedVaultSno = this.myVaultList[index].vaultSno
    $(document).ready(() => {
      $('#myModal').modal('show');
    });
  }

  ngOnInit() {
    this.operatorList = [];
    this.getOrgCount()
    // this.getOrganization();
    this.getDistrict();
    this.getCity();

    this.searchVehicle
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value: any) => {
        this.operatorList = [];
        this.getOrganization();
      });

    this.operatorDistrictFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDistrict();
      });
    this.operatorCityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCity();
      });
  }


  protected filterDistrict() {
    if (!this.districtList) {
      return;
    }
    let search = this.operatorDistrictFilterCtrl.value;
    if (!search) {
      this.filteredDistrict.next(this.districtList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredDistrict.next(
      this.districtList.filter((obj) => obj?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterCity() {
    if (!this.cityList) {
      return;
    }
    let search = this.operatorCityFilterCtrl.value;
    if (!search) {
      this.filteredCity.next(this.cityList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredCity.next(
      this.cityList.filter((obj) => obj?.toLowerCase().indexOf(search) > -1)
    );
  }


  viewOperatorPage(index: any) {
    let navigationExtras: any = {
      state: {
        data: { orgSno: this.operatorList[index].orgSno },
      }
    };
    this.router.navigate(['/operator'], navigationExtras);
  }



  getDistrict() {
    this.districtList = [];
    let params: any = {};
    this.api.get("8053/api/get_address_district", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.districtList = result.data;
        this.filteredDistrict.next(this.districtList.slice());
        console.log(this.districtList);
      } else {
      }
    });
  }

  getCity() {
    this.cityList = [];
    let params: any = {};
    this.api.get("8053/api/get_address_city", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.cityList = result.data;
        this.filteredCity.next(this.cityList.slice());
        console.log(this.cityList);
      } else {
      }
    });
  }


  toggleDistrictSelectAll(selectAllValue: boolean) {
    this.filteredDistrict
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let districtList = [];
          for (let obj of val) {
            districtList.push(obj);
          }
          this.operatorDistrictCtrl.patchValue(districtList);
        } else {
          this.operatorDistrictCtrl.patchValue([]);
        }
      });
  }

  toggleCitySelectAll(selectAllValue: boolean) {
    this.filteredCity
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let cityList = [];
          for (let obj of val) {
            cityList.push(obj);
          }
          this.operatorCityCtrl.patchValue(cityList);
        } else {
          this.operatorCityCtrl.patchValue([]);
        }
      });
  }

  getOrganization() {
    let params: any = { activeFlag: true, searchKey: this.searchKey };
    params.skip = this.skip
    params.limit = this.limit
    if (this.operatorDistrictCtrl.value?.length) {
      let type: String = typeof this.operatorDistrictCtrl.value;
      console.log(type === 'Object');
      if (type === 'Object') {
        params.district = this.operatorDistrictCtrl.value;
      } else {
        params.district = [];
        for (let i in this.operatorDistrictCtrl.value) {
          console.log(this.operatorDistrictCtrl.value[i])
          params.district.push(this.operatorDistrictCtrl.value[i]);
        }
      }
      params.district = JSON.stringify(params.district);
    }
    if (this.operatorCityCtrl.value?.length) {
      let type: String = typeof this.operatorCityCtrl.value;
      if (type === 'Object') {
        params.city = this.operatorCityCtrl.value;
      } else {
        params.city = [];
        for (let i in this.operatorCityCtrl.value) {
          console.log(this.operatorCityCtrl.value[i])
          params.city.push(this.operatorCityCtrl.value[i]);
        }
      }
      params.city = JSON.stringify(params.city);
    }
    console.log(params);
    this.api.get('8053/api/get_org', params).subscribe(result => {
      if (result != null && result.data) {
        this.operatorList = result.data;
        console.log(this.operatorList)
      } else {
        this.isNoOperators = true;
      }
    })

  }

  goToAddVehicle(i?: any, isCopy?: string) {
    let navigationExtras: any = {
      state: {
        vehicle: this.operatorList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/addvehicle'], navigationExtras);
  }

  delete(i: any) {
    let param: any = { sharedVaultSno: this.sharedVaultList[i].sharedVaultSno };
    this.api.delete('8053/api/delete_shared_user', param).subscribe((result: any) => {
      if (result != null && result.data) {
        this.toastrService.success("Deleted Successfully");
        this.sharedVaultUsers.splice(this.selectedSharedVaultIndex, 1)
      }
    }, error => {
      this.toastrService.error(error)
    });
    this.getOrganization();
  }

  deleteVault(i: any) {
    let param: any = { vaultSno: this.myVaultList[i].vaultSno };
    this.api.delete('8053/api/delete_vault', param).subscribe((result: any) => {
      if (result != null && result.data) {
        this.toastrService.success("Deleted Successfully");
        this.sharedVaultUsers.splice(this.selectedSharedVaultIndex, 1)
      }
    }, error => {
      this.toastrService.error(error)
    });
    this.getOrganization();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.vaultName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.myVaultList = temp;
    this.table.offset = 0;
  }

  updateValue(event, cell, cellValue, row) {
    this.editing[row.$$index + '-' + cell] = false;
    this.myVaultList[row.$$index][cell] = event.target.value;
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  goToAddNewPassword() {
    this.router.navigateByUrl('vault/addnewpassword')
  }

  dimiss() {
    $('#myModal').modal('toggle');
  }

  selectAll() {
    this.isSelectAll = this.isSelectAll ? false : true;
    for (let i in this.userList) {
      this.userList[i].isSelect = this.isSelectAll;
    }
  }

  shareVault() {
    let sharedVaultList: any = [];
    for (let i in this.userList) {
      if (this.userList[i].isSelect) {
        sharedVaultList.push({ vaultSno: this.selectedVaultSno, appUserSno: this.userList[i].appUserSno, ownerFlag: false, folderName: this.selectFolder });
      }
    }
    let body = { sharedVaultList: sharedVaultList };
    console.log(body);
    this.api.post('8053/api/insert_shared_vault', body).subscribe((result) => {
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('Vault Shared Successfully');
        this.dimiss();
        this.getOrganization();
      } else {
      }
    })
  }

  openSharedValutDetails(vaultSno: any) {
    let param: any = { vaultSno: vaultSno };
    this.api.get('8053/api/get_shared_vault_user', param).subscribe((result) => {
      if (result != null && result.data) {
        this.sharedVaultUsers = result.data;
        console.log(this.sharedVaultUsers)
      } else {
      }
    })
  }


  deleteSharedUser() {
    let param: any = { sharedVaultSno: this.sharedVaultUsers[this.selectedSharedVaultIndex].sharedVaultSno };
    this.api.delete('8053/api/delete_shared_user', param).subscribe((result: any) => {
      if (result != null && result.data) {
        this.toastrService.success("Deleted Successfully");
        this.sharedVaultUsers.splice(this.selectedSharedVaultIndex, 1);
        this.getOrganization();
      }
    }, error => {
      this.toastrService.error(error)
    });
  }


  openModal(index: any) {
    this.selectedOperators = this.operatorList[index];
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
        let index = this.operatorList.indexOf(this.selectedOperators);
        this.operatorList[index].orgStatusCd = body.orgStatusCd;
      }

    })
  }


getMoreOrg(event: any) {
  let isFirst: boolean = true;
  this.pageIndex = parseInt(event?.pageIndex);
  this.pageSize = parseInt(event?.pageSize);
  if (event.previousPageIndex > event.pageIndex) {
    this.skip = this.skip - event.pageSize;
    this.getOrganization();
  } else if (event.previousPageIndex < event.pageIndex) {
    this.skip = this.skip + event.pageSize;
    this.getOrganization();
  } else {
    this.paginator.pageIndex = 0;
    this.pageIndex = 0;
    this.skip = 0;
    this.operatorList = [];
  }

  if (this.limit != event.pageSize) {
    this.paginator.pageIndex = 0;
    this.pageIndex = 0;
    this.operatorList = [];
    this.skip = 0;

    this.limit = event.pageSize;
    isFirst = false;
    this.getOrganization();
  }
  // if (this.busReportList.length <= this.pageIndex && isFirst) {
  //   this.goToSearch();
  // }
}

getOrgCount() {
  let param: any = {
    // orgSno: this.user.orgSno
  };
  this.isNoRecord = false;
  this.api.get("8053/api/get_all_org_count", param).subscribe(
    (result) => {
      console.log(result);
      // this.isShowLoad=false;
      if (result != null) {
        if (result.data != null && result.data.length > 0) {
          let dataValue = result.data[0].count;
          if (dataValue > 0) {
            this.count = dataValue;
          }
          this.getOrganization();
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
