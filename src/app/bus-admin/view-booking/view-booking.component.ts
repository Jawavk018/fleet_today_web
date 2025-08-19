import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './view-booking.component.html',
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent implements OnInit {
  tripList: any = [];
  ContractCarrierVehicleList: any = [];
  vehicleSno: any;
  isNoData: boolean;
  public modalRef: NgbModalRef;
  selectedBooking: any;
  user: any;
  orgvehicles: any = [];
  kycMsg: any;
  isAdmin: boolean;

  bookingCount: any;
  futureTripList: any = [];

  head = [['#', 'Vehicle Number', 'Start Date', 'End Date', 'No Of Days Booked', 'Driver Batta']]
  tableData: any = [];
  today = moment().format('DD-MM-yyyy')
  isNoRecord: boolean = true;
  tripPdfList: any = [];
  trip_places = [['#', 'Trip Places', 'Total Amount', 'Advance Paid', 'Balance Amount']]
  tripData: any = [];
  orgStatusCd: any;

  constructor(private router: Router, private api: ApiService,
    private tokenStorage: TokenStorageService,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private fb: UntypedFormBuilder,
    public datepipe: DatePipe,) {
    this.user = this.tokenStorage.getUser();
  }

  ngOnInit(): void {

    this.getBooking();
    this.getOrgVehicle();
    this.getOrganization();

    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/view-booking');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }
    console.log('isAdmin', this.isAdmin)

    let param: any = window.history.state;
    console.log(param.name)
    this.bookingCount = param.name;
  }

  // getBooking() {
  //   let param = {orgSno: this.user.orgSno,activeFlag: true}
  //   this.api.get('8058/api/get_booking', param).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.tripList = result.data;
  //         console.log(this.tripList);
  //       }
  //       else{
  //       }
  //   });
  // }

  getBooking() {
    let param = { orgSno: this.user.orgSno, activeFlag: true }
    this.api.get('8058/api/get_booking', param).subscribe(result => {
      if (result != null && result.data) {
        this.tripList = result.data;
        if (this.bookingCount == 'Total Bookings') {
          for (let source of this.tripList) {
            if (new Date(source.endDate) >= new Date()) {
              this.futureTripList.push(source);
              this.tripList = this.futureTripList
              console.log(this.tripList);
            }
          }
        } else {
          this.tripList = result.data;
          console.log(this.tripList);
        }
      }
      else {
      }
    });
  }

  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_org_contract_vehicle", params).subscribe(result => {
      this.kycMsg = result
      console.log(result)
      if (result.data != null && result.data) {
        this.orgvehicles = result.data;
        console.log(this.orgvehicles)
      } else {
      }
    });
  }

  deleteBooking(i: any) {
    // let confirmText = "Are you sure to Delete ? ";
    // this.confirmDialogService.confirmThis(confirmText, () => {
    let param: any = { bookingSno: this.tripList[i]?.bookingSno, activeFlag: false };
    this.api.put('8058/api/delete_booking', param).subscribe((result: any) => {
      if (result != null && result.data) {
        this.tripList.splice(i, 1);
      }
    })
    if (this.tripList.length == 0) {
      this.isNoData = true;
    }
    this.toastrService.success("booking deleted successfully");
    // }, () => {
    // });
  }

  getOrganization() {
    let params = { orgSno: this.user?.orgSno };
    this.api.get('8053/api/get_org', params).subscribe(result => {
      if (result != null && result.data) {
        console.log(result)
        this.orgStatusCd = result.data[0].orgStatusCd;
        this.user.orgStatusCd = this.orgStatusCd;
        this.tokenStorage.saveUser(this.user)

      } else {
      }
    })
  }

  openModal(index: any) {
    this.selectedBooking = this.tripList[index];
  }


  goToUpdateTrip(i?: any, isCopy?: string){
    let navigationExtras: any = {
      state: {
        trip: this.tripList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/edit-booking'], navigationExtras);

  }

  
  // goToAddTrip() {
  //   if (this.user.orgSno) {
  //     if (this.user.orgStatusCd == 19) {
  //       let navigationExtras: any = {
  //         state: {
  //           orgSno: this.user.orgSno,
  //           showVehicle : this.tripList.length == 0 ? true : false
  //         }
  //       };
  //       this.router.navigateByUrl('/add-booking', navigationExtras);
  //     } else {
  //       this.toastrService.info("your organization KYC is not verified");
  //     }
  //   } else {
  //     this.toastrService.info("Register your organization");
  //   }
  // }

  goToAddTrip() {
    console.log(this.user.orgStatusCd)
    if (this.user.orgSno) {
      if (this.user.orgStatusCd == 19) {
        if (this.orgvehicles.length > 0) {
          let navigationExtras: any = {
            state: {
              orgSno: this.user.orgSno,
              showVehicle: this.tripList.length == 0 ? true : false,
              count: this.tripList.length > 0 ? this.tripList[0]['count'] : 0,
            }
          };
          this.router.navigateByUrl('/add-booking', navigationExtras);

        } else {
          this.toastrService.info("Your not Register Contract Carriage vehicle");
        }
      } else {
        this.toastrService.info("Your Organization KYC is not verified");
      }
    } else {
      this.toastrService.info("Register your organization");
    }
  }

  getReportPdf(i: any) {
    console.log(i)
    let params = { orgSno: this.user.orgSno, activeFlag: true, bookingSno: this.tripList[i]?.bookingSno }
    console.log(params)
    this.tripList = [];
    this.tableData = [];
    this.tripData = [];
    this.isNoRecord = false;
    this.api.get("8058/api/get_booking", params).subscribe(
      (result) => {
        console.log(result);
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.tripPdfList = result.data;
            console.log(this.tripPdfList);
            this.tableData.push([i + 1, this.tripPdfList[0].vehicleRegNumber,
            this.datepipe.transform(this.tripPdfList[0].startDate, 'dd-MM-yyyy'),
            this.datepipe.transform(this.tripPdfList[0].endDate, 'dd-MM-yyyy'),
            this.tripPdfList[0].noOfDaysBooked,
            this.tripPdfList[0].driverWages != null ?this.tripPdfList[0].driverWages : '---',
            ])
            this.tripData.push([i+1, this.tripPdfList[0].tripPlan, this.tripPdfList[0].totalBookingAmount,
              this.tripPdfList[0].advancePaid, this.tripPdfList[0].balanceAmountTopaid])
            console.log(this.tripPdfList)

            this.createPdf();
          } else {
            this.tripPdfList = [];
            this.isNoRecord = true;
          }
        } else {
        }
      },
      (err) => {
      }
    );
    this.getBooking();
  }

  
  createPdf(){
    var doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;    
  // Calculate the X position for centering text
  const centerX = pageWidth / 2.3;
  const centerY = pageWidth / 2.5;

  const headerStyle = {
    fillColor: 'blue',
    textColor: 'white',
    fontStyle: 'bold',
  };
  const bodyStyles = {
    fontSize: 10, 
  };

  doc.text('INVOICE', centerX, 15); // Centered "INVOICE" text
  doc.setFontSize(10);
  doc.setTextColor(100);
  
  doc.setFontSize(16); // You can adjust the size as needed
  doc.text(`${this.tripPdfList[0].companyName}`, centerY, 25);
  doc.setFontSize(10); // Reset font size to the default
  doc.setTextColor(100);

  // doc.setFillColor(0, 0, 255); // Set the fill color to blue
  doc.setTextColor(0, 0, 255); 
  doc.text('Bill from :', 15, 35);
  doc.setTextColor(0, 0, 0);
  doc.text(`${this.tripPdfList[0].companyName}`, 15, 40);
  doc.text(`${this.tripPdfList[0].address['addressLine1']},`, 15, 45);
  doc.text(`${this.tripPdfList[0].address['city']}, ${this.tripPdfList[0].address['district']},`, 15, 50);
  doc.text(`${this.tripPdfList[0].address['state']}, ${this.tripPdfList[0].address['pincode']}`, 15, 55);
  doc.text(`${this.user['mobileNumber']}`, 15, 60);

  doc.setTextColor(0, 0, 255); 
  doc.text('Bill to :', 80, 35);
  doc.setTextColor(0, 0, 0);
  const customerName = `${this.tripPdfList[0].customerName}`;
  doc.text(customerName, 80, 40);
  const customerAddress = `${this.tripPdfList[0].customerAddress}`;
  doc.text(customerAddress, 80, 45);
  const mobile = `${this.tripPdfList[0].contactNumber}`;
  doc.text(mobile, 80, 50);

  const bookingId = `INVOICE NO : ${this.tripPdfList[0].bookingId}`;
  doc.text(bookingId, 150, 35);

  const currentDate = `INVOICE Date: ${this.datepipe.transform(this.tripPdfList[0].createdOn, 'dd-MM-yyyy')}`;
  doc.text(currentDate, 150, 40);

  if(this.tripPdfList[0].tollParkingIncludes == true){
    doc.text(`* Toll and Parking Extra `, 15, 100);
  }
  if(this.tripPdfList[0].driverWagesIncludes == true){
  doc.text(`* Driver Batta Extra `, 15, 105);
  }

  // const total = `Total Amount     :  ${this.tripPdfList[0].totalBookingAmount}`;
  // doc.text(total, 150, 140);
  // const advanceAmount = `Advance Paid     : ${this.tripPdfList[0].advancePaid}`;
  // doc.text(advanceAmount, 150, 145);
  // const balanceAmount = `Balance Amount : ${this.tripPdfList[0].balanceAmountTopaid}`;
  // doc.text(balanceAmount, 150, 150);

  // const tripPlan = `Trip Plan: \n${this.tripPdfList[0].tripPlan}`;
  // doc.text(tripPlan, 150, 160);

  (doc as any).autoTable({
    head: this.head,
    body: this.tableData,
    headStyles: headerStyle,
    bodyStyles: bodyStyles,
    theme: 'plain',
    didDrawCell: data => {
      console.log(data.column.index);
    },
    startY: 70, 
  });

  (doc as any).autoTable({
    head: this.trip_places,
    body: this.tripData,
    headStyles: headerStyle,
    bodyStyles: bodyStyles,
    theme: 'plain',
    didDrawCell: data => {
      console.log(data.column.index);
    },
    startY: 110, 
  });

  doc.output('dataurlnewwindow');
  doc.save(this.today + '  Booking-Invoice.pdf');
  }


}

