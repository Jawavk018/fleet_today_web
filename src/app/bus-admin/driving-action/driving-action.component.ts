import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from 'src/app/providers/api/api.service';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../login/token-storage.service';
import { Router } from '@angular/router';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-driving-action',
  standalone: true,
  imports: [CommonModule,PipesModule,FormsModule,ReactiveFormsModule,MatPaginatorModule],
  templateUrl: './driving-action.component.html',
  styleUrls: ['./driving-action.component.scss']
})
export class DrivingActionComponent implements OnInit {


  endDriverAttendance: any = FormGroup;
  searchdrivingvehicle = new Subject<any>();
  searchKey: String = '';
  appUser: any;
  isNoRecord: boolean = false;
  pageSize: number = 0;
  pageIndex: number = 0;
  maxValue: boolean = false;
  isLoad: boolean = false;
  isDisabled: boolean = false;
  dueDate: any = new Date();
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  @ViewChild('myModalClose') modalClose;
  @ViewChild('element') element: ElementRef;



  public vehicleDriveList: any = [];




  constructor(
    private api: ApiService, 
    public fb: FormBuilder,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private tokenStorageService: TokenStorageService,
    private datePipe:DatePipe,
    private router: Router
  ) {
    this.appUser = this.tokenStorageService.getUser();
    this.limit = this.itemPerPage.toString().split(',')[0];

    this.endDriverAttendance = this.fb.group({
      driverAttendanceSno: new FormControl(null),
      endTime: new FormControl(null, [Validators.required]),
      endValue: new FormControl(null, [Validators.required]),
    });
   }

  ngOnInit(): void {
    this.vehicleDriveList = [];
    this.getDrivingVehicleCount();
    this.searchdrivingvehicle
    .pipe(debounceTime(1000), distinctUntilChanged())
    .subscribe((value: any) => {
      this.vehicleDriveList = [];
      this.skip = 0;
      this.getDrivingVehicleCount();
  
    });
  }



  getDriveVehicle(){
    let params:any = { orgSno: this.appUser?.orgSno,searchKey:this.searchKey };
    params.skip = this.skip
    params.limit = this.limit
    this.api.get('8055/api/get_driving_vehicle', params).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.vehicleDriveList = result.data; 
        this.dateChange(0)
        // this.onChangeValue()
      }

    })
  }

  dateChange(i :any){
      this.dueDate = moment(this.vehicleDriveList[i].startTime).format('yyyy-MM-DD HH:mm')
  }

  onChangeValue(i :any) {
    this.maxValue = this.vehicleDriveList[i].startValue >= this.endDriverAttendance.value.endValue;
  }



  getDrivingVehicleCount() {
    let param: any = { orgSno: this.appUser.orgSno, searchKey: this.searchKey }
    this.isNoRecord = false;
    this.api.get('8055/api/get_driving_vehicle_count', param).subscribe(result => {
      // this.isLoading = false;
      console.log(result)
      if (result != null) {
        if (result.data?.length) {
          this.count = result.data[0]?.count;
          this.getDriveVehicle();
        } else{
        this.isNoRecord = true;
        }
      }
    });
  }


  save(i:number){
    let body: any = {};
    console.log(this.vehicleDriveList[i])
    body.driverAttendanceSno = this.vehicleDriveList[i].driverAttendanceSno;
    body.startValue = this.vehicleDriveList[i].startValue;
    body.endValue = this.endDriverAttendance.value.endValue;
    body.endTime = this.endDriverAttendance.value.endTime;
    body.acceptStatus = true;
    body.attendanceStatusCd = 29;
    this.isLoad = true;
    this.isDisabled = true;
    console.log(body)
    this.api.put('8053/api/update_org_attendance', body).subscribe((result: any) => {
      console.log(result)
      this.isLoad = false;
      this.isDisabled = false;
      if (result != null && result.data) {
        // this.getAttendanceInfo();
        this.toastrService.success('Driving end successfully');
        this.endDriverAttendance.reset();
        this.modalClose.nativeElement.click();
      }
    });
  }

  getMoreVehicleDriver(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getDriveVehicle();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getDriveVehicle();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.vehicleDriveList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.vehicleDriveList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getDriveVehicle();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

}
