import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject, Subject, debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/providers/api/api.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-rent-bus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, MaterialModule, NgxMatSelectSearchModule],
  templateUrl: './rent-bus.component.html',
  styleUrls: ['./rent-bus.component.scss']
})
export class RentBusComponent implements OnInit {

  searchCity = new Subject<any>();
  searchKey: String = '';
  busList = [];
  districtBusList = [];
  vehicleList = [];
  viewBusList = [];
  via: any = [];
  tripDataList: any[];
  value: any;
  districtName: any;
  swapCitySno: number;
  sourceCitySno: number;
  destinationCitySno: number;
  source: string = '';
  destination: string = '';
  currentImage: string = '';
  mediaList: any = [];
  nextButton: boolean = true;
  preButton: boolean = false;
  isNotTripCalculate: boolean = true;
  noOfDaysBooked: number = 0;
  price: number = 0.0;
  pricePerDay: number;
  showAmenities: boolean = false;
  show: boolean = true;
  stateControlName: any;
  districtControlName: any;
  showViaRoute: boolean = false;
  formattedVideoTypes: string = '';
  formattedAudioTypes: string = '';
  formattedLightingSystem: string ='';

  count: number = 0;
  itemPerPage: any = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  // modalScrollDistance : any = 2;
  // modalScrollThrottle:any = 50;
  // isSrollDown: boolean = true;
  // isNoMoreRecord: boolean = false;

  skip: number = 0;
  limit: number = 0;
  pageSize: number = 0;
  pageIndex: number = 0;
  type: any;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  protected _onDestroy = new Subject<void>();
  isIndeterminate = false;
  isChecked = false;
  isLoading: boolean = false;
  isNoRecord: boolean = false;
  enableButton = false;

  public stateList: any = [];
  public stateTypeCtrl: FormControl = new FormControl();
  public stateTypeFilterCtrl: FormControl = new FormControl();
  public filteredStateTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public districtList: any = [];
  public districtTypeCtrl: FormControl = new FormControl();
  public districtTypeFilterCtrl: FormControl = new FormControl();
  public filteredDistrictTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  // images: string[] = [
  //   'https://swombclientblob.blob.core.windows.net/myjob/30b130dd-301a-4b42-89a3-bc45ac736fe3.jpeg',
  //   'https://swombclientblob.blob.core.windows.net/myjob/c25fdb41-5ab5-4b1c-9f92-dc4d65f3e512.jpg',
  //   'https://swombclientblob.blob.core.windows.net/myjob/22d01257-61e8-447f-a067-3418b75a7349.jpg',
  //   // Add more image URLs as needed
  // ];

  currentIndex = 0;
  // currentImage: string = this.mediaList[0]['me'];

  constructor(
    private api: ApiService,
  ) {
    this.limit = this.itemPerPage.toString().split(',')[0];
  }



  ngOnInit(): void {

    let param: any = window.history.state;

    if (param.type == 'Trip Calculate') {
      this.type = param.type
      console.log(this.type)
      this.isNotTripCalculate = false;
      console.log(param)
      this.tripDataList = param.data
      console.log(this.tripDataList)
      this.districtName = param.data[0]['sourceName']
      console.log(this.districtName)
      this.getContactCarrage();
      console.log(param.data[0]['sourceName'])
      this.calculateDateDifference();
    }

    this.getState();
    this.getDistrict();

    this.stateTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStateType();
        this.getState();

      });

    this.districtTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDistrictType();
        if (this.stateTypeCtrl.value != null && this.districtTypeCtrl.value != null) {
          this.enableButton = true;
        }
        this.getDistrict();

      });

    console.log(this.source)
    console.log(this.destination)
    if (this.districtBusList) {

    }

    // console.log(this.currentIndex)
  }


  protected filterStateType() {
    if (!this.stateList) {
      return;
    }
    let search = this.stateTypeFilterCtrl.value;
    if (!search) {
      this.filteredStateTypes.next(this.stateList.slice());
      return;
    }
    else {
      search = search?.toLowerCase();
    }
    this.filteredStateTypes.next(
      this.stateList.filter((obj) => obj.stateName?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterDistrictType() {
    if (!this.districtList) {
      return;
    }
    let search = this.districtTypeFilterCtrl.value;
    if (!search) {
      this.filteredDistrictTypes.next(this.districtList.slice());
      return;
    }
    else {
      search = search?.toLowerCase();
    }
    this.filteredDistrictTypes.next(
      this.districtList.filter((obj) => obj.districtName?.toLowerCase().indexOf(search) > -1)
    );
  }


  getState() {
    this.stateList = [];
    let param: any = { searchKey: this.searchKey };
    console.log(param);
    this.api.get('8054/api/get_state', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.stateList = result.data;
        this.filterStateType();
        console.log('cityName', this.stateList)
      } else {
        this.stateList = [];
      }
    });
  }

  getDistrict() {
    this.districtList = [];
    let param: any = { searchKey: this.searchKey };
    console.log(param);
    this.api.get('8054/api/get_district', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.districtList = result.data;
        this.filterDistrictType();
        console.log('cityName', this.districtList)
      } else {
        this.districtList = [];
      }
    });
  }


  toggleStateSelectAll(selectAllValue: boolean) {
    this.filteredStateTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let stateList = [];
          this.getState();
          for (let obj of val) {
            stateList.push(obj?.stateSno)
          }
          this.stateTypeCtrl.patchValue(stateList);
        } else {
          this.stateTypeCtrl.patchValue([]);
        }
      });
  }

  toggleDistrictTypeSelectAll(selectAllValue: boolean) {
    this.filteredDistrictTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let districtList = [];
          this.getDistrict();
          console.log(val)
          for (let obj of val) {
            districtList.push(obj?.districtSno)
          }
          this.districtTypeCtrl.patchValue(districtList);
          console.log(this.districtTypeCtrl)
        } else {
          this.districtTypeCtrl.patchValue([]);
        }
      });
  }


  // getContactCarrage() {
  //   this.districtBusList = [];
  //   let param: any = {};
  //   param.skip = this.skip
  //   param.limit = this.limit
  //   this.api.get('8058/api/get_contact_carrage', param).subscribe(result => {
  //     console.log(result)
  //     if (result != null && result.data) {
  //       this.busList = result.data;
  //       console.log(this.busList)
  //       for(let i in this.busList){
  //         console.log(this.busList[i]['districtName'])
  //         if(this.busList[i]['districtName'] == this.districtTypeCtrl.value){
  //           console.log(this.busList[i])
  //           this.districtBusList.push(this.busList[i])
  //           console.log(this.districtBusList)
  //           for(let j in this.districtBusList){
  //             console.log(this.districtBusList[0]['media'])
  //             this.mediaList = this.districtBusList[0]['media']
  //             console.log(this.mediaList)
  //             console.log(this.districtBusList[j]['media'])
  //             if(this.districtBusList[j]['media'] != null){
  //             this.currentImage = this.districtBusList[j]['media'][0]['mediaUrl'];
  //             }
  //             console.log(this.currentIndex)
  //             this.getVehicleCount();

  //           }
  //         }
  //       }
  //     } else {
  //       // this.isNoMoreRecord = true;
  //       this.busList = [];
  //     }
  //   });
  // }

  getContactCarrage() {
    this.busList = [];
    this.districtBusList = [];

    let param: any = {
      // districtSno: this.districtTypeCtrl.value,
      skip: this.skip,
      limit: this.limit
    };

    if (this.type === 'Trip Calculate') {
      param.districtName = this.districtName;
    } else {
      param.districtSno = this.districtTypeCtrl.value;
    }

    console.log(this.districtTypeCtrl.value)
    console.log(param)

    this.api.get('8058/api/get_contact_carrage', param).subscribe(result => {
      console.log(result);

      if (result != null && result.data) {
        this.busList = result.data;
        console.log(this.busList);
        console.log(this.districtName)
        this.getVehicleCount();

        // for (const bus of this.busList) {
        //   const isMatchingDistrict = bus['districtName'] === this.districtName;
        //   const isTripCalculate = this.type;
        //   console.log(isTripCalculate)
        //   console.log(this.districtName)

        //   if (isMatchingDistrict || (isTripCalculate && bus['districtName'] === this.districtName)) {
        //     console.log(bus);
        //     this.districtBusList.push(bus);
        //     console.log(this.districtBusList);

        //     // this.mediaList = this.districtBusList[0]?.media;
        //     // this.currentImage = this.mediaList?.[0]?.mediaUrl;
        //     // console.log(this.mediaList)
        //     // this.pricePerDay = this.districtBusList[0]?.pricePerDay;
        //     // console.log(this.pricePerDay);
        //     // console.log(this.currentIndex);

        //   }
        //   this.getVehicleCount();
        // }

        // if(this.type == 'Trip Calculate'){
        //   console.log(param.type)
        //   this.approxPrice();
        // }
      } else {
        this.busList = [];
      }
    });
  }

  getVehicleCount() {
    let param: any = {};
    
    if (this.type === 'Trip Calculate') {
      param.districtName = this.districtName;
    } else {
      param.districtSno = this.districtTypeCtrl.value;
    }
    // for(let i in this.busList){
    //   param.districtSno = this.busList[i].districtSno;
    // }
    console.log(param)
    this.api.get("8058/api/get_vehicle_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
            console.log(this.count)
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

  getViewBus(i?: any) {
    this.currentIndex = 0;
    this.viewBusList = [];
    this.viewBusList.push(this.busList[i])
    console.log(this.viewBusList)
    this.mediaList = this.busList[i]?.media;
    this.pricePerDay = this.busList[i]?.pricePerDay;
    this.currentImage = this.mediaList?.[0]?.mediaUrl;
    console.log(this.currentImage)
    console.log(this.pricePerDay)
    console.log(this.busList[i].videoTypeName);
    this.formattedVideoTypes = this.busList[i].videoTypeName.map(video => video.videoType).join(', ');
    this.formattedAudioTypes = this.busList[i].audioTypeName.map(audio => audio.audioType).join(', ');
    this.formattedLightingSystem = this.busList[i].lightingSystemName.map(lightSystem => lightSystem.lightingSystem).join(', ');
    if (this.type == 'Trip Calculate') {
      this.approxPrice();
    }

  }

  nextImage() {
    console.log(this.currentIndex)
    console.log(this.mediaList.length)
    console.log(this.currentIndex < this.mediaList.length - 1)
    if (this.currentIndex <= this.mediaList.length - 1) {
      this.currentIndex = (this.currentIndex + 1) % this.mediaList.length;
      this.currentImage = this.mediaList[this.currentIndex]['mediaUrl'];
      console.log(this.currentImage)
    }

  }

  preImage() {
    console.log(this.currentIndex)
    if (this.currentIndex > 0) {
      this.currentIndex = (this.currentIndex - 1) % this.mediaList.length;
      this.currentImage = this.mediaList[this.currentIndex]['mediaUrl'];
      console.log(this.currentImage)
    }

  }

  getMoreCity(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      // for(let i = 0 ; i < this.districtBusList.length; i-= this.pageSize){
      //   this.vehicleList.push(this.districtBusList.slice(i, i - this.pageSize));
      // }
      this.getContactCarrage();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      // for(let j = 0 ; j < this.districtBusList.length; j+= this.pageSize){
      //   this.vehicleList.push(this.districtBusList.slice(j, j + this.pageSize));
      // }
      this.getContactCarrage();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.districtBusList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.districtBusList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getContactCarrage();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  calculateDateDifference() {
    const start = new Date(this.tripDataList[0].tripStartingDate);
    const end = new Date(this.tripDataList[0].tripEndDate);
    if (this.tripDataList[0].tripEndDate) {
      const timeDifference = end.getTime() - start.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
      this.noOfDaysBooked = daysDifference;
      console.log(this.noOfDaysBooked)
    }
  }

  approxPrice() {
    const kms = this.tripDataList[1].totalKm
    this.price = (kms * this.pricePerDay) / 400;
    console.log(this.price)
  }

  viewAmenities() {
    this.showAmenities = true;
    this.show = false;
  }

  closeAmenities() {
    this.showAmenities = false;
    this.show = true;
  }

  onStateTypeChange(event: any) {
    const stateSno = this.stateTypeCtrl.value;
    // Assuming this is your array of city objects
    const state = this.stateList.find(state => state.stateSno === stateSno);
    if (state) {
      this.stateControlName = state.stateName;
      console.log('Selected State Name:', this.stateControlName);
      // Do something with the cityName
    } else {
      console.log('State not found in the array.');
    }
  }

  onDistTypeChange(event: any) {
    this.skip = 0
    this.pageSize  = 0;
    this.pageIndex  = 0;
    // this.districtControlName = this.districtTypeCtrl.value;
    const districtSno = this.districtTypeCtrl.value;

    // Assuming this is your array of city objects
    const district = this.districtList.find(district => district.districtSno === districtSno);

    if (district) {
      this.districtName = district.districtName;
      console.log('Selected City Name:', this.districtName);
      // Do something with the cityName
    } else {
      console.log('City not found in the array.');
    }
  }

  showVia(type: any) {
    if (type === 'show') {
      this.showViaRoute = true;
    } else {
      this.showViaRoute = false;
    }

  }


}
