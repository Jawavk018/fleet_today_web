import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { Location } from '@angular/common';
import { AgmDirectionModule } from 'agm-direction';
import { TokenStorageService } from '../login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import * as moment from 'moment-timezone';



@Component({
  selector: 'app-addjob',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GooglePlaceModule, MaterialModule, AgmDirectionModule, AgmCoreModule],
  templateUrl: './addjob.component.html',
  styleUrls: ['./addjob.component.scss']
})
export class AddjobComponent implements OnInit {
  @ViewChild('mapInput', { static: false }) mapInput: ElementRef;


  public jobForm: UntypedFormGroup;
  lat: number;
  lng: number;
  currLat: number;
  currLng: number;
  currentLocation: string;
  today = moment().format('yyyy-MM-DD HH:mm')
  dueDate : any;
  sourceMarkerLat: number;
  sourceMarkerLng: number;
  showCurrent: boolean = true;
  sourceName: any;
  type: any
  sourceLocation = {};
  latLongSourceList: any[] = [];
  latLongList = [];
  viaLatLongList = [];
  forwardDis: number
  markerList = [];
  showBlurAction: boolean = false
  inputValue1: string;
  drivingTypes: any = [];
  jobTypes: any = [];
  fuelTypes: any = [];
  transmissionTypes: any = [];
  orgSno: any;
  user: any;
  isEnddateValid: boolean = false;

  zoom = 3
  center: google.maps.LatLngLiteral
  geocoder: google.maps.Geocoder;


  chennaiLat = 13.07153;
  chennaiLng = 80.1963876;
  maduraiLat = 10.8505;
  maduraiLng = 76.2711;

  routes: { lat: number; lng: number }[][] = [];

  option = {
    types: [],
    componentRestrictions: { country: 'IN' }
  }

  jobContactList: any = [];

  filter1: any

  job: any = [];


  showViaButton: boolean = false;


  constructor(public fb: FormBuilder,
    private router: Router,
    public location: Location,
    public toastrService: ToastrService,
    private mapsAPILoader: MapsAPILoader,
    private tokenStorageService: TokenStorageService,
    private api: ApiService) {
    this.user = this.tokenStorageService.getUser();
    this.geocoder = new google.maps.Geocoder();
  }

  defaultLocation: { currLat: number, currLng: number };

  ngOnInit(): void {

    let param: any = window.history.state;
    console.log(param)
    // this.count = param.count;
    this.job = param.job;
    console.log(this.job)

    // this.getContact();
    console.log(this.user)
    this.jobForm = this.fb.group({
      jobPostSno: [null],
      orgSno: this.user.orgSno,
      roleCd: this.user.roleCd,
      driveTypeCd: [null, Validators.compose([Validators.required])],
      jobTypeCd: [null, Validators.compose([Validators.required])],
      fuelTypeCd: [null, Validators.compose([Validators.required])],
      transmissionTypeCd: [null, Validators.compose([Validators.required])],
      userLatLong: [null, Validators.compose([Validators.required])],
      startDate: [null, Validators.compose([Validators.required])],
      endDate: [null, Validators.compose([Validators.required])],
      contactName: [null, Validators.compose([Validators.required])],
      contactNumber: [null, Validators.compose([Validators.required])],
      lat: [null],
      lng: [null],
      distance: [null],
      activeFlag: [true],
      description: [null],
      // contactList: new UntypedFormArray([]),
    });
    this.getDrivingTypes();
    this.getFuelTypes();
    this.getTransmissionTypes();
    // this.setValue();
  }

  addJob() {
    let body: any = this.jobForm.value;
    console.log(this.sourceLocation)
    body.userLatLong = Object.assign({}, this.sourceLocation)
    console.log(body.userLatLong.lang)
    body.lng = body.userLatLong.lang;
    body.lat = body.userLatLong.lat;
    body.postedOn = 'Asia/Kolkata';
    body.appUserSno = this.user.appUserSno
    body.authTypeCd = 166
    // body.authTypeCd = 
    if (body?.driveTypeCd) {
      body.driveTypeCd = '{' + body.driveTypeCd + '}';
    }
    if (body?.jobTypeCd) {
      body.jobTypeCd = '{' + body.jobTypeCd + '}';
    }
    if (body?.fuelTypeCd) {
      body.fuelTypeCd = '{' + body.fuelTypeCd + '}';
    }
    if (body?.transmissionTypeCd) {
      body.transmissionTypeCd = '{' + body.transmissionTypeCd + '}';
    }
    console.log(body)
    this.api.post('8055/api/insert_job_post', body).subscribe(result => {
      if (result != null && result.data) {
        console.log(result);
        this.toastrService.success('Job Posted Successfully');
        this.jobForm.reset();
        this.location.back();
        this.router.navigate(['/job-post'])
      }
      else {

      }
    });
  }

  setValue() {
    console.log(this.job)
    let job: any = {
      orgSno: this.user.orgSno,
      jobPostSno: this.job.jobPostSno,
      startDate: this.job.startDate,
      endDate: this.job.endDate,
      driveTypeCd: this.job.driveTypeCd,
      jobTypeCd: this.job.jobTypeCd,
      fuelTypeCd: this.job.fuelTypeCd,
      transmissionTypeCd: this.job.transmissionTypeCd,
      roleCd: this.job.roleCd,
      contactName: this.job.contactName,
      contactNumber: this.job.contactNumber,
      userLatLong: this.job.userLatLong,
      lat:this.job.lat,
      lng:this.job.lng,
      distance:this.job.distance,
      activeFlag:this.job.activeFlag,
      description: this.job.description,
    };
    this.jobForm.setValue(job);
    console.log(this.jobForm);
  }

  public getDrivingTypes() {
    let param: any = { codeType: 'drive_type_cd' };
    console.log(param)
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.drivingTypes = result.data;
        console.log(this.drivingTypes)
        if (this.job) {
          this.setValue();
          this.handleAddressChange(this.job.userLocation);
          this.setMarker();
        }
        this.getJobTypes();
        // this.jobForm.get('jobTypeCd').setValue(this.job.jobTypeCd);
      } else {
      }
    });
  }




  updateJob() {
    let body: any = this.jobForm.value;
    body.userLatLong = Object.assign({}, this.job.userLocation)
    body.authTypeCd = 166
    if(this.latLongSourceList.length > 0){
    body.userLatLong = Object.assign({}, this.sourceLocation)
    }
    if (body?.driveTypeCd) {
      body.driveTypeCd = '{' + body.driveTypeCd + '}';
    }
    if (body?.jobTypeCd) {
      body.jobTypeCd = '{' + body.jobTypeCd + '}';
    }
    if (body?.fuelTypeCd) {
      body.fuelTypeCd = '{' + body.fuelTypeCd + '}';
    }
    if (body?.transmissionTypeCd) {
      body.transmissionTypeCd = '{' + body.transmissionTypeCd + '}';
    }
    
    console.log(body)
    this.api.put('8055/api/update_job_post', body).subscribe((result: any) => {
      console.log(result)
      if (result != null && result.data) {
        this.toastrService.success('Job Post details Updated Successfully');
        this.location.back();
      } else {

      }

    });
  }

  clearInput() {
    console.log(this.jobForm.value)
    // const jobType = this.jobForm.value.driveTypeCd
    this.getJobTypes();
    this.jobForm.get('jobTypeCd').patchValue([]);
  }

  dateChange() {
    console.log(this.jobForm.value.startDate)
    this.dueDate = moment(this.jobForm.value.startDate).format('yyyy-MM-DD HH:mm')
    console.log(this.dueDate)
  }

  validateDateRange(type: any) {
    if (type == 'End') {
      this.isEnddateValid = false;
      if (this.jobForm.value?.startDate > this.jobForm.value?.endDate) {
        this.isEnddateValid = true;
      }
    }

  }

  calculateDateDifference() {
    const start = new Date(this.jobForm.value.startDate);
    const end = new Date(this.jobForm.value.endDate);
    if(this.jobForm.value.endDate){
      const timeDifference = end.getTime() - start.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
    } 
  }


  public getJobTypes() {
    let param: any = { codeType: 'job_type_cd'};
    if (this.jobForm.value.driveTypeCd && this.jobForm.value.driveTypeCd != '') {
      param.filter1 =  '{' + this.jobForm.value.driveTypeCd + '}';
    }
    console.log(param)
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.jobTypes = result.data;
        console.log(this.jobTypes)
        if(this.job == null){
          this.getCurrentLocation();
        }
      } else {
      }
    });
  }


  public getFuelTypes() {
    let param: any = { codeType: 'fuel_type_cd'};
    console.log(param)
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.fuelTypes = result.data;
        console.log(this.fuelTypes)
        if(this.job == null){
          this.getCurrentLocation();
        }
      } else {
      }
    });
  }


  public getTransmissionTypes() {
    let param: any = { codeType: 'transmission_type_cd'};
    console.log(param)
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.transmissionTypes = result.data;
        console.log(this.transmissionTypes)
        if(this.job == null){
          this.getCurrentLocation();
        }
      } else {
      }
    });
  }
  
  
  
  getCurrentLocation(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        if (position) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        // this.getAddress=(this.lat,this.lng)
        console.log(position)
        this.mapsAPILoader.load().then(() => {
          const geocoder = new google.maps.Geocoder();
          const latlng = new google.maps.LatLng(this.lat, this.lng);
          this.zoom = 14;
          geocoder.geocode({ 'location': latlng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                this.currentLocation = results[0].formatted_address;
                console.log(this.currentLocation)
              } 
            }
          });
        });
      }
    })
  }}

  // getCurrentLocation( $window) {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition((p: GeolocationPosition) => {
  //       var latlng = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
  //       var geocoder = geocoder = new google.maps.Geocoder();
  //         alert(JSON.stringify(geocoder))
  //         geocoder.geocode({ 'latLng': latlng }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
  //           alert(JSON.stringify(results))
  //             if (status == google.maps.GeocoderStatus.OK) {
  //               if (results[1]) {
  //                 $window.alert(
  //                 "Location: " + results[1].formatted_address +
  //                 "\nLatitude : " + p.coords.latitude +
  //                 "\nLongitude : " + p.coords.longitude);
  //             }
  //               alert(results)
  //               this.sourceName = results[1].formatted_address;
  //               this.currLat = p.coords.latitude;
  //               this.currLng = p.coords.longitude;
  //               this.jobForm.get('userLatLong').patchValue(this.sourceName)
  //               this.latLongSourceList = [];
  //               this.latLongSourceList.push([this.currLat, this.currLng])
  //               this.latLongList.push([this.currLat, this.currLng])
  //               this.markerList = [];
  //               // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
  //               let sourceLat = this.currLat;
  //               let sourceLong = this.currLng;
  //               this.lat = sourceLat;
  //               this.lng = sourceLong;
  //               this.zoom = 13;
  //               this.markerList.push([sourceLat, sourceLong]);
  //               console.log(this.latLongSourceList)
  //               // this.setMarker()
  //             }

  //         });
  //             //  this.sourceName = results[1].formatted_address;
  //             //   this.currLat = p.coords.latitude;
  //             //   this.currLng = p.coords.longitude;

  //     });
  // } else {
  //     alert('Geo Location feature is not supported in this browser.');
  // }

  //   // if (navigator.geolocation) {
  //   //   navigator.geolocation.getCurrentPosition((position) => {
  //   //     console.log(position)
  //   //     this.defaultLocation = {
  //   //       currLat: position.coords.latitude,
  //   //       currLng: position.coords.longitude
  //   //     };
  //   //   this.setMarker()
  //   //   }, (error) => {
  //   //     console.error('Error getting user location:', error);
  //   //     // You can set a default location here in case of an error
  //   //     // For example:
  //   //     // this.defaultLocation = { latitude: 0, longitude: 0 };
  //   //   });
  //   // } else {
  //   //   console.error('Geolocation is not supported by this browser.');
  //   //   // You can set a default location here for browsers that do not support geolocation
  //   //   // For example:
  //   //   // this.defaultLocation = { latitude: 0, longitude: 0 };
  //   // }
  // }


  // get contactList() {
  //   return this.jobForm.controls["contactList"] as UntypedFormArray;
  // }


  // createContactList() {
  //   let contact = this.fb.group({
  //     orgContactSno: [null],
  //     contactSno: [null],
  //     name: [null, Validators.compose([Validators.required])],
  //     mobileNumber: [null, Validators.compose([Validators.required])],
  //   });
  //   this.contactList?.push(contact);
  // }


  // getContact() {
  //   console.log('Hiii')
  //   let param: any = {}
  //   param.orgSno = this.user.orgSno;
  //   console.log(param)
  //   this.api.get('8053/api/get_org_contact', param).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.jobContactList = result.data;
  //       if (this.jobContactList?.length) {
  //         for (let i in this.jobContactList) {
  //           this.createContactList();
  //           this.contactList.at(parseInt(i)).get('name').setValue(this.jobContactList[i].name)
  //           this.contactList.at(parseInt(i)).get('mobileNumber').setValue(this.jobContactList[i].mobileNumber)
  //         }
  //       } else {
  //         this.createContactList();
  //       }
  //       console.log(this.jobContactList)
  //     } else {

  //     }
  //   });
  // }


  // calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  //   const p: number = 0.017453292519943295;
  //   const a: number = 0.5 -
  //     Math.cos((lat2 - lat1) * p) / 2 +
  //     Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  //   return 12742 * Math.asin(Math.sqrt(a));
  // }

  clearInputField(inputFieldName: string) {
    this[inputFieldName] = '';
    this.showBlurAction = true
  }

  setMarker() {
    this.markerList = [];
    console.log(this.latLongSourceList.length > 0)
    if (this.job) {
      this.showCurrent = false;
      let sourceLat = this.job.userLocation.lat;
      let sourceLong = this.job.userLocation.lang;
      this.lat = sourceLat;
      this.lng = sourceLong;
      this.zoom = 7;
      this.markerList.push([sourceLat, sourceLong])
      console.log(this.markerList)
    }
    if (this.latLongSourceList.length > 0) {
    this.markerList = [];
      // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
      let sourceLat = this.latLongSourceList[0][0];
      let sourceLong = this.latLongSourceList[0][1];
      this.lat = sourceLat;
      this.lng = sourceLong;
      this.zoom = 13;
      this.markerList.push([sourceLat, sourceLong]);
      console.log(typeof this.markerList)
    }

    if (this.latLongSourceList.length == 0 && this.job == null) {
      this.markerList = [];
        // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
        let sourceLat = this.currLat;
        let sourceLong = this.currLng;
        this.lat = sourceLat;
        this.lng = sourceLong;
        this.zoom = 13;
        this.markerList.push([sourceLat, sourceLong]);
        console.log(this.markerList)
      }



    // let totalDistance = 0;
    // for (let l = 0; l < this.markerList.length - 1; l++) {
    //   totalDistance += 1.3 *
    //     (this.calculateDistance(
    //       this.markerList[l][0],  // assuming lat is at index 0
    //       this.markerList[l][1],  // assuming lng is at index 1
    //       this.markerList[l + 1][0],
    //       this.markerList[l + 1][1]
    //     ));
    // }
    // console.log(this.forwardDis)
    // this.forwardDis = totalDistance;
    // return totalDistance;
  }





  loadMap(inputField: any) {
    this.type = inputField;
    setTimeout(() => {
      if (this.mapInput && this.mapInput.nativeElement) {
        this.mapInput.nativeElement.focus();
      } else {
        // If mapInput is not available, you can handle it accordingly
        console.error('MapInput is not available.');
      }
    }, 50);
  }

  public handleAddressChange(address: Address) {
    this.showCurrent = false;
    console.log(address)
    if (address.geometry && address.geometry.location) {
      this.sourceMarkerLat = address.geometry.location.lat();
      this.sourceMarkerLng = address.geometry.location.lng();
      this.lat = this.sourceMarkerLat;
      this.lng = this.sourceMarkerLng;
      this.zoom = 7; // Set an appropriate zoom level
      this.sourceName = address.name
      this.sourceLocation = this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address);
      this.jobForm.get('userLatLong').patchValue(this.sourceName)
      // Clear old latLongSourceList
      this.latLongSourceList = [];
      // Set the new coordinates
      this.latLongSourceList.push([this.lat, this.lng])
      this.latLongList.push([this.lat, this.lng])
      console.log(this.latLongSourceList)
      console.log(this.latLongList)
    }
    this.setMarker();
    // this.calculateDistance(this.sourceMarkerLat, this.sourceMarkerLng)
  }

  createLocationObject(lat: number, lang: number, place: string) {
    return { lat, lang, place };
  }

}
