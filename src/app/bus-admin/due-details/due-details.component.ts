import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/providers/api/api.service';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { TokenStorageService } from '../login/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, ReplaySubject, Subject, } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MaterialModule } from 'src/app/providers/material/material.module';

@Component({
  selector: 'app-due-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMatSelectSearchModule, MaterialModule],
  templateUrl: './due-details.component.html',
  styleUrls: ['./due-details.component.scss'],
})
export class DueDetailsComponent implements OnInit {

  dueExpiryList = [];
  appUser: any;
  searchKey: String = '';
  isLoading: boolean = false;
  isNoRecord: boolean = false;
  isPaidToPass: boolean[] = [false];
  searchVehicle = new Subject<any>();

  protected _onDestroy = new Subject<void>();
  vehicleList: any[];

  public vehicleExpiryCtrl: FormControl = new FormControl();
  public expiryCtrl: FormControl = new FormControl();


  public vehicleExpiryList: any = [];
  public vehicleExpiryFilterCtrl: FormControl = new FormControl();
  public filteredExpiryTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  pageSize: number = 0;
  pageIndex: number = 0;
  public passPaid: FormGroup;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  currentDate: Date = new Date();

  constructor(
    private api: ApiService,
    private router: Router,
    public fb: FormBuilder,
    private tokenStorageService: TokenStorageService,
    private datePipe: DatePipe,
  ) {

    this.appUser = this.tokenStorageService.getUser();
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit(): void {

    let param: any = window.history.state;
    console.log(param)
    this.vehicleExpiryCtrl.patchValue(param.name);

    this.expiryCtrl.patchValue(param.selecteDate);

    this.count = param.count;

    console.log(param)

    this.searchVehicle
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value: any) => {
        this.vehicleList = [];
        this.getDueExpiryDetails();

      });
    this.getDueExpiryDetails();

    this.passPaid = this.fb.group({
      vehicleDueVariablePaySno:[null],
      // vehicleDueSno: [null],
      vehicleSno: [null],
      orgSno: [null],
      isPassPaid: [false],
    });
  }

  getDueExpiryDetails() {
    let param: any = { orgSno: this.appUser.orgSno, currentDate: this.api.dateToSavingStringFormatConvertion(new Date()), activeFlag: true, searchKey: this.searchKey };
    // let param: any = { orgSno: this.appUser.orgSno, currentDate: this.currentDate, activeFlag: true, searchKey: this.searchKey };
    param.skip = this.skip
    param.limit = this.limit

    if (this.expiryCtrl.value != null) {
      param.selecteDate = this.vehicleExpiryCtrl.value
    }

    if (this.count != null) {
      param.count = this.count
    }

    if (this.vehicleExpiryCtrl.value) {
      param.expiryType = this.vehicleExpiryCtrl.value;
      param.today = this.datePipe.transform(new Date(), 'YYYY-MM-dd');
    }
    console.log(param)
    this.dueExpiryList = [];
    this.isLoading = true;
    this.api.get('8053/api/get_vehicle_due_expiry_details', param).subscribe(result => {
      console.log(result)
      this.isLoading = false;
      if (result.data[0].dueExpireList != null) {
        if (result.data[0].dueExpireList) {
          this.dueExpiryList = result.data[0].dueExpireList;
          let dataValue = result.data[0].count;
          if (dataValue > 0) {
            this.count = dataValue;
          }
          console.log(this.count)
          console.log(this.dueExpiryList)
          for (let i in this.dueExpiryList) {
          // if(this.dueExpiryList[i].dueList?.length){
          //   // let dateList = this.dueExpiryList[i].dueList.filter((obj) => new Date(obj?.duePayDate) > new Date());
          //   let dueList = this.dueExpiryList[i].dueList
          //   if (dueList.length > 0) {
          //     this.dueExpiryList[i].dueDay = dueList[0].duePayDate;
          //     this.dueExpiryList[i].expiryDays = dueList[0].expiryDays;
          //   }
          // }
            this.checkDueExpiry(i)
            // this.changeDate(i)
          }
        } else {
          this.dueExpiryList = [];
          this.isNoRecord = true;
        }
      } else {
        this.isNoRecord = true;
      }
    });
  }



  getDueAmount(loan: any) {
    var month = new Date().getMonth() + 1;
    var checkMonth = month == 13 ? 1 : month;
    const oneDay = 1000 * 60 * 60 * 24;
    // console.log('checkMonth',checkMonth)  
    if (loan.dueAmount) {
      return loan.dueAmount
    } else {
      for (let i = 0; i < loan.dueList.length; i++) {
      // console.log((new Date(loan.dueList[1].duePayDate)))
        if ((new Date() > new Date(loan.dueList[i].duePayDate)) && (new Date() >= new Date(loan.dueCloseDate))) {
          return loan.dueList[i].variableDueAmount
        } else {
          if ((new Date() <= new Date(loan.dueList[i].duePayDate)) && (new Date().getMonth() +1  == new Date(loan.dueList[i].duePayDate).getMonth() +1)) {
            if (new Date().getFullYear() == new Date(loan.dueList[i].duePayDate).getFullYear() && new Date().getMonth() + 1 == new Date(loan.dueList[i].duePayDate).getMonth() +1 ) {
              return loan.dueList[i].variableDueAmount;
            }
          }
          else {
            if (new Date().getFullYear() == new Date(loan.dueList[i].duePayDate).getFullYear() && checkMonth == new Date(loan.dueList[i].duePayDate).getMonth() + 1) {
              return loan.dueList[i].variableDueAmount;
            }
          }
        }
      }
    }
  }


  getThisMonthsDate(index: any) {
    let date = new Date(this.dueExpiryList[index]?.dueDate);
    date.setMonth(new Date().getMonth() + 1);
    date.setFullYear(new Date().getFullYear());
    this.dueExpiryList[index].dueDay = date;
  }



  tollPassDetails(i: any) {
    this.isPaidToPass[i] = !this.isPaidToPass[i];
    let body: any = {};
    body.vehicleDueVariablePaySno = this.dueExpiryList[i].vehicleDueVariablePaySno;
    if (this.isPaidToPass[i]) {
      body.isPassPaid = true;
    } else {
      body.isPassPaid = false;
    }
    console.log(body)
    this.api.put('8053/api/update_due_fixed_pay', body).subscribe((result: any) => {
      console.log(result)
      if (result != null && result.data) {
      }
    });
  }

  // changeDate(dueDate) {
  //   console.log(this.dueExpiryList[index]?.dueDate)
  //   let today: Date = new Date();
  //   let date: Date = new Date(this.dueExpiryList[index]?.dueDate);
  //   date.setMonth(today.getMonth());
  //   date.setFullYear(today.getFullYear());
  //   console.log(date);
  // }

  checkDueExpiry(index: any) {
    const currentDate = new Date();
    const current = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
    const closeDate = new Date(this.dueExpiryList[index]?.dueDate);
    const dueCloseDate = this.datePipe.transform(closeDate, 'yyyy-MM-dd');
    const expiry = this.dueExpiryList[index]?.expiryDays;
    if (dueCloseDate < current) {
      this.dueExpiryList[index].dueExpiryDays = 'Loan Closed';
    } else {
      if (expiry == 'Expiry') {
        this.dueExpiryList[index].dueExpiryDays = 'Expired';
      } else {
        this.dueExpiryList[index].dueExpiryDays = expiry + (expiry <= 1 ? ' Day' : ' Days');
      }
    }
  }

  // getVehicleExpiryList() {
  //   this.vehicleExpiryList = [{ name: 'Due Expiry' }];
  //   this.filteredExpiryTypes.next(this.vehicleExpiryList.slice());
  //   // if (!this.vehicleExpiryCtrl.value)
  //   //   this.vehicleExpiryCtrl.patchValue('All');
  // }


  getMoreVehicle(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getDueExpiryDetails();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getDueExpiryDetails();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.dueExpiryList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.dueExpiryList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getDueExpiryDetails();
    }
  }

}


