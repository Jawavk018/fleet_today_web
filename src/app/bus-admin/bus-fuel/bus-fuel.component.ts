import { Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { Gallery, GalleryItem, GalleryModule, ImageSize, ThumbnailsPosition,ImageItem } from 'ng-gallery';
import { ImageViewerModule } from '@hallysonh/ngx-imageviewer';
import { TokenStorageService } from '../login/token-storage.service';
import { Lightbox, LightboxModule } from 'ng-gallery/lightbox';

@Component({
  selector: 'app-bus-fuel',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MaterialModule,
    GalleryModule,
    ImageViewerModule,
    LightboxModule],
  templateUrl: './bus-fuel.component.html',
  styleUrls: ['./bus-fuel.component.scss']
})
export class BusFuelComponent implements OnInit {
  user: any;
  orgvehicles: any = [];
  driverList: any = [];
  fuelList: any = [];
  isAdmin: boolean = false;
  searchForm: any = FormGroup;
  isLoad: boolean = false;
  isDisabled: boolean = false;
  items: GalleryItem[];
  data: any = [];
  imageData: any = [];
  mediaList: any = [];
  @ViewChild("itemTemplate", { static: true }) itemTemplate: TemplateRef<any>;

  constructor(
    private api: ApiService, 
    private tokenStorageService: TokenStorageService,
    public gallery: Gallery, 
    public lightbox: Lightbox,
    private fb: FormBuilder) {

      this.user = this.tokenStorageService.getUser();
      this.searchForm = new FormGroup({
      vehicleSno: new FormControl(null),
      driverSno: new FormControl(null),
      date: new FormControl(null)
    })

  }

  ngOnInit(): void {
    this.getFuelInfo();
    this.getOrgVehicle();

    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/busFuel');
      if (index != -1) {
        this.isAdmin = this.user?.menus[index].isAdmin;
      }
      
  }

  getFuelInfo() {

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
    this.api.get("8053/api/get_fuel_info", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.fuelList = result.data;
        console.log(this.fuelList)
        for (let i in this.fuelList) {
          this.fuelList[i].odoMeterValue = parseInt(this.fuelList[i].odoMeterValue);
          if (this.fuelList[i]?.odoMeterMedia) {
            this.fuelList[i].imageData = [{ srcUrl: this.fuelList[i]?.odoMeterMedia?.mediaUrl }]
          }
          if (this.fuelList[i]?.fuelMedia){
            this.fuelList[i].imageData = [{ srcUrl: this.fuelList[i]?.fuelMedia?.mediaUrl }]
          }
          if (this.fuelList[i]?.tankMedia){
            this.fuelList[i].imageData = [{ srcUrl: this.fuelList[i]?.tankMedia?.mediaUrl }]
          }
          if(this.fuelList[i]?.odoMeterMedia && this.fuelList[i]?.fuelMedia){
            this.fuelList[i].imageData = [{ srcUrl: this.fuelList[i]?.odoMeterMedia?.mediaUrl }, { srcUrl: this.fuelList[i]?.fuelMedia?.mediaUrl }, { srcUrl: this.fuelList[i]?.tankMedia?.mediaUrl }]
          }
        }
      } else {
        this.fuelList = []
      }
      console.log(this.fuelList);
    });
  }

  goToAccept(i: number) {
    console.log(this.fuelList[i]);
    console.log(parseInt(this.fuelList[i]?.odoMeterValue));

    let body: any = {};
    body.fuelSno = this.fuelList[i].fuelSno;
    body.fuelQuantity = this.fuelList[i].fuelQuantity;
    body.pricePerLtr = this.fuelList[i].pricePerLtr;
    body.odoMetervalue = parseInt(this.fuelList[i]?.odoMeterValue);
    body.fuelAmount = (this.fuelList[i].fuelQuantity * this.fuelList[i].pricePerLtr);
    body.acceptStatus=true;
    body.vehicleSno=this.fuelList[i].vehicleSno;
    body.filledDate=this.fuelList[i].filledDate;
    body.is_filled=this.fuelList[i].isFilled;

    this.isLoad = true;
    this.isDisabled = true;
    console.log(body)
    this.api.put('8053/api/update_org_fuel', body).subscribe((result: any) => {
      this.isLoad = false;
      this.isDisabled = false;
      if (result != null && result.data) {
        this.getFuelInfo();
      }
    });
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

  imageGallery(i: number) {
  this.items = this.fuelList[i].imageData.map(item => 
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

}

