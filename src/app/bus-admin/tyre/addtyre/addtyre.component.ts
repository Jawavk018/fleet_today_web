import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
// import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TokenStorageService } from '../../login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { PhotoService } from 'src/app/providers/photoservice/photoservice.service';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { QrCodeModule } from 'ng-qrcode';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-addtyre',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, QrCodeModule],
  templateUrl: './addtyre.component.html',
  styleUrls: ['./addtyre.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddtyreComponent implements OnInit {

  @ViewChild('myInput') myInputVariable: ElementRef | any;
  public tyreForm: UntypedFormGroup;
  tyreTypeList: any = [];
  tyreCompanyList: any = [];
  tyreModelList: any = [];
  paymentList: any = [];
  deleteMediaList: any = [];
  tyreSizeList: any = [];
  orgSno: any;
  user: any;
  // location: any;
  tyre: any;
  isCopy: boolean;
  mediaSno: any;


  constructor(
    public location:Location,
    public fb: UntypedFormBuilder,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private photoService: PhotoService,
  ) {
    this.user = this.tokenStorageService.getUser();
  }

  ngOnInit(): void {

    this.getTyreCompany();
    this.getTyreType();
    // this.getTyreModel();
    this.getTyreUsage();
    // this.setValue()

    let param: any = window.history.state;
    this.tyre = param.tyre;
    this.isCopy = param.isCopy;
    this.orgSno = param.orgSno;
    console.log(this.orgSno)

    this.tyreForm = this.fb.group({
      orgSno: this.user.orgSno,
      tyreSno: [null],
      tyreCompanySno: [null, Validators.compose([Validators.required])],
      tyreSerialNumber: [null, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')])],
      tyreSizeSno: [null, Validators.compose([Validators.required])],
      tyrePrice: [null],
      tyreTypeSno: [null, Validators.compose([Validators.required])],
      tyreModel: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z0-9]*')])],
      agencyName: [null],
      incomingDate: [null],
      invoiceMedia: null,
      paymentModeCd: [null],
      invoiceDate: [null],
      isNew: ['true'],
      isTread: ['true'],
      kmDrive: [null],
      noOfTread: [null],
      efficiencyValue: [null],
      isRunning: [null],
      stock: [null],
      activeFlag: [null],

    })





    if (param?.tyre?.tyreSno) {

      this.setValue();
    }
  }

  setValue() {
    let invoiceDate = this.tyre?.invoiceDate != null ? new DatePipe('en-US').transform(new Date(this.tyre.invoiceDate), 'yyyy-MM-dd') : null;
    let incomingDate = this.tyre?.incomingDate != null ? new DatePipe('en-US').transform(new Date(this.tyre.incomingDate), 'yyyy-MM-dd') : null;
    console.log(this.tyre)
    let tyre: any = {
      orgSno: this.user.orgSno,
      tyreSno: this.tyre.tyreSno,
      tyreCompanySno: this.tyre?.tyreCompanySno,
      tyreSerialNumber: this.tyre.tyreSerialNumber,
      invoiceDate: invoiceDate,
      incomingDate: incomingDate,
      tyreSizeSno: this.tyre.tyreSizeSno,
      tyrePrice: this.tyre.tyrePrice,
      tyreTypeSno: this.tyre.tyreTypeSno,
      tyreModel: this.tyre.tyreModel,
      paymentModeCd: this.tyre?.paymentModeCd,
      agencyName: this.tyre?.agencyName,
      isNew: this.tyre?.isNew,
      isTread: this.tyre.isTread,
      isRunning: this.tyre?.isRunning,
      kmDrive: this.tyre?.kmDrive,
      noOfTread: this.tyre?.noOfTread,
      stock: this.tyre?.stock,
      activeFlag: this.tyre?.activeFlag,
      invoiceMedia: this.tyre?.invoiceMedia,
      efficiencyValue: this.tyre?.efficiencyValue,
    }

    console.log((tyre))
    this.tyreForm.setValue(tyre);


  }




  addTyre() {
    let body: any = this.tyreForm.value;
    if (this.tyreForm.value.invoiceMedia) {
      var mediaObj: any = {
        mediaSno: null,
        containerName: 'Bill Upload',
        deleteMediaList: [],
        mediaList: [],
      };
      mediaObj.mediaList.push(this.tyreForm.value.invoiceMedia);
      body.profile = mediaObj;
    }
    delete body.invoiceMedia;
    console.log(body);
    this.api.post('8060/api/insert_tyre', body).subscribe(result => {
      if (result != null && result.data) {
        if (result.data?.msg == 'success') {
          console.log(result);
          this.toastrService.success('Tyre Added Successfully');
          this.tyreForm.reset();
          this.location.back();
          this.router.navigate(['/tyre'])
        } else {
          this.toastrService.error(result.data?.msg);

        }

      }
      else {

      }
    });
  }


  public getTyreType() {
    let param: any = {};
    this.api.get('8054/api/get_tyre_type', param).subscribe(result => {
      if (result != null && result.data) {
        this.tyreTypeList = result.data[0]?.tyreList;
        if (this.tyre?.tyreTypeSno) {
          this.onOptionsSelected(null, this.tyre?.tyreTypeSno);
        }
        console.log(this.tyreTypeList)
      } else {

      }
    });
  }

  public getTyreCompany() {
    let param: any = {};
    this.api.get('8054/api/get_tyre_company', param).subscribe(result => {
      console.log(result);
      if (result != null && result.data) {
        this.tyreCompanyList = result.data;
        console.log(this.tyreCompanyList)
      } else {

      }
    });
  }

  // public getTyreModel() {
  //   let param: any = { codeType: 'tyre_model' };
  //   this.api.get('8052/api/get_enum_names', param).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.tyreModelList = result.data;
  //       console.log(result.data)
  //     } else {

  //     }
  //   });
  // }



  isNewValue() {
    if (this.tyreForm.get('isNew').value == 'false' && this.tyreForm.get('isTread').value == 'true') {
      this.tyreForm.get('kmDrive').setValidators(Validators.required);
      this.tyreForm.get('kmDrive').updateValueAndValidity();
    } else {
      this.tyreForm.get('kmDrive').removeValidators(Validators.required);
      this.tyreForm.get('kmDrive').updateValueAndValidity();
    }
  }

  isTreadValue() {
    if (this.tyreForm.get('isTread').value.toString() == 'false') {
      this.tyreForm.get('noOfTread').setValidators(Validators.required);
      this.tyreForm.get('noOfTread').updateValueAndValidity();
    } else {
      this.tyreForm.get('noOfTread').removeValidators(Validators.required);
      this.tyreForm.get('noOfTread').updateValueAndValidity();
    }
  }

  public getTyreUsage() {
    let param: any = { codeType: 'payment_mode_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        console.log('result.data', result.data)
        this.paymentList = result.data;
      } else {

      }
    });
  }

  billUpload() {
    $('#pxp-company-cover-choose-file').click();
  }

  onFileChange(e: any, fileFormat: any) {
    console.log(e);
    this.photoService.onFileChange(e, fileFormat, (result: any) => {
      if (result != null && result != undefined) {
        if (this.tyreForm.value.invoiceMedia?.mediaSno) {
          this.deleteMediaList.push({ mediaDetailSno: this.tyreForm.value.invoiceMedia.mediaDetailSno })
        }
        result[0].isUploaded = null;
        result[0].mediaSize = null;
        result[0].azureId = result[0].fileType;
        // this.driverProfile = result[0];
        this.tyreForm.patchValue({
          "invoiceMedia": result[0]
        });
        console.log(this.tyreForm.value)
        this.myInputVariable.nativeElement.value = '';
      }
    }, 1);
  }


  updatevehicle() {
    let body: any = this.tyreForm.value;
    if (this.tyreForm.value.invoiceMedia != null) {
      var mediaObj: any = {
        mediaSno: this.tyreForm.value.invoiceMedia.mediaSno,
        containerName: 'Bill Upload',
        deleteMediaList: [],
        mediaList: [],
      };
      if (this.deleteMediaList) {
        mediaObj.deleteMediaList = this.deleteMediaList;
      }
      mediaObj.mediaList.push(this.tyreForm.value.invoiceMedia);
      body.profile = mediaObj;
    }
    delete body.invoiceMedia;
    console.log(body);
    this.api.put('8060/api/update_tyre', body).subscribe((result: any) => {
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('vehicle Updated Successfully');
        // this.tyreForm.reset();
        this.location.back();
        this.router.navigateByUrl('/tyre')
      } else {

      }
    });
  }
  //   onOptionsSelected(value:number){
  //     console.log("the selected value is " + value);
  //     this.tyreSizeList=this.tyreTypeList[value]
  // }
  public onOptionsSelected(event, tyreSizeSno?: any) {
    // this.tyreForm.patchValue({
    //   tyreSizeSno:this.tyreTypeList[data-1]?.tyreSizeList[0]?.tyreSizeSno
    // })
    if (event != null) {
      var data = event.target.value ?? tyreSizeSno;

    } else {
      var data = tyreSizeSno;
    }
    // this.selected = value;
    console.log(data);
    console.log(this.tyreTypeList);

    this.tyreSizeList = this.tyreTypeList[data - 1]?.tyreSizeList;
    console.log(this.tyreSizeList);

  }
}


