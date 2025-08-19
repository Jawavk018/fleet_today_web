import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { TripCalendarComponent } from '../trip-calendar/trip-calendar.component';

@Component({
  selector: 'app-reminder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,TripCalendarComponent],
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.scss']
})
export class ReminderComponent implements OnInit {
  tripList: any = [];
  ContractCarrierVehicleList: any = [];
  vehicleSno: any;
  user: any;
  kycMsg: any;
  orgvehicles: any = [];
  selectedBooking: any;

  @ViewChild(TripCalendarComponent) tripCalendar: TripCalendarComponent;


  constructor(private api: ApiService,
    private tokenStorage: TokenStorageService,
    public toastrService: ToastrService,
    public modalService: NgbModal) {
    this.user = this.tokenStorage.getUser();
  }

  ngOnInit(): void {
    this.getOrgVehicle();
  }

  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_org_contract_vehicle", params).subscribe(result => {
      this.kycMsg = result
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.orgvehicles = result.data;
        this.selectedBooking=this.orgvehicles[0]
        console.log(this.orgvehicles)
        this.getBooking(this.orgvehicles[0].vehicleSno);
      } else {
      }
    });
  }
  
  getBooking(vehicleSno: number) {
    this.tripList =[];
    let param = { orgSno: this.user.orgSno, activeFlag: true, vehicleSno: vehicleSno }
    this.api.get('8058/api/get_booking', param).subscribe(result => {
      if (result != null && result.data) {
        this.tripList = result.data;
        console.log(this.tripList);
        
      }
      setTimeout(() => {
        this.tripCalendar.change();
      }, 1000)
    });
  }

  displayRoute(i: number) {
    this.getBooking(this.orgvehicles[i].vehicleSno);
  }

  listClick(event, newValue) {
    this.selectedBooking = newValue;
    console.log(this.selectedBooking)
  } 

}
