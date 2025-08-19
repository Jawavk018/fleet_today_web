import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { DatePipe } from '@angular/common';
import { TokenStorageService } from '../login/token-storage.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';


@Component({
  selector: 'app-single',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmDialogModule],
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SingleComponent implements OnInit {

  formClear: boolean = false;
  isCreate: boolean = false;
  public searchText: string;
  public p: any;
  public action: string = "";
  public actionMode: string = "";
  public type: string = 'grid';
  public modalRef: NgbModalRef;
  interval: any;
  public form: UntypedFormGroup;
  kycMsg: any;
  user: any;
  orgvehicles: any = [];
  routes: any = [];
  singleRoutes: any = [];
  singleList: any = [];
  deleteList:any=[];
  hours: any = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  minutes: any = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', 
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', 
  '51', '52', '53', '54', '55', '56', '57', '58', '59'];
  runmins:any = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50'];

  startHrs: any = '00';
  startMints: any = '00';

  runningHrs: any = '00';
  runningMints: any = '00';
  selectedItem: any;
  isAdmin: boolean;

  constructor(
    public fb: UntypedFormBuilder,
    public toastrService: ToastrService,
    public translateService: TranslateService,
    private confirmDialogService: ConfirmDialogService,
    public modalService: NgbModal,
    private api: ApiService,
    private tokenStorageService: TokenStorageService, public datepipe: DatePipe
  ) {

    this.user = tokenStorageService.getUser();
    console.log(this.user)
  }

  ngOnInit() {
    this.getOrgVehicle();
    this.form = this.fb.group({
      orgSno: [null],
      routeSno: [null, Validators.compose([Validators.required])],
      vehicleSno: [null, Validators.compose([Validators.required])],
      activeFlag: [true, Validators.compose([Validators.required])],
      dateList: new FormArray([])
    });

    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/single');
      if (index != -1) {
        this.isAdmin = this.user?.menus[index].isAdmin;
      }
      console.log('isAdmin',this.isAdmin)
  }

  changeStartTime(i:number) {
    for(let j=0;j<this.dateList.value.length;j++){
      this.dateList.at(j).patchValue({
        startTime: this.dateList.at(j).value.startHrs?.toString() + ':' +
          this.dateList.at(j).value.startMints?.toString(),
          runTime: this.dateList.at(j).value.runningHrs?.toString() + ':' +
          this.dateList.at(j).value.runningMints?.toString()
      });
    }
  }


  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_org_vehicle", params).subscribe(result => {
      this.kycMsg = result
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.orgvehicles = result.data;
        this.selectedItem=this.orgvehicles[0]
        // console.log(this.orgvehicles)
        this.getSingleRoute(this.orgvehicles[0].vehicleSno);

      } else {
      }
    });
  }

  onChange(vehicleSno) {
    this.routes = null;
    let params = { orgSno: this.user.orgSno, vehicleSno: vehicleSno };
    this.api.get('8053/api/get_org_route', params).subscribe(result => {
      if (result.data != null && result.data.length > 0) {
        this.routes = result.data;
        // console.log(this.routes)
      }
    });
  }

  save() {
    let body: any = {};
    body = this.form.value;
    body.orgSno = this.user.orgSno;
    for (let i in body.dateList) {
      if (body.dateList[i]?.startTime == null) {
        body.dateList[i].startTime = "00:00"
      }
      if (body.dateList[i]?.startTime && body.dateList[i]?.runTime) {
        this.formClear = true;
        body.dateList[i].startTime = this.timeToDate(body.dateList[i]?.startTime);
        body.dateList[i].runTime = this.timeTOMinutes(body.dateList[i]?.runTime);
      } else {
        this.formClear = false;
        this.toastrService.error('check your Start time and Running time')
      }

    }
    if (this.formClear) {
      this.api.post("8053/api/insert_single_route", body).subscribe(result => {
        if (result.data != null && result.data.length > 0) {
          // this.singleList = result.data
          this.toastrService.success("Add Single Route Added Successfully");
          this.closeModal();
        } else {

        }
      });
    }

  }

  getSingleRoute(vehicleSno: number) {
    let params = { orgSno: this.user.orgSno, vehicleSno: vehicleSno};
    this.api.get("8053/api/get_single_route", params).subscribe(result => {
      if (result.data != null && result.data.length > 0) {
        this.singleRoutes = result.data;
        console.log(this.singleRoutes);
        for (let i in this.singleRoutes) {
          for(let j in this.singleRoutes[i].routeList)
            this.singleRoutes[i].routeList[j].runningTime = this.minutesToTime(this.singleRoutes[i].routeList[j].runningTime)
        }
      } else {
        this.singleRoutes = [];
      }
    });
  }

  public update() {
    let body: any = {};
    body = this.form.value;
    body.delete = this.deleteList;
    body.orgSno = this.user.orgSno;
    for (let i in body.dateList) {
      if (body.dateList[i]?.startTime == null) {
        body.dateList[i].startTime = "00:00"
      }
      if (body.dateList[i]?.startTime && body.dateList[i]?.runTime) {
        this.formClear = true;
        body.dateList[i].startTime = this.timeToDate(body.dateList[i]?.startTime);
        body.dateList[i].runTime = this.timeTOMinutes(body.dateList[i]?.runTime);

        console.log('start',body.dateList[i].startTime)
        console.log('run',body.dateList[i].runTime)
      } else {
        this.formClear = false;
        this.toastrService.error('check your Start time and Running time')
      }
    }
    this.api.put('8053/api/update_single_route', body).subscribe((result:any) => {
      // console.log(result);
      this.toastrService.success("Single Route Updated Successfully");
      this.closeModal();
    });
  }

  public delete(i: any) {
    let confirmText = "Are you sure to Delete ? ";
    this.confirmDialogService.confirmThis(confirmText, () => {
    let params: any = {};
    params.routeSno = this.singleRoutes[i].routeList[0].routeSno;
    params.vehicleSno = this.singleRoutes[i].vehicleSno;
    console.log(params)
    this.singleRoutes.splice(i, 1);
    this.api.delete('8053/api/delete_single_route', params).subscribe(result => {
      if (result != null && result) {
      }
    })
    this.toastrService.success('Single Route delete Successfully');
  }, () => {
  });

  }

  public toggle(type) {
    this.type = type;
  }

  public openModal(modalContent, i, mode) {
    if (mode == 'i') {
      if (this.user.orgSno) {
        if (this.kycMsg?.data) {
          this.isCreate = true;
          this.dateList.clear();
          this.createDateList();
          if(this.selectedItem?.vehicleSno){
            this.form.patchValue({
              vehicleSno:this.selectedItem.vehicleSno,
              activeFlag: true
            });
          }
          this.onChange(this.selectedItem?.vehicleSno)
          this.modalRef = this.modalService.open(modalContent, { container: '.app' });
          this.modalRef.result.then((result) => {
            this.form.reset();
          }, (reason) => {
            this.form.reset();
          });
        } else {
          this.toastrService.info("You Can add Single Only after verifying KYC of Stage Carriage Vehicle");        }
      } else {
        this.toastrService.info("Register your organization");
      }
    } else {
      this.isCreate = false;
      this.form.reset();
      this.dateList.clear();
      for(let k=0;k<this.singleRoutes[i].routeList.length;k++){
      this.createDateList();
      };
      let data: any = {
        orgSno: this.singleRoutes[i].orgSno, 
        routeSno: this.singleRoutes[i].routeList[0].routeSno, 
        vehicleSno: this.singleRoutes[i].vehicleSno, 
        activeFlag: this.singleRoutes[i].routeList[0].status
      };      
      data.dateList = [];
    for(let j=0;j<this.singleRoutes[i].routeList.length;j++){
      let initialTime = this.datepipe.transform(this.singleRoutes[i].routeList[j].startingTime, 'HH:mm');
      let sTime = initialTime.split(':');
      let runTiming = this.singleRoutes[i].routeList[j].runningTime;
      let rTime = runTiming.split(':');
      data.dateList.push({
        startTime: this.datepipe.transform(this.singleRoutes[i].routeList[j].startingTime, 'HH:mm'),
        runTime: this.singleRoutes[i].routeList[j].runningTime,
        startHrs: sTime[0],
        startMints: sTime[1],
        runningHrs: rTime[0],
        runningMints: rTime[1],
        singleRouteSno:this.singleRoutes[i].routeList[j].singleRouteSno
      })
    }
      this.onChange(this.singleRoutes[i].vehicleSno)
      this.interval = setInterval(() => {
        if (this.routes?.length) {
          clearInterval(this.interval);
          this.form.setValue(data);
        }
      }, 1000);
      // this.updateDateList();
      this.modalRef = this.modalService.open(modalContent, { container: '.app' });
      this.modalRef.result.then((result) => {
        this.form.reset();
      }, (reason) => {
        this.form.reset();
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  };


  onChangeRoute(routeSno) {
    console.log(routeSno)
  }

  get dateList() {
    return this.form.controls["dateList"] as UntypedFormArray;
  }

  createDateList() {
    var date: any = {};
    date.startHrs = '00';
    date.startMints = '00';
    date.runningHrs = '00';
    date.runningMints = '00';
    date.runTime = '00';
    date.startTime = '00';
    date.singleRouteSno=null;
    const dateForm = this.fb.group(date);
    this.dateList.push(dateForm);
  }

  updateDateList() {

    var date: any = {};
    date.startHrs = '00';
    date.startMints = '00';
    date.runningHrs = '00';
    date.runningMints = '00';
    date.runTime = '00';
    date.startTime = '00';
    date.singleRouteSno=null;
    const dateForm = this.fb.group(date);
    this.dateList.push(dateForm);
  }
  deletedate(i: number) {
    this.deleteList.push(this.dateList.value[i].singleRouteSno);
    this.dateList.removeAt(i);
    console.log(this.deleteList)

  }
  displayRoute(i: number) {
    this.getSingleRoute(this.orgvehicles[i].vehicleSno);

  }

  timeToDate(s: any) {
    let date: any = new Date();
    // console.log(s)
    let arr = s?.split(':');
    let hr = parseInt(arr[0]);
    let min = parseInt(arr[1]);
    date.setHours(hr);
    date.setMinutes(min);
    date.setSeconds(0);
    return this.api.dateToSavingStringFormatConvertion(date);

  }


  timeTOMinutes(r): any {
    // console.log(r)
    let arr = r.split(':');
    let hr = parseInt(arr[0]);
    let min = parseInt(arr[1]);
    let minutes = hr * 60 + min;
    return minutes;
  }


  minutesToTime(n) {
    // console.log(n)
    let num = n;
    let hours: any = (num / 60);
    let rhours: any = Math.floor(hours);
    let minutes: any = (hours - rhours) * 60;
    let rminutes: any = Math.round(minutes);
    return ((rhours > 9 ? rhours : '0' + rhours) + ":" + (rminutes > 9 ? rminutes : '0' + rminutes));
  }

  public closeModal() {
    // this.ngOnInit();
    this.modalRef.close();
    this.getSingleRoute(this.selectedItem?.vehicleSno);
  }

  listClick(event, newValue) {
    this.selectedItem = newValue;
  }

}
