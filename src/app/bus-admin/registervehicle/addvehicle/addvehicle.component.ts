import { Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PhotoService } from 'src/app/providers/photoservice/photoservice.service';
import { RouteCategory } from '../../route/route.model';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { QrCodeModule } from 'ng-qrcode';
import { TokenStorageService } from '../../login/token-storage.service';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
// import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

declare var $: any;

@Component({
  selector: 'app-addvehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, QrCodeModule, ConfirmDialogModule],
  templateUrl: './addvehicle.component.html',
  styleUrls: ['./addvehicle.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AddvehicleComponent implements OnInit {
  value = '';
  model: NgbDateStruct;
  public form: FormGroup;
  deleteMediaList: any = [];

  vehicle: any;
  operator: any;
  vehicleList: any = [];
  isCopy: boolean;
  today = new Date();
  removeUserList: any = [];
  removeRouteList: any = [];
  orgSno: any;
  isLoad: boolean = false;
  showVehicle: boolean;
  user: any;
  vehicleTypeList: any = [];
  fuelTypeList: any = [];
  closeTimer: any;
  operatorList: any = [];
  media: any = [];
  bannerMedia: any = [];
  Districts: any = [];
  States: any = [];
  stateSno: 1;
  OthersList: any = [];
  vehicleTypes: any;
  videoTypes: any = [];
  audioTypes: any = [];
  coolTypes: any = [];
  seatTypes: any = [];
  busSusType: any = [];
  deletePassList: any = [];
  authUser: any;
  drivingType: any = [];
  wheelType: any = [];
  accountType: any = [];
  dateYesterday = moment().subtract(1, 'days').format('yyyy-MM-DD');
  interval: any;
  vehicleMakeList: String;
  dueTypeList: any = [];
  remainderTypeList: any = [];
  dateList: any = [];
  loanDate: any;
  due: any = [];
  loanDetails: FormGroup;
  selectLoanIndex: any;
  deleteLoanList: any = [];

  fuelNormList: any = [];
  public action: string = "";
  public actionMode: string = "";
  public records: RouteCategory[];
  public record: RouteCategory;
  public modalRef: NgbModalRef;
  // viaLists: any = [];
  sourceCities: any = [];
  kycMsg: any;
  orgvehiclesList: any = [];
  busList: any = [];
  eventList: any = [];
  deleteList: any = [];
  myOptions: IMultiSelectOption[] | any = [];
  destCities: any = [];
  cities: any = [];
  tyreType: any = [];
  tyreSize: any = [];
  publicAddressingSystemTypes: any = [];
  lightingSystemTypes: any = [];
  tyreCountList: any = [];
  isPermit: boolean = false;
  dueDate: any;
  tyreTypeList: any = [];
  tyreSizeList: any = [];
  // video:any;
  currentSlideIndex: number = 1;
  public tollDetails: FormGroup;
  remainderTypes: any = [];
  passDetailList: any = [];
  selectTollIndex: any;
  @ViewChild('myModalClose') modalClose;
  @ViewChild('myModalClose1') modalClose1;
  @ViewChild('myInput') myInputVariable: ElementRef | any;
  @ViewChild('exampleModals1') exampleModals1?: ElementRef | any;
  @ViewChild('images') images: ElementRef | any;
  @ViewChild('videos') videos: ElementRef | any;
  data: any;

  isFcExpireValid: boolean = false;
  isInsuranceValid: boolean = false;
  isTaxValid: boolean = false;
  isPermitValid: boolean = false;
  isPollutionValid: boolean = false;


  startDate: Date;
  endDate: Date;
  lastDate: Date;

  selectedItem: string | null = null;


  constructor(
    public fb: FormBuilder,
    private api: ApiService,
    private PhotoService: PhotoService,
    private router: Router,
    public toastrService: ToastrService,
    private datepipe: DatePipe,
    public location: Location,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private tokenStorageService: TokenStorageService) {

    let param: any = window.history.state;
    console.log(param);
    this.vehicle = param.vehicle;
    console.log(this.vehicle)
    this.isCopy = param.isCopy;
    this.orgSno = param.orgSno;
    this.showVehicle = param.showVehicle;
  }

  ngOnInit() {
    this.user = this.tokenStorageService.getUser();
    this.getOrganization();

    var invalidChars = ["-", "e", "+", "E"];
    $("input[type='number']").on("keydown", function (e) {
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
    });


    this.getRoute();
    this.getDestCity();
    this.getSourceCity();
    this.getOrgVehicle();
    this.getNoOfTyreCount();

    this.form = this.fb.group({
      orgSno: this.orgSno,
      vehicleSno: [null,],
      vehicleName: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z ]*')])],
      vehicleRegNumber: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z0-9]*')])], vehicleTypeName: [null],
      vehicleTypeCd: [null, Validators.compose([Validators.required])],
      tyreTypeCd: [null, Validators.compose([Validators.required])],
      tyreSizeCd: [null, Validators.compose([Validators.required])],
      vehicleBanner: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z ]*')])],
      chaseNumber: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z0-9]*')])],
      engineNumber: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z0-9]*')])],
      tyreCountCd: [null, Validators.compose([Validators.required])],
      vehicleDetails: this.fb.group({
        vehicleLogo: [null],
        vehicleRegDate: [null],
        fcExpiryDate: [null],
        vehicleMakeCd: [null],
        vehicleModelCd: [null],
        // wheelsCd: [null],
        stepnyCd: [null, Validators.compose([Validators.max(2)])],
        fuelNormsCd: [null],
        seatCapacity: [null],
        insuranceExpiryDate: [null],
        pollutionExpiryDate: [null],
        taxExpiryDate: [null],
        permitExpiryDate: [null],
        fcExpiryAmount: [null],
        insuranceExpiryAmount: [null],
        taxExpiryAmount: [null],
        odoMeterValue: [null, Validators.compose([Validators.required])],
        fuelCapacity: [null, Validators.compose([Validators.required])],
        fuelTypeCd: [null],
        districtsSno: [null],
        stateSno: [null],
        drivingType: [null, Validators.compose([Validators.required])],
        wheelType: [null],

      }),
      routeList: new FormArray([]),
      ownerList: new FormArray([]),
      passList: new FormArray([]),
      loanList: new FormArray([]),

    });
    this.tollDetails = this.fb.group({
      tollPassDetailSno: [null],
      vehicleSno: [null],
      orgSno: [null],
      passStartDate: [null, Validators.required],
      passEndDate: [null, Validators.required],
      tollAmount: [null, Validators.required],
      // remainderTypeCd: [null, Validators.required],
      tollName: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9 ]+$')])],
      tollId: [null],
      activeFlag: [true],
    });

    this.loanDetails = this.fb.group({
      vehicleDueSno: new FormControl(null),
      vehicleSno: new FormControl(null),
      orgSno: new FormControl(null),
      dueTypeCd: [null, Validators.compose([Validators.required])],
      dueCloseDate: [null, Validators.compose([Validators.required])],
      // remainderTypeCd: [null, Validators.compose([Validators.required])],
      dueAmount: new FormControl(null),
      // activeFlag: new FormControl(null),
      bankName: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      bankAccountDetailSno: [null],
      bankAccountName: [null],
      bankAccountNumber: [null, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z0-9]*')])],
      discription: new FormControl(null),
      dueList: new FormArray([]),
      // duePayDate: new FormControl(null),
      // variableDueAmount: new FormControl(null),
      // variableActiveFlag: new FormControl(null),
    });

    this.getremainderType();
    this.getVehicleTypeEnum();
    this.getDueTypeCd();
    // this.getRemainderTypeCd();
  }

  public getVehicleTypeEnum() {
    let param: any = { codeType: 'vehicle_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.vehicleTypeList = result.data;
      } else {

      }
      this.getFuelTypeEnum();
      this.getTyreType();
    });

  }
  public getremainderType() {
    let param: any = { codeType: 'remainder_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.remainderTypes = result.data;
      } else {

      }
    });
  }

  // getvalue(callback: any) {
  //   let remainDetails = [];
  //   for (let i in this.remainderTypes) {
  //     for (let j of this.tollDetails.value.remainderTypeCd) {
  //       if (j == this.remainderTypes[i].codesDtlSno) {
  //         remainDetails.push(this.remainderTypes[i].cdValue);
  //       }
  //     }
  //   }
  //   callback(remainDetails)
  // }

  getPassDetails() {
    this.tollDetails.reset();
  }

  goToSave() {
    const tollForm = this.tollDetails.value;
    // this.getvalue((result: any) => {
    // tollForm.remainderTypeCdName = result;
    console.log(tollForm)
    if (tollForm) {
      this.passList?.push(this.fb.control(tollForm));
      this.tollDetails.reset();
    }

    console.log(this.passList);
    if (this.vehicle?.vehicleSno) {
      console.log(this.form?.value);
      let body: any = { 'passList': [tollForm] };
      body.orgSno = this.vehicle.orgSno;
      body.vehicleSno = this.vehicle.vehicleSno;
      // if (body?.passList) {
      //   for (let pass of body.passList) {
      //     console.log(body.passList)
      //     if (body.passList) {
      //       pass.remainderTypeCd = '{' + pass.remainderTypeCd + '}';
      //     }
      //   }
      // }
      console.log(body)
      this.api.post("8053/api/insert_toll_pass_detail", body).subscribe(result => {
        console.log(result);
        if (result != null && result.data != null) {
          // this.passDetailList = result.data;
          this.toastrService.success("Toll details Added Successfully");
          this.tollDetails.reset();
          this.modalClose1.nativeElement.click();
        }
      });

    }
    // });
  }

  updatePassList(tollDetails: any) {
    console.log(JSON.stringify(tollDetails));
    const tollForm = tollDetails;
    this.passList?.push(this.fb.control(tollForm));
  }

  // selectImage(l?: number, type?: any) {
  //   if (type == "Image") {
  //     $('#image').click();
  //   } else if (type == "Video") {
  //     $('#video').click();
  //   }
  // }

  // public getTyreType() {
  //   let param: any = { codeType: 'tyre_type_cd' };
  //   this.api.get('8052/api/get_enum_names', param).subscribe(result => {

  //     if (result != null && result.data) {
  //       this.tyreType = result.data;
  //     } else {
  //     }
  //     this.getTyreSize();
  //   });
  // }

  public getTyreType() {
    let param: any = {};
    this.api.get('8054/api/get_tyre_type', param).subscribe(result => {
      if (result != null && result.data) {
        console.log(result)
        this.tyreTypeList = result.data[0]?.tyreList;
        if (this.vehicle?.tyreTypeCd) {
          this.onSelectChange(null, this.vehicle?.tyreTypeCd)
        }
        console.log(this.tyreTypeList)
      } else {

      }
      this.getPublicAddressingSystemTypes()
    });
  }
  onSizeChange(event: any) {
    var selectedValue = event.value
    console.log(selectedValue)
  }
  onSelectChange(event: any, tyreSizeSno?: any) {
    this.tyreSizeList = [];
    if (event != null) {
      var selectedValue = event.value ?? tyreSizeSno;

    } else {
      var selectedValue = tyreSizeSno;
    }
    console.log('Selected value:', selectedValue);
    console.log(this.tyreTypeList)
    for (let i = 0; i < this.tyreTypeList.length; i++) {
      for (let j = 0; j < selectedValue.length; j++) {
        if (this.tyreTypeList[i].tyreTypeSno == selectedValue[j]) {
          console.log(this.tyreTypeList[i].tyreSizeList)
          this.tyreSizeList.push({ 'name': this.tyreTypeList[i].tyreType, 'tyreSizeList': this.tyreTypeList[i].tyreSizeList })
        }
      }
    }
    console.log(this.tyreSizeList)
    // Do whatever you want with the selected value
  }




  public getTyreSize() {
    let param: any = { codeType: 'tyre_size_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.tyreSize = result.data;
      } else {
      }
      this.getPublicAddressingSystemTypes()
    });
  }

  public getPublicAddressingSystemTypes() {
    let param: any = { codeType: 'public_addressing_system_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.publicAddressingSystemTypes = result.data;
      } else {
      }
      this.getLightingSystemTypes();
    });
  }

  public getLightingSystemTypes() {
    let param: any = { codeType: 'lighting_system_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.lightingSystemTypes = result.data;
      } else {
      }
    });
  }

  public getFuelTypeEnum() {
    let param: any = { codeType: 'fuel_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.fuelTypeList = result.data;
      } else {

      }
      this.getState();
    });
  }

  checkvalue(val) {
    console.log(val)
    if (val === "other") {
      document.getElementById('txt-other').style.display = 'block';
    }
    else {
      document.getElementById('txt-other').style.display = 'none';
    }
  }

  // change(){
  //   let selectEl = document.getElementById('select-list');
  //   selectEl.addEventListener('change', (e:any) => {
  //     if (e.target.value == 'other') {
  //       document.getElementById('txt-other').style.display = 'block';
  //     } else {
  //       document.getElementById('txt-other').style.display = 'none';
  //     }
  //   }); 
  // }



  getvehicleDetails() {
    return this.form.get('vehicleDetails') as FormGroup;
  }


  dateChange() {
    console.log(this.form.value.vehicleDetails.vehicleRegDate)
    this.dueDate = moment(this.form.value.vehicleDetails.vehicleRegDate).format('yyyy-MM-DD')
    console.log(this.dueDate)
  }


  getState() {
    let params = {};
    this.api.get("8054/api/get_state", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data) {
        this.States = result.data;

      } else {
      }
      this.getDrivingType();
    });
  }


  getNextSlideIntex(mediaIndex: number) {
    this.currentSlideIndex = (this.currentSlideIndex || 1) + mediaIndex;
    if (this.media[this.currentSlideIndex - 1]?.mediaType == 'Image') {
      $($('#carouselExampleControls').find('img')[this.currentSlideIndex - 1]).attr('srcset', this.media[this.currentSlideIndex - 1]?.mediaUrl);
    }
  }

  getPreviousSlideIntex(mediaIndex: number) {
    this.currentSlideIndex = (this.currentSlideIndex || 1) + mediaIndex;
  }



  validateDateRange(type?: any) {
    if (type == 'FC') {
      this.isFcExpireValid = false;
      if (this.form.value.vehicleDetails.vehicleRegDate > this.form.value.vehicleDetails.fcExpiryDate) {
        this.isFcExpireValid = true;
      }
    } else if (type == 'Insurance') {
      this.isInsuranceValid = false;
      if (this.form.value.vehicleDetails.vehicleRegDate > this.form.value.vehicleDetails.insuranceExpiryDate) {
        this.isInsuranceValid = true;
      }
    } else if (type == 'Tax') {
      this.isTaxValid = false;
      if (this.form.value.vehicleDetails.vehicleRegDate > this.form.value.vehicleDetails.taxExpiryDate) {
        this.isTaxValid = true;
      }
    } else if (type == 'Permit') {
      this.isPermitValid = false;
      if (this.form.value.vehicleDetails.vehicleRegDate > this.form.value.vehicleDetails.permitExpiryDate) {
        console.log('error');
        this.isPermitValid = true;
      }
    } else if (type == 'Popullation') {
      this.isPollutionValid = false;
      if (this.form.value.vehicleDetails.vehicleRegDate > this.form.value.vehicleDetails.pollutionExpiryDate) {
        this.isPollutionValid = true;
      }
    }
    // if (this.startDate && this.endDate) {
    //   if (this.endDate <= this.startDate) {
    //     console.log(this.endDate <= this.startDate)
    //     this.isAlready = true

    //   } else {
    //      this.isAlready = false

    //   }
    // }else{


    // }
  }

  public getDrivingType() {
    let param: any = { codeType: 'driving_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.drivingType = result.data;
      } else {

      }
      this.getWheelType();
    });
  }

  public getWheelType() {
    let param: any = { codeType: 'wheel_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.wheelType = result.data;
      } else {

      }
      this.getSeatType();
      this.vehicleMakeCd();
      this.fuelNorms();

    });
  }

  public getAccount() {
    let param: any = { orgSno: this.user.orgSno };
    this.api.get('8053/api/get_org_account', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        console.log(result)
        this.accountType = result.data;
      } else {

      }
    });
  }


  public vehicleMakeCd() {
    let param: any = { codeType: 'vehicleMakeCd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.vehicleMakeList = result.data;
      } else {
      }
    });
  }

  public fuelNorms() {
    let param: any = { codeType: 'fuelNormsCd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.fuelNormList = result.data;
      } else {
      }
    });
  }


  public getSeatType() {
    let param: any = { codeType: 'seat_Type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.seatTypes = result.data;
      } else {

      }
      this.getVideoType();
    });
  }

  public getVideoType() {
    let param: any = { codeType: 'video_types_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.videoTypes = result.data;
      } else {

      }
      this.getAudioType();
    });
  }

  public getAudioType() {
    let param: any = { codeType: 'Audio_types_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.audioTypes = result.data;
      } else {

      }
      this.getCoolType();
    });
  }

  public getCoolType() {
    let param: any = { codeType: 'Cool_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.coolTypes = result.data;
      } else {
      }
      this.getAirbusType();
    });
  }

  public getAirbusType() {
    let param: any = { codeType: 'bus_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.busSusType = result.data;
      } else {
      }
      if (this.vehicle && this.vehicle.vehicleSno) {
        this.stateSno = this.vehicle.vehicleDetails.stateSno;
        this.getDistricts(true);
      } else {
        this.createOwnerList();
        this.createRouteList();
      }
    });
  }

  getDistricts(isUpdate: boolean) {
    let params: any = {};
    if (this.stateSno != null) {
      params.stateSno = this.stateSno;
    }
    this.Districts = [];
    this.api.get("8054/api/get_district", params).subscribe(result => {

      if (result.data != null && result.data) {
        this.Districts = result.data;
        if (this.vehicle && this.vehicle.vehicleSno && isUpdate) {
          for (let i in this.vehicle?.ownerList) {
            console.log(this.vehicle?.ownerList[i]);
            this.updateOwnerList(this.vehicle.ownerList[i]);
          }

          for (let i in this.vehicle?.routeList?.data) {
            console.log(this.vehicle?.routeList?.data[i]);
            this.vehicle.routeList.data[i].userSno = this.user.appUserSno;
            delete this.vehicle.routeList.data[i].selectedVehicle;
            this.updateRouteList(this.vehicle?.routeList?.data[i]);
          }
          for (let i in this.vehicle?.passList) {
            console.log(this.vehicle?.passList[i]);
            this.updatePassList(this.vehicle?.passList[i]);
          }

          for (let i in this.vehicle?.loanList) {
            console.log(this.vehicle?.loanList[i]);
            this.updateLoanList(this.vehicle?.loanList[i]);
          }

          for (let i in this.vehicle?.dueList) {
            console.log(this.vehicle?.dueList[i]);
            this.updateDueList(this.vehicle?.dueList[i]);
          }

          console.log(this.vehicle?.routeList?.data)

          if (this.vehicle) {
            // setTimeout(()=>{
            this.setValue();
            // },1000)
          }
        }
      } else {
      }
    });
  }

  updateDueList(due: any) {
    console.log(JSON.stringify(due));
    const dueForm = this.fb.group(due);
    this.dueList.push(dueForm);
  }

  updateLoanList(loanDetails: any) {
    console.log(JSON.stringify(loanDetails));
    const loanForm = loanDetails;
    this.loanList?.push(this.fb.control(loanForm));
  }

  public getDueTypeCd() {
    let param: any = { codeType: 'due_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.dueTypeList = result.data;
      } else {

      }
    });

  }

  // public getRemainderTypeCd() {
  //   let param: any = { codeType: 'remainder_type_cd' };
  //   this.api.get('8052/api/get_enum_names', param).subscribe(result => {

  //     if (result != null && result.data) {
  //       this.remainderTypeList = result.data;
  //     } else {

  //     }
  //   });

  // }


  goToSaveLoan() {
    const loanForm = this.loanDetails.value;
    // this.getLoanvalue((result: any) => {
    //   loanForm.remainderTypeCdName = result;
    console.log(loanForm);
    if (loanForm) {
      this.loanList?.push(this.fb.control(loanForm));
      this.loanDetails.reset();
    }
    console.log(this.loanList);

    if (this.loanList.value[0].dueTypeCd == 129) {
      for (let i in this.loanList.value[0].dueList) {
        this.loanList.value[0].dueList[i].variableDueAmount = this.loanList.value[0].dueAmount;
      }
    }


    if (this.vehicle?.vehicleSno) {
      console.log(this.form?.value);
      if (loanForm.bankAccountDetailSno == 'other') {
        delete loanForm.bankAccountDetailSno;
      }
      let body: any = { 'loanList': [loanForm] };
      body.orgSno = this.vehicle.orgSno;
      body.vehicleSno = this.vehicle.vehicleSno;
      console.log(body.loanList)
      if (body?.loanList) {
        for (let i in body?.loanList) {
          console.log(body.loanList[0].dueTypeCd)
          // for (let loan of body.loanList) {
          //   console.log(body.loanList)
          //   if (body.loanList) {
          //     loan.remainderTypeCd = '{' + loan.remainderTypeCd + '}';
          //   }

          // if (body.loanList[i].dueTypeCd == 129) {
          console.log(body.dueTypeCd)
          body.orgSno = this.user.orgSno;
          body.vehicleSno = this.vehicle.vehicleSno;
          if (body.loanList[0].dueTypeCd == 129) {
            for (let i in body.loanList[0].dueList) {
              body.loanList[0].dueList[i].variableDueAmount = body.loanList[0].dueAmount;
            }
          }
          console.log(body)
          this.api.post("8053/api/insert_vehicle_due_fixed_pay", body).subscribe(result => {
            console.log(result);
            if (result != null && result.data != null) {
              // this.passDetailList = result.data;
              this.toastrService.success("Loan details Added Successfully");
              this.loanDetails.reset();
              this.modalClose.nativeElement.click();
            }
          });



          // } else {
          //   console.log(body)
          // this.api.post("8053/api/insert_variable_pay", body).subscribe(result => {
          //   console.log(result);
          //   if (result != null && result.data != null) {
          //     // this.passDetailList = result.data;
          //     this.toastrService.success("Loan details Added Successfully");
          //     this.loanDetails.reset();
          //     this.clearFormArray();
          //     this.modalClose.nativeElement.click();
          //   }
          // });
          // }
        }
      }
      // }
    }
    // });
    // this.location.back();
  }

  get loanList() {
    return this.form.controls["loanList"] as FormArray;
  }


  goToEditLoanDetails(i: any) {
    this.selectLoanIndex = i;
    let index = this.form?.value?.loanList[i];
    console.log(this.form?.value?.loanList[i])
    console.log(index)
    console.log(index.dueList)
    this.clearFormArray()

    for (let i = 0; i < index.dueList?.length; i++) {
      this.createDueList(index.dueList[i].duePayDate);
    };
    this.getAccount();

    this.loanDetails.patchValue({
      vehicleDueSno: index.vehicleDueSno,
      vehicleSno: index.vehicleSno,
      orgSno: index.orgSno,
      bankName: index.bankName,
      bankAccountNumber: index.bankAccountNumber,
      bankAccountDetailSno: index?.bankAccountDetailSno,
      // bankAccountName: index.bankAccountName,
      dueCloseDate: index.dueCloseDate,
      dueTypeCd: index.dueTypeCd,
      dueList: index.dueList,
      // remainderTypeCd: index?.remainderTypeCd,
      // activeFlag: index.activeFlag,
      dueAmount: index.dueAmount,
      discription: index.discription,

    })
    this.loanDate = moment(this.loanDetails.value?.dueCloseDate).format('dd-MM-yyyy')
    console.log(this.loanDetails.value)

  }




  updateLoanDetails() {
    let loanList: any = [];
    var loandetailObj = this.loanDetails.value
    // if (loandetailObj.remainderTypeCd) {
    //   loandetailObj.remainderTypeCd = '{' + loandetailObj.remainderTypeCd + '}';
    // }
    // let body: any = this.loanDetails.value; 


    if (loandetailObj.bankAccountDetailSno == 'other') {
      delete loandetailObj.bankAccountDetailSno;
    }
    let body: any = {};
    this.loanList.value[this.selectLoanIndex] = this.loanDetails.value;
    loanList = [loandetailObj];
    // this.getLoanvalue((result: any) => {
    //   this.loanList.value[this.selectLoanIndex].remainderTypeCdName = result
    // });
    body.loanList = loanList;
    body.orgSno = this.vehicle.orgSno;
    body.vehicleSno = this.vehicle.vehicleSno;
    body.vehicleDueSno = this.loanDetails.value.vehicleDueSno;
    console.log(body.loanList[0])
    if (body.loanList[0].dueTypeCd == 129) {
      for (let i in body.loanList[0].dueList) {
        body.loanList[0].dueList[i].variableDueAmount = body.loanList[0].dueAmount;
      }
    }
    console.log(body)
    this.isLoad = true;

      // body = this.loanDetails.value;
      this.api.put('8053/api/update_variable_pay', body).subscribe((result: any) => {
        this.isLoad = false;
        console.log(result)
        console.log(this.form.value.loanList)

        if (result != null && result.data) {
          this.toastrService.success('Loan details Updated Successfully');
          this.modalClose.nativeElement.click();
        } else {

        }
      });
    // this.location.back();
  }

  getDueAmount(loan: any) {
    var month = new Date().getMonth() + 1;
    var checkMonth = month == 13 ? 1 : month;
    const oneDay = 1000 * 60 * 60 * 24;
    // console.log('checkMonth',checkMonth)
    if (loan?.dueAmount) {
      return loan.dueAmount
    } else {
      for (let i = 0; i < loan?.dueList.length; i++) {
        if (new Date() > new Date(loan.dueCloseDate)) {
          return "Account Closed"
        } else {
          if ((new Date() <= new Date(loan.dueList[i].duePayDate)) && (new Date().getMonth() == new Date(loan.dueList[i].duePayDate).getMonth())) {
            if (new Date().getFullYear() == new Date(loan.dueList[i].duePayDate).getFullYear() && new Date().getMonth() == new Date(loan.dueList[i].duePayDate).getMonth()) {
              return loan.dueList[i].variableDueAmount;
            }
          }
          else {
            if (new Date().getFullYear() == new Date(loan.dueList[i].duePayDate).getFullYear() && checkMonth == new Date(loan.dueList[i].duePayDate).getMonth()) {
              return loan.dueList[i].variableDueAmount;
            }
          }
        }
      }
    }
  }


  public deleteLoanDetails(i: any) {
    console.log(this.form.value.vehicleSno == null)
    if (this.form.value.vehicleSno == null) {
      if (this.form?.value?.loanList[i]?.vehicleDueSno) {
        this.deleteLoanList.push(this.form.value.loanList[i].vehicleDueSno);
      }
      this.loanList.removeAt(i);
    } else {
      let confirmText = "Are you sure to Delete ? ";
      this.confirmDialogService.confirmThis(confirmText, () => {
        let params: any = {};
        params.vehicleDueSno = this.form?.value?.loanList[i].vehicleDueSno;
        console.log(params)
        console.log(this.form?.value?.loanList[i].dueTypeCd)
          this.api.delete('8053/api/delete_variable_pay', params).subscribe(result => {
            if (result != null && result) {
              this.loanList.removeAt(i);
              // this.form?.value?.loanList[i].splice(i, 1);
            }
          })
        this.toastrService.success('Loan Details delete Successfully');
      }, () => {
      });
    }
  }

  // getLoanvalue(callback: any) {
  //   let remainDetails = [];
  //   for (let i in this.remainderTypeList) {
  //     for (let j of this.loanDetails.value.remainderTypeCd) {
  //       if (j == this.remainderTypeList[i].codesDtlSno) {
  //         remainDetails.push(this.remainderTypeList[i].cdValue);
  //       }
  //     }
  //   }
  //   callback(remainDetails)
  // }

  clearFormArray() {
    // while (this.dueList.length !== 0) {
    //   this.dueList.removeAt(0);
    //   console.log(this.dueList)
    // }
    this.loanDetails.removeControl('dueList');
    this.loanDetails.updateValueAndValidity();
    this.loanDetails.addControl('dueList', new FormArray([]));
    this.loanDetails.updateValueAndValidity();
  }

  clearModal() {
    this.getAccount();
    this.loanDetails.reset();
    this.clearFormArray();
  }



  setValue() {
    let vehicleRegDate = this.vehicle?.vehicleDetails.vehicleRegDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.vehicleRegDate), 'yyyy-MM-dd') : null;
    let fcExpiryDate = this.vehicle?.vehicleDetails.fcExpiryDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.fcExpiryDate), 'yyyy-MM-dd') : null;
    let insuranceExpiryDate = this.vehicle?.vehicleDetails.insuranceExpiryDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.insuranceExpiryDate), 'yyyy-MM-dd') : null;
    let pollutionExpiryDate = this.vehicle?.vehicleDetails.pollutionExpiryDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.pollutionExpiryDate), 'yyyy-MM-dd') : null;
    let taxExpiryDate = this.vehicle?.vehicleDetails.taxExpiryDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.taxExpiryDate), 'yyyy-MM-dd') : null;
    let permitExpiryDate = this.vehicle?.vehicleDetails.permitExpiryDate != null ? new DatePipe('en-US').transform(new Date(this.vehicle?.vehicleDetails.permitExpiryDate), 'yyyy-MM-dd') : null;
    console.log(this.vehicle)
    console.log((this.vehicle.kycStatus))
    let vehicle: any = {
      orgSno: this.vehicle.orgSno,
      vehicleSno: this.vehicle.vehicleSno,
      vehicleName: this.vehicle.vehicleName,
      vehicleRegNumber: this.vehicle.vehicleRegNumber,
      vehicleTypeName: this.vehicle.vehicleTypeName,
      vehicleTypeCd: this.vehicle.vehicleTypeCd,
      tyreTypeCd: this.vehicle.tyreTypeCd,
      tyreSizeCd: this.vehicle.tyreSizeCd,
      vehicleBanner: this.vehicle?.vehicleBanner,
      chaseNumber: this.vehicle?.chaseNumber,
      engineNumber: this.vehicle?.engineNumber,
      tyreCountCd: this.vehicle?.tyreCountCd,
      vehicleDetails: {
        vehicleLogo: this.vehicle?.vehicleDetails.vehicleLogo,
        vehicleRegDate: vehicleRegDate,
        fcExpiryDate: fcExpiryDate,
        vehicleMakeCd: this.vehicle?.vehicleDetails.vehicleMakeCd,
        vehicleModelCd: this.vehicle?.vehicleDetails.vehicleModelCd,
        // wheelsCd: this.vehicle?.vehicleDetails.wheelsCd,
        stepnyCd: this.vehicle?.vehicleDetails.stepnyCd,
        fuelNormsCd: this.vehicle?.vehicleDetails.fuelNormsCd,
        seatCapacity: this.vehicle?.vehicleDetails.seatCapacity,
        insuranceExpiryDate: insuranceExpiryDate,
        pollutionExpiryDate: pollutionExpiryDate,
        taxExpiryDate: taxExpiryDate,
        permitExpiryDate: permitExpiryDate,
        fcExpiryAmount: this.vehicle?.vehicleDetails.fcExpiryAmount,
        insuranceExpiryAmount: this.vehicle?.vehicleDetails.insuranceExpiryAmount,
        taxExpiryAmount: this.vehicle?.vehicleDetails.taxExpiryAmount,
        odoMeterValue: this.vehicle?.vehicleDetails.odoMeterValue,
        fuelCapacity: this.vehicle?.vehicleDetails.fuelCapacity,
        fuelTypeCd: this.vehicle?.vehicleDetails.fuelTypeCd,
        districtsSno: this.vehicle?.vehicleDetails.districtsSno,
        stateSno: this.vehicle?.vehicleDetails.stateSno,
        drivingType: this.vehicle?.vehicleDetails.drivingType,
        wheelType: this.vehicle?.vehicleDetails.wheelType,
      },
      ownerList: this.vehicle?.ownerList,
      passList: this.vehicle?.passList || [],
      loanList: this.vehicle?.loanList || [],
    }
    if (this.vehicle.vehicleTypeCd == 22 || this.vehicle.vehicleTypeCd == 93) {
      this.form.addControl('contractCarriage', this.fb.group({
        videoType: [null, Validators.compose([Validators.required])],
        audioType: [null, Validators.compose([Validators.required])],
        luckageCount: [null, Validators.compose([Validators.required])],
        topCarrier: [null, Validators.compose([Validators.required])],
        coolType: [null, Validators.compose([Validators.required])],
        pricePerday: [null, Validators.compose([Validators.required])],
        seatType: [null, Validators.compose([Validators.required])],
        suspensionType: [null, Validators.compose([Validators.required])],
        publicAddressingSystem: [null, Validators.compose([Validators.required])],
        lightingSystem: [null, Validators.compose([Validators.required])],
        // mediaSno:[null]
      }));
      this.form.removeControl('routeList');
      vehicle.contractCarriage = {
        // seatCapacity: this.vehicle?.vehicleDetails.seatCapacity,
        videoType: this.vehicle?.vehicleDetails?.videoType,
        audioType: this.vehicle?.vehicleDetails?.audioType,
        pricePerday: this.vehicle?.vehicleDetails?.pricePerday,
        luckageCount: this.vehicle?.vehicleDetails?.luckageCount,
        topCarrier: this.vehicle?.vehicleDetails?.topCarrier,
        coolType: this.vehicle?.vehicleDetails?.coolType,
        seatType: this.vehicle?.vehicleDetails?.seatType,
        suspensionType: this.vehicle?.vehicleDetails?.suspensionType,
        publicAddressingSystem: this.vehicle?.vehicleDetails?.publicAddressingSystem,
        lightingSystem: this.vehicle?.vehicleDetails?.lightingSystem,
        // mediaSno: this.vehicle?.vehicleDetails?.media
      }
      this.media = this.vehicle?.vehicleDetails?.media ? this.vehicle?.vehicleDetails?.media : [];
      // this.video = this.vehicle?.vehicleDetails?.media.mediaType;
      // console.log(this.video)

    } else if (this.vehicle.vehicleTypeCd == 21 || this.vehicle.vehicleTypeCd == 92) {
      this.form.addControl('routeList', new FormArray([]));
      vehicle.routeList = this.vehicle?.routeList?.data;
    } else {
      this.form.removeControl('contractCarriage');
      this.form.removeControl('routeList');
      this.OthersList = this.vehicle?.vehicleDetails?.othersList;
    }
    this.form.updateValueAndValidity();
    console.log((vehicle))
    this.OthersList = this.vehicle?.vehicleDetails?.othersList;
    this.form.setValue(vehicle);
    console.log((this.form.value))
  }

  ngOnDestroy() {
    clearInterval(this.closeTimer);
  }

  setDefaultDate(): NgbDateStruct {
    var startDate = new Date();
    let startYear = startDate.getFullYear().toString();
    let startMonth = startDate.getMonth() + 1;
    let startDay = "1";

    return this.ngbDateParserFormatter.parse(startYear + "-" + startMonth.toString() + "-" + startDay);
  }


  get ownerList() {
    return this.form.controls["ownerList"] as FormArray;
  }

  get routeList() {
    return this.form.controls["routeList"] as FormArray;
  }
  get passList() {
    return this.form.controls["passList"] as FormArray;
  }
  createOwnerList() {
    // var owner: any = {};
    // owner.vehicleOwnerSno = null;
    // owner.vehicleSno = null;
    // owner.ownerName = null;
    // owner.ownerNumber = null;
    // owner.currentOwner = false;
    // owner.userSno = this.user.userSno;
    // const ownerForm = this.fb.group(owner);
    let owner = this.fb.group({
      vehicleOwnerSno: [null],
      vehicleSno: [null],
      currentOwner: [false],
      userSno: [this.user.appUserSno],
      ownerName: [null, Validators.compose([Validators.required])],
      ownerNumber: [null, Validators.compose([Validators.required])]
    });
    this.ownerList?.push(owner);
  }
  updateOwnerList(owner: any) {
    const ownerForm = this.fb.group(owner);
    this.ownerList.push(ownerForm);
  }


  createRouteList() {
    // var route: any = {};
    // route.routeSno = null;
    // route.sourceCitySno = null;
    // route.destinationCitySno = null;
    // route.activeFlag = true;
    // route.sourceCityName = null;
    // route.destinationCityName = null;
    // route.selectedVehicle = null;
    // route.viaList = null;
    // route.busList = null;
    // route.operatorRouteSno = null;
    // route.userSno = this.user.userSno;
    // const routeForm = this.fb.group(route);
    this.routeList.push(this.fb.group({
      routeSno: [null],
      activeFlag: [true],
      sourceCityName: [null],
      destinationCityName: [null],
      // selectedVehicle: [null],
      viaList: [null],
      // busList: [null],
      operatorRouteSno: [null],
      userSno: [this.user.appUserSno],
      sourceCitySno: [null, Validators.compose([Validators.required])],
      destinationCitySno: [null, Validators.compose([Validators.required])]
    }));
  }

  updateRouteList(route: any) {
    console.log(JSON.stringify(route));
    // route.userSno = this.user.appUserSno;
    const routeForm = this.fb.group({
      routeSno: route.routeSno,
      activeFlag: route.activeFlag,
      sourceCitySno: route.sourceCitySno,
      destinationCitySno: route.destinationCitySno,
      operatorRouteSno: route.operatorRouteSno,
      sourceCityName: route.sourceCityName,
      destinationCityName: route.destinationCityName,
      viaList: route.viaList,
      busList: route.busList,
      userSno: this.user.appUserSno,
      // selectedVehicle: route.selectedVehicle,
    });
    this.routeList.push(routeForm);
    // this.routeList.push(this.fb.group({
    //   routeSno: route.routeSno,
    //   activeFlag: route.activeFlag,
    //   sourceCityName: route.sourceCityName,
    //   destinationCityName: route.destinationCityName,
    //   selectedVehicle: route.selectedVehicle,
    //   viaList: route.viaList,
    //   busList: route.busList,
    //   operatorRouteSno: route.operatorRouteSno,
    //   userSno: this.user.appUserSno,
    //   sourceCitySno: route.sourceCitySno,
    //   destinationCitySno: route.destinationCitySno
    // }));
    // this.routeList.push(this.fb.group({
    //   routeSno: [null],
    //   activeFlag: [true],
    //   sourceCityName: [null],
    //   destinationCityName: [null],
    //   selectedVehicle: [null],
    //   viaList: [null],
    //   busList: [null],
    //   operatorRouteSno: [null],
    //   userSno: [this.user.appUserSno],
    //   sourceCitySno: [null, Validators.compose([Validators.required])],
    //   destinationCitySno: [null, Validators.compose([Validators.required])]
    // }));
    // const routeForm = this.fb.group(route);
    // console.log('*********');
    // this.routeList.push(routeForm);
    // console.log(routeForm); 
    // this.routeList.push(this.fb.group({
    //   routeSno: [null],
    //   activeFlag: [true],
    //   sourceCityName: [null],
    //   destinationCityName: [null],
    //   selectedVehicle: [null],
    //   viaList: [null],
    //   busList: [null],
    //   operatorRouteSno: [null],
    //   userSno: [this.user.userSno],
    //   sourceCitySno: [null, Validators.compose([Validators.required])],
    //   destinationCitySno: [null, Validators.compose([Validators.required])]
    // }));
  }

  onChanges(value: any) {
    this.clearFormArray();
    if (value.target.value == 130) {
      console.log(this.dueList.value)
      this.getDatesBetween(this.loanDate);
    } else {
      this.getDatesBetween(this.loanDate);
      this.isFixedDue();
    }
  }

  isFixedDue() {
    this.loanDetails.get('dueAmount').addValidators(Validators.required);
  }

  dateChanges() {
    this.clearFormArray();
    // this.loanDate = moment(this.loanDetails.value.dueCloseDate).format('dd-MM-yyyy')
    this.loanDate = moment(this.loanDetails.value.dueCloseDate).format('yyyy-MM-DD')
    console.log(this.loanDate);
    if (this.loanDetails.value.dueTypeCd == 130 && this.loanDetails.value.dueTypeCd == 129) {
      this.getDatesBetween(this.loanDate);
      // this.getDatesBetween();
    }

  }

  createDueList(date: any) {
    // Parse the input date string
    const [day, month, year] = date.split('-').map(Number);
    // Construct a Date object
    const myDate = new Date(year, month - 1, day); // Note: month is 0-based in JavaScript Date object
    // Format the date using DatePipe
    const formattedDate = this.datepipe.transform(myDate, 'yyyy-MM-dd');
    let due = this.fb.group({
      duePayDate: [formattedDate],
      variableDueAmount: [null],
      // variableActiveFlag: [null],
    });
    this.dueList?.push(due);
    console.log(this.dueList);
  }

  addAmount() {
    console.log(this.dueList.value)
    // this.dueList.get('variableDueAmount').setValue(this.loanDetails.value.dueAmount);
    Object.keys(this.loanDetails.controls).forEach(key => {
      const controlValue = this.loanDetails.get(key)?.value;
      for (let i in this.due.value) {
        this.dueList.value[i].variableDueAmount.push(this.fb.control(this.loanDetails.value.dueAmount));
      }
    });

  }

  async getDatesBetween(endDate: any) {
    this.dateList = [];
    var startDates = new Date();
    startDates.setHours(0);
    startDates.setMinutes(0);
    startDates.setSeconds(0);
    let closeDates = new Date(endDate);
    closeDates.setHours(0);
    closeDates.setMinutes(0);
    closeDates.setSeconds(0);
    let dues: any = [];
    while (startDates.getTime() <= closeDates.getTime()) {
      startDates.setDate(1);
      let year = startDates.getFullYear();
      let month = startDates.getMonth() + 1;
      dues.push({ day: 0, month: month, year: year });
      startDates.setMonth(month);
    }
    if(closeDates.getDate() == 1){
      dues.push({ day: 0, month: closeDates.getMonth()+1, year: closeDates.getFullYear()});
    }
    for (let i = 0; i < dues.length; i++) {
      let dueDay = closeDates.getDate();
      if ((dueDay > 28 && parseInt(dues[i].month) == 2) || dueDay > 30) {
        dueDay = new Date(dues[i].year, parseInt(dues[i].month), 0).getDate();
      }
      let day = ('0' + dueDay).slice(-2);
      let month = ('0' + parseInt(dues[i].month)).slice(-2);
      let year = parseInt(dues[i].year);
      let dueDate = new Date(`${year}-${month}-${day}`);
      console.log(dueDate > new Date())
      if (dueDate > new Date())
        this.dateList.push(`${day}-${month}-${year}`);
    }
    // console.log('DUEDATE', dues)
    console.log('DUEDATE', this.dateList)
    for (let m = 0; m < this.dateList.length; m++) {
      this.createDueList(this.dateList[m])
    }
    return this.dateList;
  }


  getLastDateOfNextMonth(year: number, month: number): Date {
    // Create a new Date object for the next month's first day
    const nextMonthFirstDay = new Date(year, month + 2, 1);
    // Subtract one day to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonthFirstDay.getTime() - 1);

    return lastDayOfMonth;
  }



  getLastDateOfMonth(year: number, month: number): Date {
    // Create a new Date object for the next month's first day
    const nextMonthFirstDay = new Date(year, month + 1, 1);

    // Subtract one day to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonthFirstDay.getTime() - 1);

    return lastDayOfMonth;
  }




  monthDiff(d1: any, d2: any) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }


  get dueList() {
    return this.loanDetails.controls["dueList"] as FormArray;
  }
  get userList() {
    return this.form.controls["userList"] as FormArray;
  }

  createOthersList(data: any) {
    if (data != null && data != '') {
      this.OthersList.push(data);
    }
  }
  remove(i: any) {
    // this.OthersList.splice(i, 1);
    if (this.media) {
      console.log(this.media)
      this.deleteMediaList.push({ mediaSno: this.media[i].mediaSno, mediaDetailSno: this.media[i].mediaDetailSno })
      this.media.splice(i, 1);
    }

  }

  updateUserList(user: any) {
    const userForm = this.fb.group(user);
    this.userList.push(userForm);
  }



  get taskList() {
    return this.form.controls["taskList"] as FormArray;
  }
  createTaskList() {
    let task: any = {};
    task.vehicleTaskSno = null,
      task.taskName = null;
    task.description = null;
    const taskForm = this.fb.group(task);
    this.taskList.push(taskForm);
  }

  public getvehicleStatusEnum() {
    let param: any = { codeType: 'vehicle_status_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.vehicleList = result.data;
      } else {

      }
    });
  }

  public getNoOfTyreCount() {
    let param: any = { codeType: 'tyre_count_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.tyreCountList = result.data;
        console.log(this.tyreCountList)
      } else {
      }
    });
  }

  addVehicle() {
    console.log(this.form.value)
    if (this.form.value.loanList.length > 0) {
      if (this.form.value.loanList[0].bankAccountDetailSno == 'other') {
        delete this.form.value.loanList[0].bankAccountDetailSno;
      }
    }
    let body: any = Object.assign(this.form.value, {});
    body.OthersList = this.OthersList;
    if (this.form.value.vehicleTypeCd == 21) {
      body.routeList.operatorSno = this.user?.orgSno
    }
    if (this.user.roleCd == 1) {
      body.kycStatus = 19
    } else {
      body.kycStatus = 20
    }
    body.tyreTypeCd = '{' + body.tyreTypeCd + '}';
    body.tyreSizeCd = '{' + body.tyreSizeCd + '}';

    if (body?.contractCarriage?.videoType) {
      body.contractCarriage.videoType = '{' + body.contractCarriage.videoType + '}';
    }

    if (body?.contractCarriage?.audioType) {
      body.contractCarriage.audioType = '{' + body.contractCarriage.audioType + '}';
    }
    if (body?.contractCarriage?.publicAddressingSystem) {
      body.contractCarriage.publicAddressingSystem = '{' + body.contractCarriage.publicAddressingSystem + '}';
    }

    if (body?.contractCarriage?.lightingSystem) {
      body.contractCarriage.lightingSystem = '{' + body.contractCarriage.lightingSystem + '}';
    }
    // if (body?.passList) {
    //   for (let pass of body.passList) {
    //     console.log(body.passList)
    //     if (body.passList) {
    //       pass.remainderTypeCd = '{' + pass.remainderTypeCd + '}';
    //     }
    //   }
    // }
    // if (body?.loanList) {
    //   for (let loan of body.loanList) {
    //     console.log(body.loanList)
    //     if (body.loanList) {
    //       loan.remainderTypeCd = '{' + loan.remainderTypeCd + '}';
    //     }
    //   }
    // }
    let mediaObj: any = {
      mediaSno: null,
      containerName: 'media',
      deleteMediaList: [],
      mediaList: this.media,
    };
    // if(this.media?.length>0){
    //     mediaObj.mediaList.push(this.video[0]);
    //   }
    // delete body.media;
    body.media = mediaObj;
    this.isLoad = true;
    console.log(body);
    this.api.post('8053/api/add_vehicle_info', body).subscribe(result => {
      this.isLoad = false;
      if (result != null && result.data) {
        console.log(result);
        this.toastrService.success('vehicle Added Successfully');
        this.form.reset();
        this.location.back();
      } else {

      }
    });
  }

  public convertObjectToDate(dateObj) {

    let month = dateObj.month > 10 ? dateObj.month : '0' + dateObj.month;
    let date: any = dateObj.year + '-' + month + '-' + dateObj.day;
    return date;
  }
  openDialog(i: any) {
    this.exampleModals1.nativeElement.click();
    this.selectTollIndex = i;
    let index = this.form?.value?.passList[i];
    console.log(index)
    this.tollDetails.patchValue({
      tollPassDetailSno: index.tollPassDetailSno,
      vehicleSno: index.vehicleSno,
      orgSno: index.orgSno,
      passStartDate: index.passStartDate,
      passEndDate: index.passEndDate,
      tollAmount: index.tollAmount,
      tollName: index.tollName,
      // remainderTypeCd: index.remainderTypeCd,
      activeFlag: index.activeFlag,
      tollId: index.tollId
    });
    console.log(this.tollDetails.value)
  }

  public deletePass(i: any) {
    console.log(this.form.value.vehicleSno == null)
    if (this.form.value.vehicleSno == null) {
      if (this.form?.value?.passList[i]?.tollPassDetailSno) {
        this.deletePassList.push(this.form.value.passList[i].tollPassDetailSno);
      }
      this.passList.removeAt(i);
    } else {
      let confirmText = "Are you sure to Delete ? ";
      this.confirmDialogService.confirmThis(confirmText, () => {
        let params: any = {};
        params.tollPassDetailSno = this.form?.value?.passList[i].tollPassDetailSno;
        console.log(params)
        this.api.delete('8053/api/delete_toll_pass_detail', params).subscribe(result => {
          if (result != null && result) {
            this.passList.removeAt(i);
            // this.form?.value?.passList[i].splice(i, 1);

          }
        })
        this.toastrService.success('Pass Details delete Successfully');
      }, () => {
      });
    }
  }


  goToUpdate() {
    let body: any = this.tollDetails.value;
    this.passList.value[this.selectTollIndex] = this.tollDetails.value;
    // this.getvalue((result: any) => {
    //   this.passList.value[this.selectTollIndex].remainderTypeCdName = result
    // });

    // if (body?.remainderTypeCd) {
    //   body.remainderTypeCd = '{' + body.remainderTypeCd + '}';
    // }
    console.log(body)
    this.isLoad = true;
    this.api.put('8053/api/update_toll_pass_detail', body).subscribe((result: any) => {
      this.isLoad = false;
      console.log(result)
      console.log(this.form.value.passList)

      if (result != null && result.data) {
        this.toastrService.success('Toll details Updated Successfully');
      } else {

      }

    });
  }




  updatevehicle() {
    let body: any = this.form.value;
    console.log(body)
    body.removeRouteList = this.removeRouteList;
    body.removeUserList = this.removeUserList;
    body.deleteList = this.deleteList;
    body.kycStatus = this.vehicle.kycStatus;
    body.tyreTypeCd = '{' + body.tyreTypeCd + '}';
    body.tyreSizeCd = '{' + body.tyreSizeCd + '}';

    if (body?.contractCarriage?.videoType) {
      body.contractCarriage.videoType = '{' + body.contractCarriage.videoType + '}';
    }
    if (body?.contractCarriage?.audioType) {
      body.contractCarriage.audioType = '{' + body.contractCarriage.audioType + '}';
    }
    if (body?.contractCarriage?.publicAddressingSystem) {
      body.contractCarriage.publicAddressingSystem = '{' + body.contractCarriage.publicAddressingSystem + '}';
    }

    if (body?.contractCarriage?.lightingSystem) {
      body.contractCarriage.lightingSystem = '{' + body.contractCarriage.lightingSystem + '}';
    }
    console.log(body.co)
    if (this.media?.length > 0) {
      var mediaObj: any = {
        mediaSno: this.media[0]?.mediaSno ?? null,
        containerName: 'media',
        mediaList: this.media,
        deleteMediaList: [],
      };
    } else {
      var mediaObj: any = {
        mediaSno: null,
        containerName: 'media',
        mediaList: this.media,
        deleteMediaList: [],
      };
    }

    if (this.deleteMediaList) {
      mediaObj.deleteMediaList = this.deleteMediaList;
    }
    body.media = mediaObj;
    console.log(body)
    this.isLoad = true;
    this.api.put('8053/api/update_vehicle_info', body).subscribe((result: any) => {
      this.isLoad = false;
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('vehicle Updated Successfully');
        this.form.reset();
        // this.location.back();
      } else {

      }
    });
    this.location.back();
  }

  getOrganization() {
    let params: any = {};
    if (this.user.roleCd == 2 || this.user.roleCd == 127 || this.user.roleCd == 128) {
      params.orgSno = this.user.orgSno
    } else {
      params.orgSno = this.vehicle.orgSno

    }
    this.api.get('8053/api/get_org', params).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.operatorList = result.data[0].ownerDetails;
        console.log(this.operatorList)

        if (this.user.roleCd == 1) {
          this.form.patchValue({
            orgSno: this.vehicle.orgSno
          })
        }
        if (this.showVehicle == true) {
          this.form.patchValue({
            vehicleRegNumber: this.operatorList.vehicleNumber,
          })
        }
      }
    })
  }

  removeOwner(i) {
    if (this.form?.value?.ownerList[i]?.vehicleOwnerSno) {
      this.removeUserList.push(this.form.value.ownerList[i].vehicleOwnerSno);
    }
    console.log(this.removeUserList)
    this.ownerList.removeAt(i);
  }

  removeRoute(i) {
    if (this.form?.value?.routeList[i]?.operatorRouteSno) {
      this.removeRouteList.push(this.form.value.routeList[i].operatorRouteSno);
    }
    console.log(this.removeRouteList)
    this.routeList.removeAt(i);
  }

  removeMedia() {
    this.media = [];
    this.images.nativeElement.value = '';
  }
  // removeVideo(){
  //   this.video = [];
  //   this.videos.nativeElement.value = '';

  // }


  addMedia(type: any) {
    if (type == 'banner') {
      let element: HTMLElement = document.querySelector('input[name="fileUploader"]') as HTMLElement;
      element.click();
    }
  }

  onFileChange(e: any, type: any) {
    this.PhotoService.onFileChange(e, ['png', 'jpeg', 'jpg', 'webp'], (result: any) => {
      if (result != null && result != undefined) {
        if (type == 'banner') {
          this.form.patchValue({
            vehicleLogo: result[0]
          })
        }
      }
    });
  }

  changeFile(e: any) {
    console.log(e)
    this.PhotoService.onFileChange(e, ['png', 'jpeg', 'jpg', 'webp', 'mp4'], (result: any) => {
      if (result != null && result != undefined) {
        for (let obj of result) {
          obj.azureId = obj.fileType;
          this.media.push(obj);
        }
        console.log(this.media);
      }
    }, this.media?.length > 0 ? 6 - this.media?.length : 6);
  }


  index() {
    this.stateSno = this.form.value.vehicleDetails.stateSno;
    this.getDistricts(false);
  }

  getRoute() {
    let params: any = {};
    if (this.user.roleCd == 2 || this.user.roleCd == 127 || this.user.roleCd == 128) {
      params.orgSno = this.user.orgSno
    } else {
      params.orgSno = this.vehicle.orgSno
    }
    this.api.get('8054/api/get_route', params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.records = result.data;
        console.log((this.records))
      }
    });
  }

  removes(i: number, j: number) {
    if (this.form.value.routeList.at(i).viaList[j].viaSno) {
      this.deleteList.push(this.form.value.routeList.at(i).viaList[j].viaSno)
    }
    this.form.value.routeList.at(i).viaList.splice(j, 1)
  }

  createViaList(data: any, i: number) {
    if (data != null && data != '') {
      for (let source of this.sourceCities) {
        if (source.citySno == data) {
          let vialist = this.routeList.at(i).value.viaList;
          if (vialist == null)
            vialist = [];
          let isAlreadyExists: boolean = false;
          for (let via of vialist) {
            if (via.citySno == source.citySno) {
              this.toastrService.error('This via is Already Exists');
              isAlreadyExists = true;
              break;
            }
          }
          if (!vialist?.length || !isAlreadyExists) {
            vialist.push(source);
          }
          this.routeList.at(i).patchValue({
            viaList: vialist
          });
          break;
        }
      }
    }
  }
  getSourceCity() {
    let body = {};
    this.api.get("8054/api/get_city", body).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.sourceCities = result.data;
        this.cities = result.data;
      } else {
      }
    });
  }

  getDestCity() {
    this.destCities = [];
    for (let i in this.sourceCities) {
      if (this.sourceCities[i].citySno != this.form.value.sourceCitySno) {
        this.destCities.push(this.sourceCities[i]);
      }

    }
  }

  getOrgVehicle() {
    let params: any = {};
    if (this.user.roleCd == 2 || this.user.roleCd == 127 || this.user.roleCd == 128) {
      params.orgSno = this.user.orgSno
    } else {
      params.orgSno = this.vehicle.orgSno
    }
    console.log(params)
    this.api.get("8053/api/get_org_vehicle", params).subscribe(result => {
      this.kycMsg = result
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.orgvehiclesList = result.data;
        console.log(this.orgvehiclesList)
        for (let i in this.orgvehiclesList) {
          let id = this.orgvehiclesList[i].vehicleSno;
          let name = this.orgvehiclesList[i].vehicleRegNumber;
          let obj: any = { 'id': id, 'name': name }
          this.myOptions.push(obj)
        }
      } else {
      }
    });
  }

  // onChange() {
  //   this.isPermit  = false;
  //     // this.formEnableDisable('enable')
  //   if (this.form.value.vehicleTypeCd == 22 || this.form.value.vehicleTypeCd == 93) {
  //     this.form.addControl('contractCarriage', this.fb.group({
  //       videoType: [null, Validators.compose([Validators.required])],
  //       audioType: [null, Validators.compose([Validators.required])],
  //       luckageCount: [null, Validators.compose([Validators.required])],
  //       topCarrier: [false],
  //       coolType: [null, Validators.compose([Validators.required])],
  //       pricePerday: [null, Validators.compose([Validators.required])],
  //       seatType: [null, Validators.compose([Validators.required])],
  //       suspensionType: [null, Validators.compose([Validators.required])],
  //       publicAddressingSystem: [null, Validators.compose([Validators.required])],
  //       lightingSystem: [null, Validators.compose([Validators.required])]
  //     }));
  //     this.form.removeControl('routeList');

  //   } else {
  //     this.form.removeControl('contractCarriage');
  //     this.form.addControl('routeList', new FormArray([])); 
  //     if(this.form.value.vehicleTypeCd == 21 || this.form.value.vehicleTypeCd == 92 && this.sourceCities.length == 0){
  //       this.isPermit  = true;
  //       this.toastrService.warning('add Location in route to continue the vehicle registration With Stage Carraige');
  //     }
  //   }
  //   this.form.updateValueAndValidity();
  // }

  onChange() {
    this.isPermit = false;
    // this.formEnableDisable('enable')
    if (this.form.value.vehicleTypeCd == 22 || this.form.value.vehicleTypeCd == 93) {
      this.form.addControl('contractCarriage', this.fb.group({
        videoType: [null, Validators.compose([Validators.required])],
        audioType: [null, Validators.compose([Validators.required])],
        luckageCount: [null, Validators.compose([Validators.required])],
        topCarrier: [false],
        coolType: [null, Validators.compose([Validators.required])],
        pricePerday: [null, Validators.compose([Validators.required])],
        seatType: [null, Validators.compose([Validators.required])],
        suspensionType: [null, Validators.compose([Validators.required])],
        publicAddressingSystem: [null, Validators.compose([Validators.required])],
        lightingSystem: [null, Validators.compose([Validators.required])],
        // mediaSno:[null]
      }));
      this.form.removeControl('routeList');

    } else if (this.form.value.vehicleTypeCd == 21 || this.form.value.vehicleTypeCd == 92) {
      this.form.removeControl('contractCarriage');
      this.form.addControl('routeList', new FormArray([]));
      if ((this.form.value.vehicleTypeCd == 21 || this.form.value.vehicleTypeCd == 92) && this.sourceCities.length == 0) {
        this.isPermit = true;
        this.toastrService.warning('add Location in route to continue the vehicle registration With Stage Carraige');
      }
    }
    else {
      this.form.removeControl('contractCarriage');
      this.form.removeControl('routeList');
      this.isPermit = false;
    }
    this.form.updateValueAndValidity();
  }

  // formEnableDisable(type:any){
  //   if(type == 'enable'){
  //     this.form.controls['vehicleRegNumber'].enable();
  //     this.form.controls['vehicleName'].enable();
  //     this.form.controls['tyreTypeCd'].enable();
  //     this.form.controls['tyreSizeCd'].enable();
  //     this.form.controls['vehicleBanner'].enable();
  //     this.form.controls['chaseNumber'].enable();
  //     this.form.controls['engineNumber'].enable();
  //     this.form.controls['odoMeterValue'].enable();
  //     this.form.controls['fuelCapacity'].enable();
  //     this.form.controls['drivingType'].enable();
  //   }

  // }

}
