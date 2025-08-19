import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MenuService } from '../../theme/components/menu/menu.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { TokenStorageService } from '../login/token-storage.service';
import { debounceTime, distinctUntilChanged, ReplaySubject, Subject } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormControl, FormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, FormsModule,MatPaginatorModule],
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class DriverComponent implements OnInit {

  user: any;
  driverList = [];
  driverLicenseList = [];
  projectUsers: any = [];
  isAdmin: boolean;
  public searchText: string;
  public record: any = [];
  searchDriverLicense = new Subject<any>();
  public action: string = "";
  public actionMode: string = "";
  public modalRef: NgbModalRef;
  searchDriver = new Subject<any>();
  projectLists: any = [];
  value:any;

  @ViewChild('driverDetach') driverDetach: any;


  

  @ViewChild(DatatableComponent) table: DatatableComponent;

  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  selected = [];
  editing = {};
  isEdit: boolean = false;
  projectList: any;
  public form: UntypedFormGroup;
  isNoData: boolean = false;
  selectedDriver: any;
  searchKey: String = '';
  searchLicense: String = '';
  isNoRecord: boolean = true;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  public expiryCtrl: FormControl = new FormControl();

  public driverExpiryList: any = [];
  public driverExpiryCtrl: FormControl = new FormControl();
  public filteredExpiryTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);



  
  constructor(
    private router: Router,
    private api: ApiService,
    public fb: UntypedFormBuilder,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private datePipe:DatePipe,
    private tokenStorageService: TokenStorageService,
    private confirmDialogService: ConfirmDialogService) {

    this.user = this.tokenStorageService.getUser();
    console.log(this.user)
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit() {


    this.driverList = [];
    let param: any = window.history.state;

    this.driverExpiryCtrl.patchValue(param.name);

    this.expiryCtrl.patchValue(param.selecteDate);

    this.getDriverCount();
    this.getDriverExpiryList();
    this.getDriverLicense();
    
    this.searchDriver.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: any) => {
        if (value != null) this.search(value);
      });
    this.searchDriverLicense.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: any) => {
        if (value != null) this.licence(value);
      });

      let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/driver');
      if (index != -1) {
        this.isAdmin = this.user?.menus[index].isAdmin;
      }

  }

  search(event: any) {
    this.driverList = [];
    this.searchKey = event.target.value;
    this.getDriverCount();
    this.getDriver();
  }

  licence(event: any) {
    this.searchLicense = event.target.value;
    this.getDriverLicense();
  }


  getDriverExpiryList(){
    this.driverExpiryList = [{name:'All'},{name:'Transport License Expiry'}];
    this.filteredExpiryTypes.next(this.driverExpiryList.slice());

    if(!this.driverExpiryCtrl.value)
       this.driverExpiryCtrl.patchValue('All');
  }

  getDriver() {
    let param: any = { orgSno: this.user.orgSno, activeFlag: true,searchKey:this.searchKey };
    param.skip = this.skip
    param.limit = this.limit


    if(this.expiryCtrl.value != null){
      param.selecteDate = this.driverExpiryCtrl.value
    }

    if(this.driverExpiryCtrl.value ){
      param.expiryType=this.driverExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(),'YYYY-MM-dd');
    }

    this.api.get('8055/api/get_driver', param).subscribe(result => {
      if (result.data != null) {
            this.driverList= result.data;
          console.log(this.driverList)
      } 
    });
  }


  getDriverLicense() {
    let param: any = { activeFlag: true, orgSno: this.user.orgSno };
    if (this.searchLicense) {
      param.searchKey = this.searchLicense
    }
    console.log(param);
    this.api.get('8055/api/get_driver_license', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.driverLicenseList = result.data;
        console.log('DriverLicss', this.driverLicenseList)
      } else {
        this.driverLicenseList = [];

      }
    });
  }




  
save(i: any, driverName:any) {
  let body: any = {};
  body.orgSno = this.user.orgSno;
  body.driverSno = this.driverLicenseList[i].driverSno;
  body.appUserSno=this.user.appUserSno;
  body.title = 'Drive Request';
  body.acceptStatusCd=125;
  body.message=driverName+" you got drive request from ";
  // body.createdOn=this.api?.networkData?.timezone;
  body.createdOn = 'Asia/Kolkata';
  console.log(body);
  this.api.put('8055/api/update_driver_accept_status', body).subscribe((result:any) => {
    console.log(result)
    if (result != null) {
      if (result?.msg != null) {
        this.toastrService.error(result?.msg);
      } else {
        console.log('In')
        // this.toastrService.success('Driver Add Successfully');
        this.getDriver();
      }

    }
  });
}

  goToAddDriver() {
    this.router.navigate(['/add-driver'])
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

  // goToEditDriver(index: any) {
  //   delete this.driverList[index].drivingLicenceCdVal;
  //   let navigationExtras: any = {
  //     state: {
  //       data:this.driverList[index]
  //     }
  //   };

  //   this.router.navigate(['/add-driver'],navigationExtras)

  // }



  deleteDriver(i: any) {
    if(this.driverList[i].attendanceStatus == 28){
      // this.toastrService.error("Driver is Still Running");
      this.driverDetach.nativeElement.click();
    }else{
      let confirmText = "Are you sure to Detach ? ";
      this.confirmDialogService.confirmThis(confirmText, () => {
        let param: any = { driverSno: this.driverList[i]?.driverSno, orgSno: this.driverList[i]?.orgSno };
        this.api.put('8053/api/update_driver_status', param).subscribe((result: any) => {
          if (result != null && result.data) {
            this.driverList.splice(i, 1);
          }
        })
        if (this.driverList.length == 0) {
          this.isNoData = true;
        }
        this.toastrService.success("Driver detached successfully");
      }, () => {
      });
    }

  }
  openModal(index: any) {
    this.selectedDriver = this.driverList[index];
  }

  getDriverCount() {
    let param: any = {
      orgSno: this.user.orgSno, 
      activeFlag: true,
      searchKey:this.searchKey 
    };
    if(this.expiryCtrl.value != null){
      param.selecteDate = this.driverExpiryCtrl.value
    }

    if(this.driverExpiryCtrl.value ){
      param.expiryType=this.driverExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(),'YYYY-MM-dd');
    }

    this.driverList =[];
    this.isNoRecord = false;
    console.log(param)
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
            console.log(this.count)
            this.getDriver();
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

  getMoreDriver(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getDriver();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getDriver();
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
      this.getDriver();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  clearSearch(){
    this.value = "";
    this.driverLicenseList = [];
  }

}
