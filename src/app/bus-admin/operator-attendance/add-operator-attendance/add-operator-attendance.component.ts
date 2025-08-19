import { Component, OnInit, Directive, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from 'src/app/bus-admin/login/token-storage.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TwoDigitDecimaNumberDirective } from '../two-decimal.directive';
import * as moment from 'moment-timezone';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import $ from 'jquery';
import { MaterialModule } from 'src/app/providers/material/material.module';



declare var $: any;


@Component({
  selector: 'app-add-operator-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, AutocompleteLibModule, MatSlideToggleModule,
    TwoDigitDecimaNumberDirective, MatRadioModule],
  templateUrl: './add-operator-attendance.component.html',
  styleUrls: ['./add-operator-attendance.component.scss']
})
export class AddOperatorAttendanceComponent implements OnInit {

  driverAttendance: FormGroup;
  user: any;
  selectedVehicle: any;
  vehicleSno: number = 0;
  selectedDriver: any;
  orgvehicles: any = [];
  driverList: any = [];
  attendance: any;
  maxValue: boolean = false;
  maxOdometerValue: boolean = false;
  selectedOption: string = 'null'; 
  data: any = [];
  name: string;
  driverData: any = [];
  vehicleKey = 'vehicleRegNumber';
  driverKey = 'driverName';
  initialVehicle: any;
  InputValue: any;
  isAdd: boolean = false;
  today = moment().format('yyyy-MM-DD HH:mm')
  dueDate = moment(this.today).format('yyyy-MM-DD HH:mm')
  isLoad: boolean = false;
  reportList: any = [];
  isChecked = false;
  fuelType: any;
  reportId: any;
  reportIdList = [];
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  @ViewChild('myModalClose') modalClose;

  @ViewChild('myModal') modal!: ElementRef;

  totalRunningKm: number = 0;
  totalFuelPrice: number = 0.0;
  showRunningKm: boolean = false;
  showFluePrice: boolean = false;
  totalFuelQuantity: number = 0.0;



  fuelModal: any;
  fuelmodalList: any = [];








  constructor(
    public fb: FormBuilder,
    private api: ApiService,
    public location: Location,
    private tokenStorageService: TokenStorageService,
    public toastrService: ToastrService,
    private el: ElementRef
  ) {
    this.user = this.tokenStorageService.getUser();

    this.driverAttendance = this.fb.group({
      driverAttendanceSno: new FormControl(null),
      driverSno: new FormControl(null, [Validators.required]),
      vehicleSno: new FormControl(null, [Validators.required]),
      startLatLong: new FormControl(null),
      endLatLong: new FormControl(null),
      media: new FormControl(null),
      startTime: new FormControl(null),
      endTime: new FormControl(null, [Validators.required]),
      startValue: new FormControl(null, [Validators.required]),
      endValue: new FormControl(null, [Validators.required]),
      reportId: new FormControl(null),
      fuelFillTypeCd: new FormControl(null),
      filledDate: new FormControl(null),
      odoMeterValue: new FormControl(null),
      fuelQuantity: new FormControl(null),
      pricePerLtr: new FormControl(null),
      isFilled: new FormControl(null),
      totalRunningKm: new FormControl(null),
      totalFuelPrice: new FormControl(null),
    });
  }
  //  @HostListener('keydown', ['$event'])
  //   onKeyDown(event: KeyboardEvent) {
  //     console.log(this.el.nativeElement.value);
  //     // Allow Backspace, tab, end, and home keys
  //     if (this.specialKeys.indexOf(event.key) !== -1) {
  //       return;
  //     }
  //     let current: string = this.el.nativeElement.value;
  //     const position = this.el.nativeElement.selectionStart;
  //     const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
  //     if (next && !String(next).match(this.regex)) {
  //       event.preventDefault();
  //     }
  //   }

  //  onFillingFuel(){
  //   if(this.driverAttendance.value.filledDate){
  //     this.driverAttendance.get('odoMeterValue').setValidators([Validators.required]); 
  //     this.driverAttendance.get('fuelQuantity').setValidators([Validators.required]); 
  //     this.driverAttendance.get('pricePerLtr').setValidators([Validators.required]); 
  //     this.driverAttendance.get('isFilled').setValidators([Validators.required]); 

  //     this.driverAttendance.get('odoMeterValue').updateValueAndValidity();
  //     this.driverAttendance.get('fuelQuantity').updateValueAndValidity();
  //     this.driverAttendance.get('pricePerLtr').updateValueAndValidity();
  //     this.driverAttendance.get('isFilled').updateValueAndValidity();
  //   }
  //  }

  ngOnInit() {
    var invalidChars = ["-", "e", "+", "E"];

    $("input[type='number']").on("keydown", function (e) {
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
    });

    this.getOrgVehicle();
    this.getDriver();

  }


  closeModal() {
    // this.openModal = false;
  }

  getOrgVehicle() {
    let param = { orgSno: this.user.orgSno, activeFlag: true }
    this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
      if (result != null && result.data) {
        this.orgvehicles = result.data
        this.data = result.data;
        console.log(this.data)
        this.vehicleSno = this.orgvehicles[0]?.vehicleSno
        this.selectedVehicle = this.vehicleSno;
        this.initialVehicle = this.orgvehicles[0]?.vehicleRegNumber
        console.log(this.orgvehicles)
        this.getReport()
      }
    });
  }


  changeToggle(event: any) {
    this.isChecked = !this.isChecked
    if (this.isChecked) {
      this.driverAttendance.get('filledDate').addValidators(Validators.required);
      this.driverAttendance.get('pricePerLtr').addValidators(Validators.required);
      this.driverAttendance.get('isFilled').addValidators(Validators.required);
    }
  }

  getReport() {
    let param = { orgSno: this.user.orgSno, vehicleSno: this.driverAttendance.value.vehicleSno ?? this.selectedVehicle }
    console.log(this.driverAttendance.value)
    console.log(param)
    this.api.get('8053/api/get_verify_report', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.reportList = result.data;
        console.log(this.reportList)
      } else {
        this.reportList = [];
      }
    });
  }

  // getSelectOdometerReading(){
  //   for(let i in this.orgvehicles){
  //     if(this.orgvehicles[i].vehicleSno == this.driverAttendance.value.vehicleSno){
  //     this.selectedOdometerValue =  this.orgvehicles[i].vehicleDetails.odoMeterValue
  //     }
  //   }
  // }

  // checkOdometer(){
  //   console.log(this.selectedOdometerValue)
  //      this.maxOdometerValue = this.selectedOdometerValue > this.driverAttendance.value.startValue

  // }

  onChangeValue() {
    this.maxValue = this.driverAttendance.value.startValue >= this.driverAttendance.value.endValue;
  }

  getDriver() {
    let param = { orgSno: this.user.orgSno, activeFlag: true }
    this.api.get('8055/api/get_driver', param).subscribe(result => {
      // console.log(result)
      if (result != null && result.data) {
        this.driverList = result.data;
        this.driverData = result.data;
        console.log(this.driverData)
      }
    });
  }

  dateChange() {
    this.dueDate = moment(this.driverAttendance.value.startTime).format('yyyy-MM-DD HH:mm')
    console.log(this.dueDate)
  }

  getReportId(vehicleSno: any, reportId?: number) {
    // this.driverAttendance.reset();
    if (reportId) {
      this.reportIdList = [];
      this.reportIdList.push({ 'reportId': reportId });
    }
    console.log(this.reportIdList)

    this.vehicleSno = vehicleSno;
    this.driverAttendance.patchValue({
      vehicleSno: vehicleSno,
      reportId: this.reportIdList[0].reportId
    })
  }


  public getFuelType(name: any) {
    if (name == 'manual') {
      this.isAdd = true;
    } else if (name == 'Add') {
      this.isAdd = false;
    }
    let param: any = { codeType: 'fuel_fill_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.fuelmodalList = result.data;
        console.log(this.fuelmodalList)
      } else {
      }
    });
  }


  getFuelValue(fuelFillTypeCd: any) {
    this.driverAttendance.patchValue({
      fuelFillTypeCd: fuelFillTypeCd
    })
    if (fuelFillTypeCd == 133) {
      this.driverAttendance.get('filledDate').addValidators(Validators.required);
      this.driverAttendance.get('pricePerLtr').addValidators(Validators.required);
      this.driverAttendance.get('isFilled').addValidators(Validators.required);
      this.driverAttendance.patchValue({
        isFilled: true,
      })
      console.log(this.driverAttendance.value)
    } else if (fuelFillTypeCd == 134) {
      this.driverAttendance.get('filledDate').addValidators(Validators.required);
      this.driverAttendance.get('pricePerLtr').addValidators(Validators.required);
      this.driverAttendance.get('isFilled').addValidators(Validators.required);
      this.driverAttendance.patchValue({
        isFilled: false,
      })
    } else {

    }

  }
  checkReport(event: any) {
    console.log(this.reportList[0]?.report[0]?.reportId)
    console.log(this.driverAttendance.value.reportId)
    console.log(this.driverAttendance.value)
  }

  closeModel() {
    this.driverAttendance.reset();
  }

  save() {
    console.log(this.reportIdList)
    let body: any = this.driverAttendance.value;
    body.driverSno = this.selectedDriver;
    body.vehicleSno = parseInt(this.driverAttendance.value.vehicleSno ?? this.selectedVehicle);
    if (this.driverAttendance.value.fuelFillTypeCd != 135) {
      body.filledDate = this.driverAttendance.value.endTime;
      body.fuelAmount = (this.driverAttendance.value.fuelQuantity) * (this.driverAttendance.value.pricePerLtr);
    }

    body.odoMeterValue = this.driverAttendance.value.odoMeterValue ?? this.driverAttendance.value.startValue;
    body.attendanceStatusCd = 29;
    body.acceptStatus = true;
    if (this.driverAttendance.value.fuelFillTypeCd != 133) {
      console.log(this.driverAttendance.value)
      body.reportId = parseInt(this.driverAttendance.value.reportId);
    } else {
      body.reportId = this.reportIdList[0]?.reportId;
    }
    body.isCalculated = true;
    this.isLoad = true;
    console.log(body)
    this.api.post('8053/api/insert_attendance_manually', body).subscribe(result => {
      this.isLoad = false;
      console.log(result)
      if (result != null && result.data) {
        if (result.data.msg) {
          this.toastrService.error(result?.data?.msg);
        } else {
        this.toastrService.success('Driver attendance added successfully');
        this.driverAttendance.reset();
        this.modalClose.nativeElement.click();
        this.getReport();
        this.driverAttendance.reset()  
      }
    }
    });
  }

  selectEvent(item) {
    this.selectedVehicle = item.vehicleSno;
    console.log(item.vehicleSno)
  }

  generateReport(id: number) {
    let body: any = {};
    body.reportId = this.reportIdList;
    console.log(body)
    this.api.post('8055/api/insert_bus_report', body).subscribe(result => {
      this.isLoad = false;
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('Report generate successfully');
        this.getReport()
      }
    });
  }
  getAllReportId() {
    this.reportIdList = [];
    for (let i = 1; i < this.reportList.length; i++) {
      if (this.reportList[i]?.report[0]?.reportId) {
        this.reportIdList.push({ 'reportId': this.reportList[i]?.report[0]?.reportId });
      }
    }
  }

  selectVehicleEvent(item) {
    this.selectedVehicle = item.vehicleSno;
    this.vehicleSno = item.vehicleSno;
    if (this.vehicleSno && this.vehicleSno != undefined) {
      this.getReport();
    }
    console.log(item.vehicleSno)
  }

  selectDriver(value) {
    this.selectedDriver = value.driverSno;
    console.log(value.driverSno)
  }
  onChangeSearch(val: string) { }
  onFocused(e) { }

  //    setTwoNumberDecimal(event) {
  //     this.value = parseFloat(this.value).toFixed(2);
  // }

  kmCalculate() {
    if (this.driverAttendance.value.endValue && this.driverAttendance.value.startValue) {
      const endValue = parseFloat(this.driverAttendance.value.endValue);
      const startValue = parseFloat(this.driverAttendance.value.startValue);

      if (endValue > startValue) {
        this.totalRunningKm = endValue - startValue;
        this.showRunningKm = true;
      } else {
        this.showRunningKm = false;
      }
    }
  }

  trimToTwoDecimalPlaces(numberToTrim: number): number {
    return Number(numberToTrim.toFixed(2));
  }

  calculate() {
    if (this.driverAttendance.value.fuelQuantity && this.driverAttendance.value.pricePerLtr) {
      this.totalFuelPrice = this.trimToTwoDecimalPlaces(this.driverAttendance.value.fuelQuantity * this.driverAttendance.value.pricePerLtr);
    }
    if (this.driverAttendance.value.totalFuelPrice && this.driverAttendance.value.pricePerLtr) {
      this.totalFuelQuantity = this.trimToTwoDecimalPlaces(this.driverAttendance.value.totalFuelPrice / this.driverAttendance.value.pricePerLtr);
    }
  }


}
