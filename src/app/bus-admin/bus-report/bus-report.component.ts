import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { MenuService } from '../../theme/components/menu/menu.service';
import { NgbDatepicker, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { TokenStorageService } from '../login/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PdfGeneratorService } from 'src/app/providers/pdf/pdf.service.spec';
import * as moment from 'moment-timezone';



@Component({
  selector: 'app-bus-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule, ConfirmDialogModule, MaterialModule],
  templateUrl: './bus-report.component.html',
  styleUrls: ['./bus-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class BusReportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  head = [['#', 'Vehicle Number', 'Driver Name', 'Start Time', 'End Time', 'Vehicle Type', 'Driving (Km)', 'Fuel (Li)', 'Mileage']]

  tableData = []
  user: any;
  orgvehicles: any = [];
  driverList: any = [];
  busReportList: any = [];
  searchForm: any = UntypedFormGroup
  isNoRecord: boolean = true;

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  busReportPdfList: any = [];
  today = moment().format('DD-MM-yyyy')


  constructor(private api: ApiService, private tokenStorageService: TokenStorageService,
    private pdfGeneratorService: PdfGeneratorService, public datepipe: DatePipe,
    private fb: UntypedFormBuilder) {
    this.user = this.tokenStorageService.getUser();
    this.searchForm = new UntypedFormGroup({
      vehicleSno: new UntypedFormControl(null),
      fromDate: new UntypedFormControl(null),
      toDate: new UntypedFormControl(null),
    })

    this.limit = this.itemPerPage.toString().split(',')[0];
  }
  ngOnInit() {
    this.getOrgVehicle();
    this.goToSearch();
    this.getBusCount();
  }

  getReportPdf() {
    Object.keys(this.searchForm.value).forEach(key => {
      if (this.searchForm.value[key] === null) delete this.searchForm.value[key];
    })
    let params: any = {};
    params = this.searchForm.value;
    params.orgSno = this.user.orgSno;
    params.skip=0;
    params.limit=5000;
    this.busReportPdfList = [];
    this.tableData=[];
    this.isNoRecord = false;
    console.log(params)
    this.api.get("8053/api/get_bus_report", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.busReportPdfList = result.data;
            console.log(this.busReportList);
            for (let i = 0; i < this.busReportPdfList.length; i++) {
              this.tableData.push([i + 1, this.busReportPdfList[i].vehicleRegNumber,
              this.busReportPdfList[i].driverName, this.datepipe.transform(this.busReportPdfList[i].startTime, 'dd-MM-yyyy'),
              this.datepipe.transform(this.busReportPdfList[i].endTime, 'dd-MM-yyyy'), this.busReportPdfList[i].drivingType,
              this.busReportPdfList[i].totalDrivingKm, parseFloat(this.busReportPdfList[i].fuelQty).toFixed(2), parseFloat(this.busReportPdfList[i].mileage).toFixed(2)])
            }
            this.createPdf();
          } else {
            this.busReportPdfList = [];
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

  createPdf() {
    var doc = new jsPDF();
    const headerStyle = {
      fillColor: 'blue', // Set the background color
      textColor: 'white',
      fontSize: 8,
      fontStyle: 'bold', // Header font style (optional)
      // Set the text color
    };
    const bodyStyles = {
      fontSize: 8, // Set the font size for the body cells
    };
    // const tableFooter = ['Total Fuel', this.getFuel(), 'Total Amount', '120'];

    doc.text('Fleet Today Vehicle-Mileage-Report', 11, 8);
    doc.setFontSize(11);
    doc.setTextColor(100);


    (doc as any).autoTable({
      head: this.head,
      body: this.tableData,
      // foot: [tableFooter], // Add footer
      headStyles: headerStyle,
      bodyStyles: bodyStyles,
      theme: 'plain',
      didDrawCell: data => {
        console.log(data.column.index)
      }
    })
    const horizontalSpace = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; // Adjust the number of spaces

    const footerText = `Total Fuel: ${this.getFuel(this.busReportPdfList)} Li ${horizontalSpace} Total Driving: ${this.getDriving(this.busReportPdfList)} Km ${horizontalSpace} Avg Mileage: ${this.getMileage(this.busReportPdfList)} Km`;
    doc.text(footerText, 12, 280);
    // doc.text(footerText, doc.autoTableEndPosY() + 10, 15);


    // below line for Open PDF document in new tab
    doc.output('dataurlnewwindow')


    // below line for Download PDF document  
    doc.save(this.today + '  Vehicle-Mileage-Report.pdf');
  }
  getFuel(data: any) {
    var totalFuel: any = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].fuelQty) {
        totalFuel = totalFuel + data[i].fuelQty;
      }
    }
    return parseFloat(totalFuel).toFixed(2).toString();
  }
  getMileage(data:any){
    var totalMileage: any = 0;
    var count:any=0;
    var mileage:any;
    for (let i = 0; i < data.length; i++) {
      if (data[i].mileage) {
        totalMileage = totalMileage + data[i].mileage;
        count=count+1;
      }
    }
    mileage=totalMileage/count;
    return parseFloat(mileage).toFixed(2).toString();
  }
  getDriving(data) {
    var totalDriving: any = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].totalDrivingKm) {
        totalDriving = totalDriving + data[i].totalDrivingKm;
      }
    }
    return totalDriving.toString();
  }
  public convertObjectToDate(dateObj) {
    let month = dateObj.month > 10 ? dateObj.month : '0' + dateObj.month;
    let date: any = dateObj.year + '-' + month + '-' + dateObj.day;
    return date;
  }
  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_vehicles_and_drivers", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.driverList = result?.data[0]?.driverList
        this.orgvehicles = result?.data[0]?.busList;

      } else {
      }
    });
  }

  goToSearch() {
    this.getBusCount();
    Object.keys(this.searchForm.value).forEach(key => {
      if (this.searchForm.value[key] === null) delete this.searchForm.value[key];
    })
    let params: any = {};
    params = this.searchForm.value;
    params.orgSno = this.user.orgSno;
    params.skip = this.skip
    params.limit = this.limit

    this.busReportList = [];
    this.isNoRecord = false;
    console.log(params)
    this.api.get("8053/api/get_bus_report", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.busReportList = result.data;
            console.log(this.busReportList)
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

  getBusCount() {
    Object.keys(this.searchForm.value).forEach(key => {
      if (this.searchForm.value[key] === null) delete this.searchForm.value[key];
    })
    let params: any = {};
    params = this.searchForm.value;
    params.orgSno = this.user.orgSno;
    this.isNoRecord = false;
    this.api.get("8053/api/get_bus_report_count", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
            // this.goToSearch();
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

  getMoreBus(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.goToSearch();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.goToSearch();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.busReportList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.busReportList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.goToSearch();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }


}
