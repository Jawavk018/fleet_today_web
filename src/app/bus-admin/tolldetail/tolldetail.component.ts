import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReplaySubject, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouteCategory } from '../route/route.model';
import { TokenStorageService } from '../login/token-storage.service';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MaterialModule } from 'src/app/providers/material/material.module';

@Component({
  selector: 'app-tolldetail',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgxMatSelectSearchModule,MaterialModule],
  templateUrl: './tolldetail.component.html',
  styleUrls: ['./tolldetail.component.scss']
})
export class TolldetailComponent implements OnInit {

  tollExpiryList = [];
  searchVehicle = new Subject<any>();
  searchKey: String = '';
  public tollPaid: FormGroup;
  appUser: any;
  isLoading: boolean = false;
  isNoRecord: boolean = false;
  isPaidToll: boolean[] = [false];
  public vehicleExpiryCtrl: FormControl = new FormControl();
  public expiryCtrl: FormControl = new FormControl();


  public vehicleExpiryList: any = [];
  public vehicleExpiryFilterCtrl: FormControl = new FormControl();
  public filteredExpiryTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);


  protected _onDestroy = new Subject<void>();



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
    this.limit = this.itemPerPage.toString().split(',')[0];
 
  }

  ngOnInit(): void {
    let param: any = window.history.state;
    console.log(param)
    this.vehicleExpiryCtrl.patchValue(param.name);

    this.expiryCtrl.patchValue(param.selecteDate);

    console.log(param)
    console.log(this.vehicleExpiryCtrl)

      this.getVehicleExpiryList();
      this.getOperaterVehicle();


    this.searchVehicle
    .pipe(debounceTime(1000), distinctUntilChanged())
    .subscribe((value: any) => {
      this.tollExpiryList = [];
      // this.getVehicleCount();
      this.getOperaterVehicle();

    });

    this.vehicleExpiryFilterCtrl.valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe(() => {
      this.filterVehicleExpiry();
    });

    this.tollPaid = this.fb.group({
      tollPassDetailSno: [null],
      vehicleSno: [null],
      orgSno: [null],
      isPaid: [false],
    });
  }


  getOperaterVehicle() {
    let param: any = { orgSno: this.appUser.orgSno, activeFlag: true, searchKey: this.searchKey };
    param.skip = this.skip
    param.limit = this.limit
    if (this.expiryCtrl.value != null) {
      param.selecteDate = this.vehicleExpiryCtrl.value
    }

    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    this.tollExpiryList = [];
    this.isLoading = true;
    this.api.get('8053/api/get_all_toll_expiry', param).subscribe(result => {
      console.log(result)
      this.isLoading = false;
      if (result.data[0].passExpireList != null) {
        if (result.data[0].passExpireList) {
          this.tollExpiryList = result.data[0].passExpireList;
          let dataValue = result.data[0].count;
          if (dataValue > 0) {
            this.count = dataValue;
          }
          console.log(this.count)
          console.log(this.tollExpiryList)
          for (let i in this.tollExpiryList) {
              if (this.tollExpiryList[i]?.passEndDate)
                this.checkPassExpiry(i)
          }
        } else {
          this.tollExpiryList = [];
          this.isNoRecord = true;
        }
      } else {
        this.isNoRecord = true;
      }
    });
  }



  checkPassExpiry(index: any) {
      let currentDate: any = new Date();
      let dateSent: any = new Date(this.tollExpiryList[index]?.passEndDate);
      let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
      if (count < 0) {
        this.tollExpiryList[index].tollExpiryDays = 'Expired';
      } else {
        this.tollExpiryList[index].tollExpiryDays = count + (count <= 1 ? ' Day' : ' Days');
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
      this.tollExpiryList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.tollExpiryList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getOperaterVehicle();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  tollPaidDetails(i: any){
    this.isPaidToll[i] = !this.isPaidToll[i];
      let body: any = {};
      body.tollPassDetailSno = this.tollExpiryList[i].tollPassDetailSno;
      if(this.isPaidToll[i]){
        body.isPaid = true;
      }else{
        body.isPaid = false; 
      }
      console.log(body)
      this.api.put('8053/api/update_toll_paid_details', body).subscribe((result: any) => {
        console.log(result)
        if (result != null && result.data) {
        }
      });
    
  }


  getVehicleExpiryList() {
    this.vehicleExpiryList = [{ name: 'Toll Expiry' }];
    this.filteredExpiryTypes.next(this.vehicleExpiryList.slice());
    // if (!this.vehicleExpiryCtrl.value)
    //   this.vehicleExpiryCtrl.patchValue('All');
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
}
