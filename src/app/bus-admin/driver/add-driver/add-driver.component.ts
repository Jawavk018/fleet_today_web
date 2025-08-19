import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../../login/token-storage.service';
import { MatSelectModule } from '@angular/material/select';
import { PhotoService } from 'src/app/providers/photoservice/photoservice.service';
import * as moment from 'moment-timezone'
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-add-driver',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './add-driver.component.html',
  styleUrls: ['./add-driver.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AddDriverComponent implements OnInit {
  @ViewChild('myInput') myInputVariable: ElementRef | any;
mediaSno:any;
  form: any = UntypedFormGroup;
  user: any;
  drivingLicenceTypeList: any;
  driverBloodTypeList: any;
  maxBirthDate:any;

  isError: boolean = false

  isNotAdult: boolean = false;

  year:any;
  yearChange:any;
  


  today = moment().format('yyyy-MM-DD')
  
  maxDate:any;
  isEdit: boolean = false;
  mediaList: any = [];
  // driverProfile: any;
  deleteMediaList:any = [];
  districtList:any = [];

  constructor(
    public location: Location,
    private api: ApiService,
    private router: Router,
    private toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    private photoService: PhotoService,
    public datepipe:DatePipe) {

    this.form = new UntypedFormGroup({
      driverSno: new UntypedFormControl('',),
      orgSno: new UntypedFormControl('',),
      driverName: new UntypedFormControl('', [Validators.required]),
      dob: new UntypedFormControl('', [Validators.required]),
      fatherName: new UntypedFormControl('', [Validators.required]),
      driverMobileNumber: new UntypedFormControl('', [Validators.required,Validators.maxLength(10)]),
      mediaSno: new UntypedFormControl(''),
      licenceNumber: new UntypedFormControl('', [Validators.required]),
      licenceExpiryDate: new UntypedFormControl('', [Validators.required]),
      transportlicenceExpiryDate:new UntypedFormControl('', [Validators.required]),
      currentAddress:new UntypedFormControl('',Validators.compose([Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])),
      whatsappNumber:new UntypedFormControl('',),
      bloodGroupCd:new UntypedFormControl('',),
      drivingLicenceType: new UntypedFormControl('', [Validators.required]),
      activeFlag: new UntypedFormControl(''),
      kmsDrived: new UntypedFormControl(''),
      noOfDaysDrived: new UntypedFormControl(''),
      fuelConsumed: new UntypedFormControl(''),
      mileageDetail: new UntypedFormControl(''),
      currentDistrict:new UntypedFormControl(''),
    });
    this.user = this.tokenStorageService.getUser();

  }

  ngOnInit() {
    this.getDistrict();
    this.getDriverTypeEnum();
    this.getDriverBlooroupEnum();
    let param: any = window.history.state;
    if (param.data) {
      this.mediaSno=param.data?.mediaSno?.mediaSno
      this.isEdit = true;
      this.form.setValue(param.data)
      console.log(this.form.value)
    } else {
      this.isEdit = false;
    }
    this.router.navigate(['add-driver'])


    this.year = new Date().getFullYear()
    this.year = moment().add(20, 'years').format('yyyy-MM-DD');

    this.yearChange = new Date().getFullYear()
    this.yearChange = moment().add(5, 'years').format('yyyy-MM-DD');
    
    let auxDate = this.substractYearsToDate(new Date(), 18);
    this.maxBirthDate = this.getDateFormateForSearch(auxDate);
  }

  substractYearsToDate(auxDate: Date, years: number): Date {
    auxDate.setFullYear(auxDate.getFullYear() - years);
    return auxDate;
  }



  
  getDateFormateForSearch(date: Date): string {
    let year = date.toLocaleDateString('es', { year: 'numeric' });
    let month = date.toLocaleDateString('es', { month: '2-digit' });
    let day = date.toLocaleDateString('es', { day: '2-digit' });
    return `${year}-${month}-${day}`;
  }

  DateChange(){
    let age: number = this.getAge(new Date(this.form.controls['dob'].value));
    console.log(age)
    this.isNotAdult = ((age ? age : 0) < 18);
    if (new Date(this.form.controls['dob'].value) >= new Date()) {
      this.isError = true;
    } else {
      this.isError = false;
    }
  }

  getAge(dateString: any) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  

  save() {
    Object.keys(this.form.value).forEach(key => {
      if (this.form.value[key] === null || this.form.value[key] === '') delete this.form.value[key];
    })

    let body: any = JSON.parse(JSON.stringify(this.form.value));
    body.roleCd = 6;
    body.orgSno = this.user.orgSno;
    body.dob=this.datepipe.transform(this.form.value.dob, 'yyyy-MM-dd');
    body.licenceExpiryDate=this.datepipe.transform(new Date(this.form.value.licenceExpiryDate), 'yyyy-MM-dd');
    body.transportlicenceExpiryDate=this.datepipe.transform(new Date(this.form.value.transportlicenceExpiryDate),'yyyy-MM-dd');


    if (this.form.value.mediaSno) {
      var mediaObj: any = {
        mediaSno: null,
        containerName: 'Profile',
        deleteMediaList: [],
        mediaList: [],
      };
      mediaObj.mediaList.push(this.form.value.mediaSno);
      body.profile = mediaObj;
    }
    delete body.mediaSno;
    body.drivingLicenceType = '{' + body.drivingLicenceType + '}'
    console.log(body);
    this.api.post('8053/api/create_operator_driver', body).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        if (result?.data?.msg != null) {
          this.toastrService.error(result?.data?.msg);
        } else {
          this.toastrService.success('Driver Added Successfully');
          this.form.reset();
          this.location.back();
        }
      }
    });
  }



  public getDriverTypeEnum(): void {
    let param: any = { codeType: 'driving_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.drivingLicenceTypeList = result.data
      } else {

      }
    });
  }

  public getDriverBlooroupEnum(): void {
    let param: any = { codeType: 'blood_group_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.driverBloodTypeList = result.data
      } else {

      }
    });
  }

  update() {

    let body: any = this.form.value;
    body.drivingLicenceType = '{' + body.drivingLicenceType + '}'
    if(this.form.value.mediaSno != null) {
    var mediaObj: any = {
      mediaSno: this.mediaSno || null,
      containerName: 'Profile',
      deleteMediaList: [],
      mediaList: [],
    };
    if(this.deleteMediaList){
      mediaObj.deleteMediaList = this.deleteMediaList;
    }
    mediaObj.mediaList.push(this.form.value.mediaSno);
    body.profile = mediaObj;
  }
  delete body.mediaSno;
  console.log(body);
    this.api.put('8053/api/update_driver', body).subscribe((result: any) => {
      if (result != null && result.data) {
        this.form.reset();
        this.location.back();
      } else {

      }
    });
  }

  changeDriverProfile() {
    $('#pxp-company-cover-choose-file').click();
  }

  onFileChange(e: any, fileFormat: any) {
    console.log(e);
    this.photoService.onFileChange(e, fileFormat, (result: any) => {
      if (result != null && result != undefined) {
        if(this.form.value.mediaSno?.mediaSno){
          this.deleteMediaList.push({mediaDetailSno:this.form.value.mediaSno.mediaDetailSno})
        }
        result[0].isUploaded = null;
        result[0].mediaSize = null;
        result[0].azureId = result[0].fileType;
        // this.driverProfile = result[0];
        this.form.patchValue({
          "mediaSno": result[0]
        });
        console.log(this.form.value)
        this.myInputVariable.nativeElement.value = '';
      }
    }, 1);
  }

  getDistrict() {
    this.districtList = [];
    let params: any = {};
    this.api.get('8054/api/get_district', params).subscribe(result => {
      if (result != null && result.data) {
        this.districtList = result.data;
      }
    });
  }
}
