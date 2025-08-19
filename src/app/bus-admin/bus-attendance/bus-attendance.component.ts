import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { ImageViewerModule } from '@hallysonh/ngx-imageviewer';

import {
  Gallery,
  GalleryItem,
  ThumbnailsPosition,
  ImageSize,
  GalleryModule,
  ImageItem
} from "ng-gallery";
import { Lightbox, LightboxModule } from "ng-gallery/lightbox";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { TokenStorageService } from '../login/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bus-attendance',
  standalone: true,
  imports: [CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MultiselectDropdownModule,
    NgxPaginationModule,
    PipesModule,
    NgxDatatableModule,
    ConfirmDialogModule,
    GalleryModule,
    ImageViewerModule,
    LightboxModule,
    MaterialModule
  ],
  templateUrl: './bus-attendance.component.html',
  styleUrls: ['./bus-attendance.component.scss']
})
export class BusAttendanceComponent implements OnInit {

  user: any;
  orgvehicles: any = [];
  driverList: any = [];
  attendanceList: any = [];
  searchForm: any = FormGroup;
  isAdmin: boolean = false;
  isLoad: boolean = false;
  isDisabled: boolean = false;
  items: GalleryItem[];
  data: any = [];
  imageData: any = [];
  mediaList: any = [];
  map: any = [];
  @ViewChild("itemTemplate", { static: true }) itemTemplate: TemplateRef<any>;

  constructor(
    private router:Router,
    private api: ApiService,
    private tokenStorageService: TokenStorageService,
    private toastrService: ToastrService,
    public gallery: Gallery,
    public lightbox: Lightbox,
    private fb: UntypedFormBuilder) {

    this.user = this.tokenStorageService.getUser();
    this.searchForm = new FormGroup({
      vehicleSno: new FormControl(null),
      driverSno: new FormControl(null),
      date: new FormControl(null),
    });

  }

  ngOnInit(): void {
    this.getAttendanceInfo();
    this.getOrgVehicle();
    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/busAttendance');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }
    
  }

  getAttendanceInfo() {
    let params: any = this.searchForm.value;
    params.orgSno = this.user.orgSno;
    if (this.searchForm.value.vehicleSno == 'null') {
      delete this.searchForm.value.vehicleSno;
    }
    if (this.searchForm.value.driverSno == 'null') {
      delete this.searchForm.value.driverSno;
    }
    Object.keys(this.searchForm.value).forEach(key => {
      if (this.searchForm.value[key] === null) delete this.searchForm.value[key];
    })
    if (this.searchForm.value.date && this.searchForm.value.date != undefined) {
      // let date = this.api.dateToSavingStringFormatConvertion(this.searchForm.value.date)
      // delete params.date;
      params.date = this.searchForm.value.date
    }
    this.api.get("8055/api/get_attendance_info", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.attendanceList = result.data;
        for (let i in this.attendanceList) {
          if (this.attendanceList[i]?.startMedia) {
            this.attendanceList[i].imageData = [{ srcUrl: this.attendanceList[i]?.startMedia[0]?.mediaUrl }]
          }
          if (this.attendanceList[i]?.endMedia) {
            this.attendanceList[i].imageData = [{ srcUrl: this.attendanceList[i]?.endMedia[0]?.mediaUrl }]
          }
          if (this.attendanceList[i]?.startMedia && this.attendanceList[i]?.endMedia) {
            console.log('inside BOTH')
            this.attendanceList[i].imageData = [{ srcUrl: this.attendanceList[i]?.startMedia[0]?.mediaUrl }, { srcUrl: this.attendanceList[i]?.endMedia[0]?.mediaUrl }]
          }
        }
      } else {
        this.attendanceList = []
      }
    });
  }

  goToAccept(i: number) {
    let body: any = {};
    console.log(this.attendanceList[i])
    body.vehicleSno = this.attendanceList[i].vehicleSno;
    body.driverAttendanceSno = this.attendanceList[i].driverAttendanceSno;
    body.startValue = this.attendanceList[i].startValue;
    body.endValue = this.attendanceList[i].endValue;
    body.endTime = this.attendanceList[i].endTime;
    body.acceptStatus = true;
    body.attendanceStatusCd = 29;
    this.isLoad = true;
    this.isDisabled = true;
    console.log(body)
    this.api.put('8053/api/update_org_attendance', body).subscribe((result: any) => {
      this.isLoad = false;
      this.isDisabled = false;
      if (result != null && result.data) {
        this.getAttendanceInfo();
      }
    });
  }

  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno};
    this.api.get("8053/api/get_vehicles_and_drivers", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.driverList = result?.data[0]?.driverList
        this.orgvehicles = result?.data[0]?.busList;
      } else {
      }
    });
  }

  imageGallery(i: number) {
    this.items = this.attendanceList[i].imageData.map(item => 
      new ImageItem({ src: item.srcUrl, thumb: item.srcUrl })
    );
    this.withCustomGalleryConfig();
  }

  withCustomGalleryConfig() {
    const lightboxGalleryRef = this.gallery.ref('lightbox');
    lightboxGalleryRef.setConfig({
      imageSize: ImageSize.Cover,
      thumbPosition: ThumbnailsPosition.Top,
      gestures: false
    });
    lightboxGalleryRef.load(this.items);
  }

  goToManualAttendance(){
    this.router.navigate(['/addOperatorAttendance'])
  }
}
