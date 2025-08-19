import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { debounceTime, distinctUntilChanged, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-driverlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMatSelectSearchModule, MatFormFieldModule, MatSelectModule, MatPaginatorModule],
  templateUrl: './driverlist.component.html',
  styleUrls: ['./driverlist.component.scss']
})
export class DriverlistComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  selectedDriver: any;
  reason: any;
  user:any;
  search = new Subject<any>();
  searchKey: String = '';
  driverList = [];
  isNoRecord: boolean = true;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50,60,70,80,90,100];
  skip: number = 0;
  limit: number = 0;
  count:number=0;

  public districtList: any = [];
  public driverDistrictCtrl: FormControl = new FormControl();
  public driverDistrictFilterCtrl: FormControl = new FormControl();
  public filtereddriverDistrict: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  protected _onDestroy = new Subject<void>();
  isIndeterminate = false;
  isChecked = false;
  

  constructor(private api: ApiService, private router: Router,private tokenStorage:TokenStorageService) {
    this.limit = this.itemPerPage.toString().split(',')[0];
   }

  ngOnInit() {
    
    this.user=this.tokenStorage.getUser();
    this.getDriverCount();
    this.getCurrentDistrict();
    this.search

    .pipe(debounceTime(1000), distinctUntilChanged())
    .subscribe((value: any) => {
      this.driverList = [];
      this.getDriverCount();
      this.getDriverDetail();
    });

    this.driverDistrictFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.getDriverCount();
    this.filterdriverDistrict();
});

  }

  
  getCurrentDistrict() {
    this.districtList = [];
    let params: any = {};
    this.api.get('8055/api/get_current_district', params).subscribe(result => {
      if (result != null && result.data) {
        this.districtList = result.data;
        this.filtereddriverDistrict.next(this.districtList.slice());
        console.log('district==',this.districtList)
      }
    });
  }

  // getCurrentDistrict() {
  //   this.districtList = [];
  //   let params: any = {};
  //   this.api.get('8053/api/get_current_district', params).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.districtList = result.data;
  //       console.log('district==',this.districtList)
  //       this.filtereddriverDistrict.next(this.districtList.slice());
  //     }
  //   });
  // }

  toggleDistrictSelectAll(selectAllValue: boolean) {
    this.filtereddriverDistrict
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let districtList = [];
          for (let obj of val) {
            districtList.push(obj?.districtSno)
          }
          this.driverDistrictCtrl.patchValue(districtList);
        } else {
          this.driverDistrictCtrl.patchValue([]);
        }
      });
  }

  protected filterdriverDistrict() {
    if (!this.districtList) {
      return;
    }
    let search = this.driverDistrictFilterCtrl.value;
    if (!search) {
      this.filtereddriverDistrict.next(this.districtList.slice());
      return;
    } else {
      search = search?.toLowerCase();
    }
    this.filtereddriverDistrict.next(
      this.districtList.filter((obj) => obj.cdValue?.toLowerCase().indexOf(search) > -1)
    );
  }

  getDriverDetail() {
    let params: any = { searchKey: this.searchKey };
    params.skip = this.skip
    params.limit = this.limit
    // params.activeFlag=null
    if(this.driverDistrictCtrl.value && this.driverDistrictCtrl.value != ''){
      params.district = JSON.stringify(this.driverDistrictCtrl.value); 
    }
    console.log(params);
    this.driverList =[];
    this.api.get('8055/api/get_driver_dtl', params).subscribe(result => {
      if (result != null && result.data) {
        this.driverList = result.data;
      console.log(this.driverList)

        for(let i in this.driverList){
          this.driverList[i].isShow = false;
        }
      }
    })
  }

  openModal(index: any) {
    this.selectedDriver = this.driverList[index];
    console.log(JSON.stringify(this.selectedDriver))
  }

  changeStatus(type: any) {
    let body: any = { driverSno: this.selectedDriver.driverSno, kycStatus: type == 'Approve' ? 19 : 58, type: type };
    // body.createdOn=this.api.networkData.timezone;
    body.createdOn = 'Asia/Kolkata';
    if (type == 'Reject') {
      body.rejectReason = this.reason
    }
    console.log('BODY',body)
    this.api.post('8053/api/accept_reject_driver_kyc', body).subscribe(result => {
      if (result != null) {
        this.getDriverDetail();
        this.reason = null;
      }

    })
  }

  gotoViewDriver(i?: any, isCopy?: string) {
    let navigationExtras: any = {
      state: {
        driver: this.driverList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/view-driver'], navigationExtras);
  }

  getMoreDriver(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getDriverDetail();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getDriverDetail();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.driverList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.driverList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getDriverDetail();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  getDriverCount(){
    let param: any = {
      // orgSno: this.user.orgSno
      searchKey:this.searchKey ,
      activeFlag:true
    };
    if(this.driverDistrictCtrl.value && this.driverDistrictCtrl.value != ''){
      param.district = JSON.stringify(this.driverDistrictCtrl.value); 
    }
    this.isNoRecord = false;
    this.api.get("8055/api/get_all_driver_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
            this.getDriverDetail();
          }else{
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
