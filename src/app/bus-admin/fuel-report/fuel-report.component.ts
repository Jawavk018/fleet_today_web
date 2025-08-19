import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { MenuService } from '../../theme/components/menu/menu.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { TokenStorageService } from '../login/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-fuel-report',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgbDatepickerModule,ConfirmDialogModule,MaterialModule],
  templateUrl: './fuel-report.component.html',
  styleUrls: ['./fuel-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})

export class FuelReportComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  head = [['#', 'Vehicle Number', 'Driver Name', 'Vehicle Type', 'Odo Meter', 'Filled Date', 'Price Per Lt','Fuel Amount']]
  fuelReportPdfList = [];
  tableData:any=[];
  user: any;
  orgvehicles: any = [];
  driverList: any = [];
  busList: any = [];
  form: UntypedFormGroup;
  fuelReportList: any = [];
  actionMode: any;
  action: any;
  totalList: any;
  isNoRecord: boolean = true;

  today = moment().format('DD-MM-yyyy')
  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50];
  skip: number = 0;
  limit: number = 0;
  count:number=0;

  constructor(
    private api: ApiService, 
    private tokenStorageService: TokenStorageService, 
    private fb: UntypedFormBuilder,public datepipe: DatePipe) {

    this.user = this.tokenStorageService.getUser();
    this.form = this.fb.group({
      vehicleSno: [null],
      driverSno: [null],
      filledDate: [null],
      toDate : [null]
    });

    this.limit = this.itemPerPage.toString().split(',')[0];

  }
  
  ngOnInit() {
    this.getVehiclesAndDrivers();
    
    this.getFuelCount();
  }

  public  convertObjectToDate(dateObj) {
    let month = dateObj.month > 10 ? dateObj.month : '0' + dateObj.month;
    let date: any = dateObj.year + '-' + month + '-' + dateObj.day;
    return date;
  }
  public  convertFilObjectToDate(dateObj) {
    let month = dateObj.month > 10 ? dateObj.month : '0' + dateObj.month;
    let date: any = dateObj.year + '-' + month + '-' + dateObj.day;
    return date;
  }

  public openModal(i, modalContent, mode) {
    this.actionMode = mode;
    if (modalContent && mode == 'v') {
      this.action = "View Contract Details..";
    }
  }

  getVehiclesAndDrivers() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_vehicles_and_drivers", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.driverList = result.data[0].driverList;
        this.busList = result.data[0].busList;
      } else {
      }
    });
  }

  getReportPdf() {
    Object.keys(this.form.value).forEach(key => {
      if (this.form.value[key] === null) delete this.form.value[key];
    })
    let params: any = {};
    params = this.form.value;
    params.orgSno = this.user.orgSno;
    params.skip=0;
    params.limit=5000;
    this.fuelReportPdfList = [];
    this.tableData=[];
    this.isNoRecord = false;
    this.api.get("8053/api/get_fuel_report", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.fuelReportPdfList = result.data;
            console.log(this.fuelReportPdfList);
            for (let i = 0; i < this.fuelReportPdfList.length; i++) {
              let pricePerLt=(parseFloat(this.fuelReportPdfList[i].FuelList.fuelAmount)/parseFloat(this.fuelReportPdfList[i].FuelList.fuelQuantity));
              this.tableData.push([i + 1, this.fuelReportPdfList[i].FuelList.vehicleRegNumber,this.fuelReportPdfList[i].FuelList.driverName,
              this.fuelReportPdfList[i].FuelList.drivingType,this.fuelReportPdfList[i].FuelList.odoMeterValue,
              this.datepipe.transform(this.fuelReportPdfList[i].FuelList.filledDate[0], 'dd-MM-yyyy'),pricePerLt.toFixed(2), parseFloat(this.fuelReportPdfList[i].FuelList.fuelAmount).toFixed(2)])
            }
            this.createPdf();
          } else {
            this.fuelReportPdfList = [];
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

    doc.text('Fleet Today Fuel-Report  '+this.today, 11, 8);
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
    const horizontalSpace = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; // Adjust the number of spaces

    const footerText = `Total Fuel: ${this.getFuelValue(this.fuelReportPdfList)} Li ${horizontalSpace} ${horizontalSpace} Total Amount: Rs ${this.getAmount(this.fuelReportPdfList)} `;
    doc.text(footerText, 12, 280);
    doc.output('dataurlnewwindow');
    doc.save(this.today + '  Fuel-Report.pdf');
  }
  getFuelValue(data:any){
    var fuel:any=0;
    for(let i=0;i<data.length;i++){
      if(data[i].FuelList.fuelQuantity){
        fuel=fuel+data[i].FuelList.fuelQuantity;
      }
    }
    return parseFloat(fuel).toFixed(2).toString();
  }

  getAmount(data:any){
    var amount:any=0;
    for(let i=0;i<data.length;i++){
      if(data[i].FuelList?.fuelAmount){
        amount=amount+data[i].FuelList.fuelAmount;
      }
    }
    return parseFloat(amount).toFixed(2).toString();
  }
  getFuelRport() {
   
    Object.keys(this.form.value).forEach(key => {
          if (this.form.value[key] === null) delete this.form.value[key];
        });
    let params: any = {};
    params = this.form.value;
    params.orgSno=this.user.orgSno;
    params.skip = this.skip
    params.limit = this.limit
    
    this.fuelReportList = [];
    this.isNoRecord = false;
    console.log(params)
    this.api.get("8053/api/get_fuel_report", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.fuelReportList = result.data;
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

  getFuelCount(){
    Object.keys(this.form.value).forEach(key => {
      if (this.form.value[key] === null) delete this.form.value[key];
    });
let params: any = {};
params = this.form.value;
params.orgSno=this.user.orgSno;
    this.isNoRecord = false;
    this.api.get("8053/api/get_fuel_report_count", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.getFuelRport();

            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
         
          }else{
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

  getMoreFuel(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getFuelRport();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getFuelRport();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.fuelReportList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.fuelReportList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getFuelRport();
    }
    // if (this.fuelReportList.length <= this.pageIndex && isFirst) {
    //   this.getFuelRport();
    // }
  }

}
