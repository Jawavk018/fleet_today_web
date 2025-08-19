import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { TokenStorageService } from '../login/token-storage.service';
import * as moment from 'moment-timezone'
import { ApiService } from 'src/app/providers/api/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
declare var $: any;


@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatChipsModule, MatIconModule,],
  templateUrl: './add-booking.component.html',
  styleUrls: ['./add-booking.component.scss']
})
export class AddBookingComponent implements OnInit {

  bookingForm: any = FormGroup;
  operatorvehicles: any = [];
  today = moment().format('yyyy-MM-DD HH:mm')
  dueDate = moment(this.today).format('yyyy-MM-DD HH:mm')
  ContractCarrierVehicleList: any = [];
  user: any;
  isEnddateValid: boolean = false;
  isChecked: boolean = false;
  tollIsChecked: boolean = false;
  noOfDaysBooked: number = 0;
  balanceAmount: number = 0.0;
  uniqueId: string = '';
  count: any;
  tripPlanList: string[] = [];
  textareaContent: string;

  trip: any = [];




  constructor(private router: Router,
    private api: ApiService,
    private toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    public location: Location,
    private el: ElementRef,
    private datePipe: DatePipe) {

    this.user = this.tokenStorageService.getUser();


    this.bookingForm = new FormGroup({
      bookingSno: new FormControl(null),
      vehicleSno: new FormControl(null),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      customerName: new FormControl('', [Validators.required]),
      customerAddress: new FormControl(null, [Validators.compose([Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])]),
      contactNumber: new FormControl('', [Validators.required]),
      noOfDaysBooked: new FormControl('', [Validators.required]),
      totalBookingAmount: new FormControl('', [Validators.required]),
      advancePaid: new FormControl('', [Validators.required]),
      balanceAmountTopaid: new FormControl('', [Validators.required]),
      tollParkingIncludes: new FormControl(null),
      driverWagesIncludes: new FormControl(null),
      driverWages: new FormControl(null),
      description: new FormControl(null),
      bookingId: new FormControl(null),
      tripPlan: new FormControl(null),
    });
  }


  ngOnInit(): void {

    let param: any = window.history.state;
    console.log(param)
    this.count = param.count;
    this.trip = param.trip;
    console.log(this.trip)
    var invalidChars = ["-", "e", "+", "E"];

    $("input[type='number']").on("keydown", function (e) {
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
    });
    
    this.getContractCarrierVehicles();
    if(this.trip){
      if(this.trip['tripPlanArray'] != null){
        var tripArray = this.trip['tripPlanArray']
        console.log(tripArray)
        this.tripPlanList = tripArray.split(',').filter(item => item !== '');
        console.log(this.tripPlanList)
      }
      this.setValue();
    }
  }

  onDateTimeChange(event: Event): void {
    // const inputElement = event.target as HTMLInputElement;
    // if (inputElement && inputElement.value) {
    //   // Extract the date and time from the input value
    //   const dateTime = new Date(inputElement.value);
      
    //   // Set the time interval you want (e.g., 30 minutes)
    //   const intervalMinutes = 30;
      
    //   // Round the minutes to the nearest interval
    //   const roundedMinutes = Math.round(dateTime.getMinutes() / intervalMinutes) * intervalMinutes;
    //   dateTime.setMinutes(roundedMinutes);
    //   console.log(dateTime)
      
    //   // Update the input value with the rounded time
    //   const formattedDateTime = dateTime.toISOString().slice(0, 16);
    //   inputElement.value = formattedDateTime;
    //   console.log(inputElement.value)
    // }
  }  

  getContractCarrierVehicles() {
    let param = { vehicleTypeCd: 22, orgSno: this.user.orgSno, activeFlag: true, kycStatusCD: 19 }
    this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
      if (result != null && result.data) {
        this.ContractCarrierVehicleList = result.data;
        this.bookingForm.patchValue({
          vehicleSno: this.ContractCarrierVehicleList[0].vehicleSno
        })

      }
    });
  }

  dateChange() {
    this.dueDate = moment(this.bookingForm.value.startDate).format('yyyy-MM-DD HH:mm')
  }

  validateDateRange(type: any) {
    if (type == 'End') {
      this.isEnddateValid = false;
      if (this.bookingForm.value?.startDate > this.bookingForm.value?.endDate) {
        this.isEnddateValid = true;
      }
    }

  }


  save() {
    this.generateUniqueId();
    let body: any = this.bookingForm.value;
    body.createdOn = 'Asia/Kolkata';
    console.log(body);
    this.api.post('8058/api/create_booking', body).subscribe(result => {
      if (result != null && result.data) {
        if (result?.data?.msg != null) {
          this.toastrService.error(result?.data?.msg);
        } else {
          this.toastrService.success('Booking Vehicle Successfully');
          this.location.back();
        }
      }
        // this.router.navigate(['booking'])
      
    });
  }

  setValue(){
    console.log(this.trip)
    let trip: any = {
      vehicleSno: this.trip.vehicleSno,
      bookingSno: this.trip.bookingSno,
      customerName: this.trip.customerName,
      contactNumber: this.trip.contactNumber,
      customerAddress: this.trip.customerAddress,
      noOfDaysBooked: this.trip.noOfDaysBooked,
      totalBookingAmount: this.trip.totalBookingAmount,
      advancePaid: this.trip.advancePaid,
      balanceAmountTopaid: this.trip.balanceAmountTopaid,
      description: this.trip.description,
      tripPlan: this.trip.tripPlan,
      startDate: this.trip.startDate,
      endDate: this.trip.endDate,
      tollParkingIncludes: this.trip.tollParkingIncludes,
      driverWagesIncludes: this.trip.driverWagesIncludes,
      driverWages: this.trip.driverWages,
      bookingId: this.trip.bookingId,
    };
    this.bookingForm.setValue(trip);
    this.isChecked = this.trip.tollParkingIncludes;
    this.textareaContent = this.trip.tripPlan;
  }

  Update() {
    let body: any = this.bookingForm.value;
    console.log(body)
    this.api.put('8058/api/update_booking', body).subscribe((result: any) => {
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('Trip Booking details Updated Successfully');
        this.location.back();
      } else {

      }

    });
  }

  calculateDateDifference() {
    const start = new Date(this.bookingForm.value.startDate);
    const end = new Date(this.bookingForm.value.endDate);
    if(this.bookingForm.value.endDate){
      const timeDifference = end.getTime() - start.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
    this.noOfDaysBooked  = daysDifference;
    } 
    this.bookingForm.get('noOfDaysBooked').setValue(this.noOfDaysBooked); 
  }

  calculateBalance(){  
    this.balanceAmount = this.trimToTwoDecimalPlaces(this.bookingForm.value.totalBookingAmount - this.bookingForm.value.advancePaid);
    this.bookingForm.get('balanceAmountTopaid').setValue(this.balanceAmount);
  }
  
  trimToTwoDecimalPlaces(numberToTrim: number): number {
    return Number(numberToTrim.toFixed(2));
  }

  generateUniqueId() {
    if (this.count == 0) {
      this.count++;
      const prefix = 'FT';
      const currentDate = this.datePipe.transform(new Date(), 'MMddyy');
      this.uniqueId = prefix + currentDate + 'B' + this.count;
      this.bookingForm.get('bookingId').setValue(this.uniqueId);
      console.log(this.uniqueId);
    } 
    else {
      this.count++;
      const prefix = 'FT';
      const currentDate = this.datePipe.transform(new Date(), 'MMddyy');
      this.uniqueId = prefix + currentDate + 'B' + this.count;
      this.bookingForm.get('bookingId').setValue(this.uniqueId);
      console.log(this.uniqueId);  }
  }

  checkboxChanged(event: any) {
    console.log(event)
    this.isChecked = event.target.checked;
    console.log(this.isChecked)
  
    if (this.isChecked) {
      this.bookingForm.get('driverWages').setValidators([Validators.required]);
    } else {
      this.bookingForm.get('driverWages').clearValidators();
    }
    this.bookingForm.get('driverWages').updateValueAndValidity();
  }
  
  clear() {
    this.bookingForm.reset();
  }

  addDestination(destination: string) {
    this.tripPlanList = [];
    if (destination) {
      const items = destination.split('\n').map(item => item.trim());
      const validItems = items.filter(item => item !== '');
      this.tripPlanList.push(...validItems);
      console.log(this.tripPlanList);
    }
  }

  removes(index: number) {
    console.log(index)
    if (index >= 0 && index < this.tripPlanList.length) {
      this.tripPlanList.splice(index, 1);

      // Update the textarea content after removing the item
      this.textareaContent = this.tripPlanList.join('\n');
    }
    console.log(this.tripPlanList)
  }


}

