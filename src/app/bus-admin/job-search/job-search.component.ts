import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ApiService } from 'src/app/providers/api/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { TokenStorageService } from '../login/token-storage.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MaterialModule,ConfirmDialogModule, NgxMatSelectSearchModule,GooglePlaceModule, AgmDirectionModule, AgmCoreModule],
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.scss']
})
export class JobSearchComponent implements OnInit {

  jobForm: any = FormGroup;
  isNoData: boolean = false;
  today = moment().format('yyyy-MM-DD')
  dueDate : any;
  isAdmin: boolean;
  appUser: any;
  postList = [];
  isLoading: boolean = false;
  isNoRecord: boolean = false;

  public driveTypeList: any = [];
  public driveTypeCtrl: FormControl = new FormControl();
  public driveTypeFilterCtrl: FormControl = new FormControl();
  public filteredDriveTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public fuelTypeList: any = [];
  public fuelTypeCtrl: FormControl = new FormControl();
  public fuelTypeFilterCtrl: FormControl = new FormControl();
  public filteredFuelTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  public transmissionTypeList: any = [];
  public transmissionTypeCtrl: FormControl = new FormControl();
  public transmissionTypeFilterCtrl: FormControl = new FormControl();
  public filteredTransmissionTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  isChecked = false;
  isIndeterminate = false;
  showCurrent: boolean = true;
  sourceMarkerLat: number;
  sourceMarkerLng: number;
  latLongList = [];
  sourceName: any;
  type: any
  sourceLocation = {};
  latLongSourceList: any[] = [];
  lat: number;
  lng: number;
  showBlurAction: boolean = false
  inputValue1: string;

  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  fromLat: number = 0;
  fromLng: number = 0;
  protected _onDestroy = new Subject<void>();



  zoom = 3
  center: google.maps.LatLngLiteral

  option = {
    types: [],
    componentRestrictions: { country: 'IN' }
  }

  constructor(private fb: UntypedFormBuilder,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private api: ApiService) {
      this.appUser = this.tokenStorageService.getUser();
      console.log(this.appUser)

    this.jobForm = new FormGroup({
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
      fuelTypeCd: new FormControl(null),
      transmissionTypeCd: new FormControl(null),
      jobTypeCd: new FormControl(null),
      latLang: new FormControl(null),
    });
    this.limit = this.itemPerPage.toString().split(',')[0];
   }

  ngOnInit(): void {
    let index = this.appUser?.menus?.findIndex((menu) => menu?.routerLink == '/job-search');
    if (index != -1) {
      this.isAdmin = this.appUser?.menus[index].isAdmin;
    }

    this.getFuelTypeEnum();
    // this.getDriveType();

    this.fuelTypeFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterFuelType();
      this.getpostCount();

    });

    this.transmissionTypeFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterTransmissionType();
      this.getpostCount();

    });

    this.driveTypeFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterDriveType();
      this.getpostCount();

    });
  }


  gotoViewPost(i?: any, isCopy?: string){
      let navigationExtras: any = {
        state: {
          post: this.postList[i],
          isCopy: isCopy == 'copy' ? true : false
        }
      };
      this.router.navigate(['/view-driver-post'], navigationExtras);
  }

  getDriveType(){
    Object.keys(this.jobForm.value).forEach(key => {
      if (this.jobForm.value[key] === null) delete this.jobForm.value[key];
    })
    let param: any = {};
    param = this.jobForm.value;
    param.latLang = Object.assign({}, this.sourceLocation)
    param.fromLat = param.latLang.lat ? param.latLang.lat : 0;
    param.fromLng = param.latLang.lang ? param.latLang.lang : 0;
    param.orgSno = this.appUser.orgSno;
    param.skip = this.skip
    param.limit = this.limit

    // if (this.expiryCtrl.value != null) {
    //   param.selecteDate = this.vehicleExpiryCtrl.value
    // }
    console.log(this.driveTypeCtrl)

    if (this.driveTypeCtrl.value && this.driveTypeCtrl.value != '') {
      param.jobTypeCd = '{' + this.driveTypeCtrl.value + '}'; 
    }
    if (this.fuelTypeCtrl.value && this.fuelTypeCtrl.value != '') {
      param.fuelTypeCd = '{' + this.fuelTypeCtrl.value + '}'; 
    }
    if (this.transmissionTypeCtrl.value && this.transmissionTypeCtrl.value != '') {
      param.transmissionTypeCd = '{' + this.transmissionTypeCtrl.value + '}'; 
    }
    this.postList = [];
    this.isLoading = true;
    console.log(param)
    this.api.get('8055/api/find_job', param).subscribe(result => {
      console.log(result)
      this.isLoading = false;
      if (result.data != null) {
        if (result.data) {
          this.postList = result.data;
          console.log(this.postList)
        } else {
          this.postList = [];
          this.isNoRecord = true;
        }
      } else {
        this.isNoRecord = true;
      }
    });
  }

  dateChange() {
    console.log(this.jobForm.value.fromDate)
    this.dueDate = moment(this.jobForm.value.fromDate).format('yyyy-MM-DD')
    console.log(this.dueDate)
  }

  getpostCount(){

  }

  getFuelTypeEnum() {
    this.fuelTypeList = [];
    let params: any = { codeType: 'fuel_type_cd' };
    this.api.get('8052/api/get_enum_names', params).subscribe(result => {
      if (result != null && result.data) {
        this.fuelTypeList = result.data;
        this.filteredFuelTypes.next(this.fuelTypeList.slice());
      }
    });
    this.getTransmissionTypeEnum();
  }

  getTransmissionTypeEnum() {
    this.transmissionTypeList = [];

    let params: any = { codeType: 'transmission_type_cd' };

    this.api.get('8052/api/get_enum_names', params).subscribe(result => {
      if (result != null && result.data) {
        this.transmissionTypeList = result.data;
        this.filteredTransmissionTypes.next(this.transmissionTypeList.slice());
      }
    });
    this.getPostTypeEnum();
  }

  getPostTypeEnum() {
    this.driveTypeList = [];

    let params: any = { codeType: 'job_type_cd' };

    this.api.get('8052/api/get_enum_names', params).subscribe(result => {
      if (result != null && result.data) {
        this.driveTypeList = result.data;
        this.filteredDriveTypes.next(this.driveTypeList.slice());
      }
    });
  }

  toggleFuelTypeSelectAll(selectAllValue: boolean){
    this.filteredFuelTypes
    .pipe(take(1), takeUntil(this._onDestroy))
    .subscribe((val) => {
      if (selectAllValue) {
        let fuelTypeList = [];
        this.getpostCount();
        for (let obj of val) {
          fuelTypeList.push(obj?.codesDtlSno)
        }
        this.fuelTypeList.patchValue(fuelTypeList);
      } else {
        this.fuelTypeCtrl.patchValue([]);
      }
    });
  }

  toggleTransmissionTypeSelectAll(selectAllValue: boolean){
    this.filteredTransmissionTypes
    .pipe(take(1), takeUntil(this._onDestroy))
    .subscribe((val) => {
      if (selectAllValue) {
        let transmissionTypeList = [];
        this.getpostCount();
        for (let obj of val) {
          transmissionTypeList.push(obj?.codesDtlSno)
        }
        this.transmissionTypeList.patchValue(transmissionTypeList);
      } else {
        this.transmissionTypeCtrl.patchValue([]);
      }
    });
  }

  toggleDriveTypeSelectAll(selectAllValue: boolean){
    this.filteredDriveTypes
    .pipe(take(1), takeUntil(this._onDestroy))
    .subscribe((val) => {
      if (selectAllValue) {
        let driveTypeList = [];
        this.getpostCount();
        for (let obj of val) {
          driveTypeList.push(obj?.codesDtlSno)
        }
        this.driveTypeList.patchValue(driveTypeList);
      } else {
        this.driveTypeCtrl.patchValue([]);
      }
    });
  }
  
  protected filterFuelType() {
    if (!this.fuelTypeList) {
      return;
    }
    let search = this.fuelTypeFilterCtrl.value;
    if (!search) {
      this.filteredDriveTypes.next(this.fuelTypeList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredDriveTypes.next(
      this.fuelTypeList.filter((obj) => obj.cdValue?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterTransmissionType() {
    if (!this.transmissionTypeList) {
      return;
    }
    let search = this.transmissionTypeFilterCtrl.value;
    if (!search) {
      this.filteredDriveTypes.next(this.transmissionTypeList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredTransmissionTypes.next(
      this.transmissionTypeList.filter((obj) => obj.cdValue?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterDriveType() {
    if (!this.driveTypeList) {
      return;
    }
    let search = this.driveTypeFilterCtrl.value;
    if (!search) {
      this.filteredDriveTypes.next(this.driveTypeList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filteredDriveTypes.next(
      this.driveTypeList.filter((obj) => obj.cdValue?.toLowerCase().indexOf(search) > -1)
    );
  }

  clearInputField(inputFieldName: string) {
    this[inputFieldName] = '';
    this.showBlurAction = true
  }

  public handleAddressChange(address: Address) {
    this.showCurrent = false;
    console.log(address)
    if (address.geometry && address.geometry.location) {
      this.sourceMarkerLat = address.geometry.location.lat();
      this.sourceMarkerLng = address.geometry.location.lng();
      this.lat = this.sourceMarkerLat;
      this.lng = this.sourceMarkerLng;
      this.zoom = 7; // Set an appropriate zoom level
      this.sourceName = address.name
      this.sourceLocation = this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address);
      // this.jobForm.get('userLatLong').patchValue(this.sourceName)
      // Clear old latLongSourceList
      this.latLongSourceList = [];
      // Set the new coordinates
      this.latLongSourceList.push([this.lat, this.lng])
      this.latLongList.push([this.lat, this.lng])
      console.log(this.latLongSourceList)
      console.log(this.latLongList)
    }
    // this.calculateDistance(this.sourceMarkerLat, this.sourceMarkerLng)
  }

  createLocationObject(lat: number, lang: number, place: string) {
    return { lat, lang, place };
  }

  getMoreBus(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getDriveType();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getDriveType();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.postList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.postList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getDriveType();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }
}
