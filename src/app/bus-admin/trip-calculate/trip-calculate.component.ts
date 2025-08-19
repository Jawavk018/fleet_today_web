import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { ApiService } from 'src/app/providers/api/api.service';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { AgmDirectionModule } from 'agm-direction';
import * as moment from 'moment-timezone'


declare const google: any;

@Component({
  selector: 'app-trip-calculate',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GooglePlaceModule, AgmCoreModule, MatSlideToggleModule, ConfirmDialogModule, AgmDirectionModule],
  templateUrl: './trip-calculate.component.html',
  //   template: `
  //   <agm-map [latitude]="chennaiLat" [longitude]="chennaiLng" [zoom]="zoom">
  //     <!-- Markers for source and destination -->
  //     <agm-marker [latitude]="chennaiLat" [longitude]="chennaiLng"></agm-marker>
  //     <agm-marker [latitude]="maduraiLat" [longitude]="maduraiLng"></agm-marker>

  //     <!-- Polylines for the routes -->
  //     <agm-polyline *ngFor="let route of routes" [editable]="false" [visible]="true" [strokeColor]="'#FF5733'" [strokeWeight]="5">
  //       <agm-polyline-point *ngFor="let point of route" [latitude]="point.lat" [longitude]="point.lng">
  //       </agm-polyline-point>
  //     </agm-polyline>
  //   </agm-map>
  // `,
  styleUrls: ['./trip-calculate.component.scss']
})
export class TripCalculateComponent implements OnInit {

  @ViewChild('mapInput', { static: false }) mapInput: ElementRef;
  @ViewChild('cardMapInput', { static: false }) cardMapInput: ElementRef;


  public tripForm: FormGroup;

  lat: number;
  lng: number;
  sourceMarkerLat: number;
  sourceMarkerLng: number;
  destMarkerLat: number;
  destMarkerLng: number;
  viaMarkerLat: number;
  returnViaMarkerLat: number;
  viaMarkerLng: number;
  returnViaMarkerLng: number;
  returnDestMarkerLat: number;
  returnDestMarkerLng: number;
  selectedReturnTypeCd: any;
  forwardDis: number
  returnDis: number
  sourceName: any;
  inputValue1: string;
  inputValue2: string;
  destinationName: any;
  returnDestinationName: any;
  viaName: any;
  returnViaName: any;
  type: any
  viaNameAlphList: any;
  returnViaNameAlphList: any;
  sourceLocation = {};
  destinationLocation = {};
  returnDestinationLocation = {};
  trip = {}
  viaLocation = [];
  latLongSourceList: any[] = [];
  latLongDestList: any[] = [];
  returnLatLongDestList: any[] = [];
  returnLatLongList = [];
  latLongList = [];
  viaLatLongList = [];
  returnViaLatLongList = [];
  markerList = [];
  ReturnMarkerList = [];
  returnTypeList: any = [];
  busList = [];
  districtBusList = [];
  mediaList: any = [];
  viaNameList: any = [];
  returnViaNameList = []
  alphabetList: string[] = [];
  mapLoaded: boolean = false;
  checked: boolean = false;
  disabled: boolean = false;
  showExtraFields: boolean = false;
  isReturnTrip: boolean = false;
  defaultReturnTypeCd: boolean = true
  showBlurAction: boolean = false
  istripEndDateValid: boolean = false;
  showCurrent: boolean = true;

  showViaButton: boolean = false;

  viaMarkerIconUrl: string = 'assets/img/bus-stops.png';
  returnViaMarkerIconUrl: string = 'assets/img/bus-stop.png';
  today = moment().format('yyyy-MM-DD HH:mm')
  dueDate = moment(this.today).format('yyyy-MM-DD HH:mm')
  zoom = 12
  center: google.maps.LatLngLiteral

  chennaiLat = 13.07153;
  chennaiLng = 80.1963876;
  maduraiLat = 10.8505;
  maduraiLng = 76.2711;
  // zoom = 7;
  routes: { lat: number; lng: number }[][] = [];

  // options: google.maps.MapOptions = {
  //   mapTypeId: 'hybrid',
  //   zoomControl: false,
  //   scrollwheel: false,
  //   disableDoubleClickZoom: true,
  //   maxZoom: 15,
  //   minZoom: 8,
  // }
  option = {
    types: [],
    componentRestrictions: { country: 'IN' }
  }

  constructor(
    public fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
  ) {
    // if (navigator) {
    //   navigator.geolocation.getCurrentPosition(pos => {
    //     this.lat = +pos.coords.latitude;
    //     this.lng = +pos.coords.longitude;
    //     console.log(this.lat)
    //     console.log(this.lng)
    //   });
    // }
    
  }


  ngOnInit(): void {

    this.lat = 13.07153;
    this.lng = 80.1963876;

    // this.calculateRoutes();

    this.getTripType();

    this.selectedReturnTypeCd = this.returnTypeList[0]?.codesDtlSno;
    this.tripForm = this.fb.group({
      returnTypeCd: [72],
      tripSource: ['', Validators.required],
      tripStartingDate: new FormControl('', [Validators.required]),
      tripEndDate: new FormControl('', [Validators.required]),
      // tripDestination: ['', Validators.required],
      tripDestination: [null],
      // tripVia: new FormControl('', [Validators.required]),
      tripVia: [null],
      isReturnTrip: [false],
      returnDestination: [null],
      returnTripVia: [null]
    });
    // console.log(this.selectedReturnTypeCd)

  }
  
  // calculateRoutes() {
  //   const directionsService = new google.maps.DirectionsService();

  //   const request = {
  //     origin: new google.maps.LatLng(this.chennaiLat, this.chennaiLng),
  //     destination: new google.maps.LatLng(this.maduraiLat, this.maduraiLng),
  //     travelMode: google.maps.TravelMode.DRIVING,
  //     provideRouteAlternatives: true,  // Request alternative routes
  //   };

  //   directionsService.route(request, (result, status) => {
  //     if (status === google.maps.DirectionsStatus.OK) {
  //       // Extract and convert each alternative route
  //       this.routes = result.routes.map(route => 
  //         route.overview_path.map(point => ({ lat: point.lat(), lng: point.lng() }))
  //       );
  //     } else {
  //       console.error('Error fetching directions:', status);
  //     }
  //   });
  // }

  public getTripType() {
    let param: any = { codeType: 'return_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {

      if (result != null && result.data) {
        this.returnTypeList = result.data;
        this.selectedReturnTypeCd = this.returnTypeList[0]?.codesDtlSno
        if(this.selectedReturnTypeCd == 72){
          this.tripForm.get('tripDestination').addValidators(Validators.required);
        }
      } else {

      }
    });
  }

  createLocationObject(lat: number, lang: number, place: string) {
    return { lat, lang, place };
  }

  public handleAddressChange(address: Address, type: any) {
    this.showCurrent = false;
    if (type == 'tripSource') {
      if (address.geometry && address.geometry.location) {
        this.sourceMarkerLat = address.geometry.location.lat();
        this.sourceMarkerLng = address.geometry.location.lng();
        this.lat = this.sourceMarkerLat;
        this.lng = this.sourceMarkerLng;
        this.zoom = 7; // Set an appropriate zoom level
        this.sourceName = address.name
        this.sourceLocation = this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address);
        this.tripForm.get('tripSource').patchValue(this.sourceName)
        // Clear old latLongSourceList
        this.latLongSourceList = [];
        // Set the new coordinates
        this.latLongSourceList.push([this.lat, this.lng])
        this.latLongList.push([this.lat, this.lng])
      }
      this.setMarker();
    }
    if (type == 'tripDestination') {
      if (address.geometry && address.geometry.location) {
        this.destMarkerLat = address.geometry.location.lat();
        this.destMarkerLng = address.geometry.location.lng();
        this.lat = this.destMarkerLat;
        this.lng = this.destMarkerLng;
        this.zoom = 7; // Set an appropriate zoom level
        this.destinationName = address.name
        this.destinationLocation = this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address);
        this.tripForm.get('tripDestination').patchValue(this.destinationName)
        // Clear old latLongSourceList
        this.latLongDestList = [];
        // Set the new coordinates
        this.latLongDestList.push([this.lat, this.lng])
        this.latLongList.push([this.lat, this.lng])
      }
      this.setMarker();
    }

    if (type === 'tripVia' || type === 'returnTripVia') {
      if (type === 'tripVia' && this.selectedReturnTypeCd == 72) {
        if (address.geometry && address.geometry.location) {
          // if (this.viaLatLongList.length === 0) {
          //   this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
          // }
          this.viaMarkerLat = address.geometry.location.lat();
          this.viaMarkerLng = address.geometry.location.lng();
          this.lat = this.viaMarkerLat;
          this.lng = this.viaMarkerLng;
          this.zoom = 7; // Set an appropriate zoom level
          this.viaName = address.name;
          this.viaLocation.push(this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address));
          if ((this.viaLatLongList.length > 0) || (this.viaLatLongList.length === 0)) {
            this.viaLatLongList.push([this.lat, this.lng]);
            this.viaNameList.push({ vaiName: this.viaName, viaLatLng: [this.lat, this.lng] })
            const viaNameString = this.viaNameList.map(via => via.vaiName).join(', ');
            this.tripForm.get('tripVia').setValue(viaNameString);
          }
        }
        this.setMarker();
        this.addViaNameList();
        this.showViaButton = false;
      } 
      if (type === 'tripVia' && this.selectedReturnTypeCd == 73) {
        if (address.geometry && address.geometry.location) {
          // if (this.viaLatLongList.length === 0) {
          //   this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
          // }
          this.viaMarkerLat = address.geometry.location.lat();
          this.viaMarkerLng = address.geometry.location.lng();
          this.lat = this.viaMarkerLat;
          this.lng = this.viaMarkerLng; 
          this.zoom = 7; // Set an appropriate zoom level
          this.viaName = address.name;
          this.viaLocation.push(this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address));
          if ((this.viaLatLongList.length > 0) || (this.viaLatLongList.length === 0)) {
            this.viaLatLongList.push([this.lat, this.lng]);
            this.viaNameList.push({ vaiName: this.viaName, viaLatLng: [this.lat, this.lng] })
            const viaNameString = this.viaNameList.map(via => via.vaiName).join(', ');
            this.tripForm.get('tripVia').setValue(viaNameString);
            console.log(this.viaNameList)
          }
        }
        this.setRoundTripMarker();
        this.addViaNameList();
        this.showViaButton = false;

      }
      // else {
      //   if (address.geometry && address.geometry.location) {

      //     this.returnViaMarkerLat = address.geometry.location.lat();
      //     this.returnViaMarkerLng = address.geometry.location.lng();
      //     this.lat = this.returnViaMarkerLat;
      //     this.lng = this.returnViaMarkerLng;
      //     this.zoom = 7; // Set an appropriate zoom level
      //     this.returnViaName = address.name;
      //     // this.tripForm.get('tripVia').patchValue(this.viaName);
      //     this.viaLocation.push(this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address));
      //     if ((this.returnViaLatLongList.length > 0) || (this.returnViaLatLongList.length === 0)) {
      //       this.returnViaLatLongList.push([this.lat, this.lng]);
      //       // this.returnViaNameList.push(this.returnViaName)
      //       this.returnViaNameList.push({ vaiName: this.returnViaName, viaLatLng: [this.lat, this.lng] })
      //       const viaNameString = this.returnViaNameList.map(via => via.vaiName).join(', ');
      //       this.tripForm.get('returnTripVia').setValue(viaNameString);
      //     }
      //   }
      //   this.setReturnViaMarker();
      //   this.addReturnViaNameList();
      //   this.showViaButton = false;
      // }
    }

    if (type == 'returnDestination') {
      if (address.geometry && address.geometry.location) {
        this.returnDestMarkerLat = address.geometry.location.lat();
        this.returnDestMarkerLng = address.geometry.location.lng();
        // Center the map on the marker
        this.lat = this.returnDestMarkerLat;
        this.lng = this.returnDestMarkerLng;
        this.zoom = 7; // Set an appropriate zoom level
        this.returnDestinationName = address.name
        this.tripForm.get('returnDestination').patchValue(this.returnDestinationName)
        this.returnDestinationLocation = this.createLocationObject(address.geometry.location.lat(), address.geometry.location.lng(), address.formatted_address);
        // Clear old latLongSourceList
        this.returnLatLongList = [];
        // Set the new coordinates
        this.returnLatLongDestList.push([this.lat, this.lng])
        this.returnLatLongList.push([this.lat, this.lng])
      }
      this.setReturnViaMarker();
    }

    this.calculateDistance(this.sourceMarkerLat, this.sourceMarkerLng, this.destMarkerLat, this.destMarkerLng)
  }

  setMarker() {
    this.markerList = [];

    if (this.latLongSourceList.length > 0) {
      // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
      let sourceLat = this.latLongSourceList[0][0];
      let sourceLong = this.latLongSourceList[0][1];
      this.markerList.push([sourceLat, sourceLong]);

    }
    // Via Markers
    for (let i = 0; i < this.viaLatLongList.length; i++) {
      let viaLat = this.viaLatLongList[i][0];
      let viaLong = this.viaLatLongList[i][1];
      this.markerList.push([viaLat, viaLong]);
    }

    // Destination Marker
    if (this.latLongDestList.length > 0) {
      let destLat = this.latLongDestList[0][0];
      let destLong = this.latLongDestList[0][1];
      this.markerList.push([destLat, destLong]);
    }

    let totalDistance = 0;
    for (let l = 0; l < this.markerList.length - 1; l++) {
      totalDistance += 1.3 *
        (this.calculateDistance(
          this.markerList[l][0],  // assuming lat is at index 0
          this.markerList[l][1],  // assuming lng is at index 1
          this.markerList[l + 1][0],
          this.markerList[l + 1][1]
        ));
    }
    console.log(this.forwardDis)
    this.forwardDis = totalDistance;
    return totalDistance;
  }

  setRoundTripMarker() {
    this.markerList = [];

    if (this.latLongSourceList.length > 0) {
      // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
      let sourceLat = this.latLongSourceList[0][0];
      let sourceLong = this.latLongSourceList[0][1];
      this.markerList.push([sourceLat, sourceLong]);

    }
    // Via Markers
    for (let i = 0; i < this.viaLatLongList.length; i++) {
      let viaLat = this.viaLatLongList[i][0];
      let viaLong = this.viaLatLongList[i][1];
      this.markerList.push([viaLat, viaLong]);
    }

    // Destination Marker
    // if (this.latLongDestList.length > 0) {
    //   let destLat = this.latLongDestList[0][0];
    //   let destLong = this.latLongDestList[0][1];
    //   this.markerList.push([destLat, destLong]);
    // }
    if (this.latLongSourceList.length > 0) {
      // this.viaLatLongList.push([this.sourceMarkerLat, this.sourceMarkerLng]);
      let sourceLat = this.latLongSourceList[0][0];
      let sourceLong = this.latLongSourceList[0][1];
      this.markerList.push([sourceLat, sourceLong]);

    }

    let totalDistance = 0;
    for (let l = 0; l < this.markerList.length - 1; l++) {
      totalDistance += 1.3 *
        (this.calculateDistance(
          this.markerList[l][0],  // assuming lat is at index 0
          this.markerList[l][1],  // assuming lng is at index 1
          this.markerList[l + 1][0],
          this.markerList[l + 1][1]
        ));
    }
    console.log(this.forwardDis)
    this.forwardDis = totalDistance;
    return totalDistance;
  }

  setReturnViaMarker() {
    // Clear previous markers and polyline
    this.ReturnMarkerList = [];

    if (this.latLongDestList.length > 0) {
      let destLat = this.latLongDestList[0][0];
      let destLong = this.latLongDestList[0][1];
      this.ReturnMarkerList.push([destLat, destLong]);
    }

    // Via Markers
    for (let i = 0; i < this.returnViaLatLongList.length; i++) {
      let viaLat = this.returnViaLatLongList[i][0];
      let viaLong = this.returnViaLatLongList[i][1];
      this.ReturnMarkerList.push([viaLat, viaLong]);
    }

    // Destination Marker
    if (this.returnLatLongList.length > 0) {
      let destLat = this.returnLatLongList[0][0];
      let destLong = this.returnLatLongList[0][1];
      this.ReturnMarkerList.push([destLat, destLong]);
    }

    let totalDistance = 0;
    for (let l = 0; l < this.ReturnMarkerList.length - 1; l++) {
      totalDistance += 1.3 *
        (this.calculateDistance(
          this.ReturnMarkerList[l][0],  // assuming lat is at index 0
          this.ReturnMarkerList[l][1],  // assuming lng is at index 1
          this.ReturnMarkerList[l + 1][0],
          this.ReturnMarkerList[l + 1][1]
        ));
    }
    this.returnDis = totalDistance;
    return totalDistance;
  }

  handleBlur() {
    // Handle the blur event (optional)
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


  loadViaMap(inputField: any) {
    this.type = inputField
  }

  clearInputField(inputFieldName: string) {
    this[inputFieldName] = '';
    this.showBlurAction = true
  }

  clearViaInputField(inputFieldName: string) {
    this[inputFieldName] = '';
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const p: number = 0.017453292519943295;
    const a: number = 0.5 -
      Math.cos((lat2 - lat1) * p) / 2 +
      Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }

  goToSearch() {
    const body = {
      data: []
    };

    const trip = {
      tripStartingDate: this.tripForm.value.tripStartingDate,
      tripEndDate: this.tripForm.value.tripEndDate,
      tripSource: this.sourceLocation,
      tripDestination: this.destinationLocation,
      tripVia: this.viaLocation,
      isSameRoute: this.isReturnTrip,
      returnTypeCd: this.tripForm.value.returnTypeCd,
      totalKm: this.forwardDis,
      // customerSno: user.appUserSno, // Assuming user is defined somewhere
      sourceLocation: this.sourceLocation,
      destinationLocation: this.destinationLocation,
      sourceName: this.sourceName,
      destinationName: this.destinationName,
      viaNames: this.viaNameList
    };

    body.data.push(trip);

    if (this.selectedReturnTypeCd == 73) {
      if (this.isReturnTrip) {
        const data = {
          tripStartingDate: this.tripForm.value.tripStartingDate,
          tripEndDate: this.tripForm.value.tripEndDate,
          tripSource: this.destinationLocation,
          tripDestination: this.sourceLocation,
          tripVia: this.viaLocation,
          isSameRoute: this.isReturnTrip,
          returnTypeCd: this.tripForm.value.returnTypeCd,
          totalKm: this.returnDis + this.forwardDis,
          // customerSno: user.appUserSno,
          sourceLocation: this.sourceLocation,
          destinationLocation: this.destinationLocation,
          returnDestLocation: this.returnDestinationLocation,
          sourceName: this.sourceName,
          destinationName: this.destinationName,
          returnDestinationName: this.returnDestinationName,
          viaNames: this.viaNameList
        };

        body.data.push(data);
      } else {
        const data = {
          tripStartingDate: this.tripForm.value.tripStartingDate,
          tripEndDate: this.tripForm.value.tripEndDate,
          tripSource: this.destinationLocation,
          tripDestination: this.sourceLocation,
          tripVia: this.viaLocation,
          isSameRoute: this.isReturnTrip,
          returnTypeCd: this.tripForm.value.returnTypeCd,
          totalKm: this.forwardDis,
          // customerSno: user.appUserSno,
          sourceLocation: this.sourceLocation,
          destinationLocation: this.destinationLocation,
          returnDestLocation: this.returnDestinationLocation,
          sourceName: this.sourceName,
          destinationName: this.destinationName,
          returnDestinationName: this.destinationName,
          viaNames: this.viaNameList
        };

        body.data.push(data);
      }
    } else if (this.selectedReturnTypeCd == 72) {
      body.data.push(trip);
    }

    console.log(body);

    try {
      this.api.post('8058/api/insert_rent_bus', body).subscribe(result => {
        if (result != null && result.data) {
          this.router.navigate(['/rent-bus'], { state: { data: body['data'], type: 'Trip Calculate' } });
        } else {
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  onReturnTypeCdChange(returnTypeCd: any) {
    this.selectedReturnTypeCd = returnTypeCd;
    // this.tripForm.get('returnTypeCd')
    this.clearMarker();
    if(returnTypeCd == 72){
      this.tripForm.get('tripDestination').addValidators(Validators.required);
      this.tripForm.get('tripDestination').updateValueAndValidity();
    }else{
      this.tripForm.get('tripDestination').clearValidators();
      this.tripForm.get('tripDestination').updateValueAndValidity();

    }
  }


  selecReturn(checked: boolean) {
    // Handle the delete action here based on the value of `checked`
    if (checked) {
      let confirmText = "Are you sure want to Return via same route ? ";
      this.confirmDialogService.confirmThis(confirmText, () => {
        this.isReturnTrip = false;
        this.showExtraFields = false;
      }, () => {
        this.showExtraFields = true;
        this.isReturnTrip = true;
      });
    } else {
      this.isReturnTrip = false;
      this.showExtraFields = false;
      this.ReturnMarkerList = [];
      this.returnLatLongList = [];
      this.returnViaLatLongList = [];
      this.returnViaNameAlphList = [];
      this.returnViaNameList = [];
      this.tripForm.get('returnDestination').setValue('');
      this.tripForm.get('returnTripVia').setValue('');
    }

  }

  addViaNameList() {
    this.viaNameAlphList = [];
    this.trip = {}
    for (let i = 0; i < this.viaNameList.length; i++) {
      const viaName = this.viaNameList[i]['vaiName'];
      const latLang = this.viaNameList[i]['viaLatLng'];
      const alphabet = String.fromCharCode(66 + i);
      this.trip = {
        viaLocation: viaName,
        index: alphabet,
        viaLatLng: latLang // Create a shallow copy of the array
      };
      this.viaNameAlphList.push(this.trip);
    }
  }

  addReturnViaNameList() {
    this.returnViaNameAlphList = [];
    this.trip = {}
    for (let i = 0; i < this.returnViaNameList.length; i++) {
      const viaName = this.returnViaNameList[i]['vaiName'];
      const latLang = this.returnViaNameList[i]['viaLatLng'];
      const alphabet = String.fromCharCode(66 + i);
      this.trip = {
        viaLocation: viaName,
        index: alphabet,
        viaLatLng: latLang // Create a shallow copy of the array
      };
      this.returnViaNameAlphList.push(this.trip);
    }
  }

  removeVia(via: any, i: number) {
    let viaNames = [];
    for (let j = 0; j < this.viaLatLongList.length; j++) {
      if (
        via['viaLatLng'][0] === this.viaLatLongList[j][0] &&
        via['viaLatLng'][1] === this.viaLatLongList[j][1]
      ) {
        this.viaLatLongList.splice(j, 1);
        if(this.type === 'tripVia' && this.selectedReturnTypeCd == 72){
          this.setMarker();  
        }else{
          this.setRoundTripMarker();  
        }
      } else {
      }
    }
    this.viaNameAlphList.splice(i, 1);
    this.viaNameList.splice(i, 1);
    for (let j = 0; j < this.viaNameAlphList.length; j++) {
      const viaLocation = this.viaNameAlphList[j]['viaLocation'];
      // Push each viaLocation to the viaNames array
      viaNames.push(viaLocation);
    }
    const viaNameString = viaNames.join(', ');
    // Update the tripVia control with the concatenated viaNameString
    this.tripForm.get('tripVia').setValue(viaNameString);
  }

  removeReturnVia(via: any, i: number) {
    let viaNames = [];
    for (let j = 0; j < this.returnViaLatLongList.length; j++) {
      if (
        via['viaLatLng'][0] === this.returnViaLatLongList[j][0] &&
        via['viaLatLng'][1] === this.returnViaLatLongList[j][1]
      ) {
        this.returnViaLatLongList.splice(j, 1);
        this.setReturnViaMarker();
      } else {
      }
    }
    this.returnViaNameAlphList.splice(i, 1);
    this.returnViaNameList.splice(i, 1);
    for (let j = 0; j < this.returnViaNameAlphList.length; j++) {
      const viaLocation = this.returnViaNameAlphList[j]['viaLocation'];
      // Push each viaLocation to the viaNames array
      viaNames.push(viaLocation);
    }
    const viaNameString = viaNames.join(', ');
    // Update the returnTripVia control with the concatenated viaNameString
    this.tripForm.get('returnTripVia').setValue(viaNameString);
  }

  onDateTimeChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      // Extract the date and time from the input value
      const dateTime = new Date(inputElement.value);
      // Set the time interval you want (e.g., 30 minutes)
      const intervalMinutes = 30;
      // Round the minutes to the nearest interval
      const roundedMinutes = Math.round(dateTime.getMinutes() / intervalMinutes) * intervalMinutes;
      dateTime.setMinutes(roundedMinutes);
      // Update the input value with the rounded time
      const formattedDateTime = dateTime.toISOString().slice(0, 16);
      inputElement.value = formattedDateTime;
    }
  }

  dateChange() {
    this.dueDate = moment(this.tripForm.value.tripStartingDate).format('yyyy-MM-DD HH:mm')
  }

  getViaMarkerIcon(index: number): string {
    if (index === 0) {
      return ''; // Replace with the actual URL of the icon for the first marke
    } else if (index === this.markerList.length - 1) {
      return '';
    } else {
      return this.selectedReturnTypeCd === 72 ? this.viaMarkerIconUrl : this.returnViaMarkerIconUrl; // Replace with the actual URL of the icon for other markers
    }
  }

  getReturnViaMarkerIcon(index: number): string {
    if (index === 0) {
      return ''; // Replace with the actual URL of the icon for the first marker
    } else if (index === this.ReturnMarkerList.length - 1) {
      return '';
    } else {
      return this.returnViaMarkerIconUrl; // Replace with the actual URL of the icon for other markers
    }
  }

  showAddVia(inputField: any, inputFieldName: string) {
    this.type = inputField;

    setTimeout(() => {
      console.log('After 1 second delay');
      console.log(this.type);

      if (this.cardMapInput && this.cardMapInput.nativeElement) {
        this.cardMapInput.nativeElement.focus();
        console.log('cardMapInput:', this.cardMapInput);
      } else {
        // If mapInput is not available, you can handle it accordingly
        console.error('cardMapInput is not available.');
      }
    }, 50);
    if (this.type == 'tripVia' || this.type == 'returnTripVia') {
      this.showViaButton = true;
      this[inputFieldName] = '';
    }

  }

  closeSearchBox() {
    this.showViaButton = false;
  }

  clearMarker() {
    this.latLongList = [];
    this.latLongSourceList = [];
    this.latLongDestList = [];
    this.markerList = [];
    this.viaNameList = [];
    this.viaNameAlphList = [];
    this.viaLatLongList = [];
    this.tripForm.get('tripSource').setValue('');
    this.tripForm.get('tripDestination').setValue('');
    this.tripForm.get('tripVia').setValue('');
    this.tripForm.get('tripStartingDate').setValue('');
    this.tripForm.get('tripEndDate').setValue('');
  }

  

}
