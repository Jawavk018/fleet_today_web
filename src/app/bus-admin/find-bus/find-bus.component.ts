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
  selector: 'app-find-bus',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, MaterialModule, NgxMatSelectSearchModule],
  templateUrl: './find-bus.component.html',
  styleUrls: ['./find-bus.component.scss']
})
export class FindBusComponent implements OnInit {

  searchCity = new Subject<any>();
  searchKey: String = '';
  cityRouteList = [];
  value:any;
  source: string = '';
  destination: string = '';
  sourceCitySno: any;
  destinationCitySno: any
  sourceCityName: any;
  destCityName: any;
  show: boolean = false;
  isFormFieldDisabled = true;
  enableButton = false;
  count: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  pageSize: number = 0;
  pageIndex: number = 0;
  @ViewChild(MatPaginator) paginator: any = MatPaginator;


  protected _onDestroy = new Subject<void>();
  isIndeterminate = false;
  isChecked = false;
  isLoading: boolean = false;
  isNoRecord: boolean = false;
  public cityList: any = [];
  public viaList: any = [];
  
  public sourceTypeCtrl: FormControl = new FormControl();
  public sourceTypeFilterCtrl: FormControl = new FormControl();
  public filteredSourceTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public destinationTypeCtrl: FormControl = new FormControl();
  public destinationTypeFilterCtrl: FormControl = new FormControl();
  public filteredDestinationTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public viaTypeCtrl: FormControl = new FormControl();
  public viaTypeFilterCtrl: FormControl = new FormControl();
  public filteredVaiTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  constructor(
    private api: ApiService,
  ) { 
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit(): void {

      this.getCity();

      this.sourceTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSourceType();
        this.getCity();

      });

      this.destinationTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDestType();
        this.getCity();
        // this.getViaCity();
        if(this.sourceTypeCtrl.value != null && this.destinationTypeCtrl.value != null){
          this.isFormFieldDisabled = false;
          this.enableButton = true;
          this.getViaCity();
        }
      });

      this.viaTypeFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterViaType();
        this.getViaCity();

      });

      console.log(this.source)
      console.log(this.destination)

      
  }
  
  protected filterSourceType() {
    if (!this.cityList) {
      return;
    }
    let search = this.sourceTypeFilterCtrl.value;
    if (!search) {
      this.filteredSourceTypes.next(this.cityList.slice());
      return;
    }
     else {
      search = search?.toLowerCase();
    }
    this.filteredSourceTypes.next(
      this.cityList.filter((obj) => obj.cityName?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterDestType() {
    if (!this.cityList) {
      return;
    }
    let search = this.destinationTypeFilterCtrl.value;
    if (!search) {
      this.filteredDestinationTypes.next(this.cityList.slice());
      return;
    }
     else {
      search = search?.toLowerCase();
    }
    this.filteredDestinationTypes.next(
      this.cityList.filter((obj) => obj.cityName?.toLowerCase().indexOf(search) > -1)
    );
  }

  protected filterViaType() {
    if (!this.viaList) {
      return;
    }
    let search = this.viaTypeFilterCtrl.value;
    if (!search) {
      this.filteredVaiTypes.next(this.viaList.slice());
      return;
    }
     else {
      search = search?.toLowerCase();
    }
    this.filteredVaiTypes.next(
      this.viaList.filter((obj) => obj.viaName?.toLowerCase().indexOf(search) > -1)
    );
  }


  getCity() {
    this.cityList = [];
    let param: any = { searchKey:this.searchKey };
    console.log(param);
    this.api.get('8054/api/get_city', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.cityList = result.data;
        this.filterDestType();
        this.filterSourceType();
        console.log('cityName', this.cityList)
      } else {
        this.cityList = [];
      }
    });
  }

  getViaCity() {
    this.viaList = [];
    let param: any = { sourceCitySno: this.sourceTypeCtrl.value, destinationCitySno: this.destinationTypeCtrl.value };
    console.log(param);
    this.api.get('8054/api/get_via_route', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.viaList = result.data;
        this.filterViaType();
        console.log('viaList', this.viaList)
      } else {
        this.viaList = [];
      }
    });
  }

 
  toggleSourceTypeSelectAll(selectAllValue: boolean) {
    this.filteredSourceTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let cityList = [];
          this.getCity();
          for (let obj of val) {
            cityList.push(obj?.citySno)
          }
          this.sourceTypeCtrl.patchValue(cityList);
        } else {
          this.sourceTypeCtrl.patchValue([]);
        }
      });
  }

  toggleDestiTypeSelectAll(selectAllValue: boolean) {
    this.filteredDestinationTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let cityList = [];
          this.getCity();
          for (let obj of val) {
            cityList.push(obj?.citySno)
          }
          this.destinationTypeCtrl.patchValue(cityList);
        } else {
          this.destinationTypeCtrl.patchValue([]);
        }
      });
  }

  toggleViaTypeSelectAll( selectAllValue: boolean){
    this.filteredVaiTypes
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (selectAllValue) {
          let viaList = [];
          this.getViaCity();
          for (let obj of val) {
            viaList.push(obj?.viaSno)
          }
          this.viaTypeCtrl.patchValue(viaList);
        } else {
          this.viaTypeCtrl.patchValue([]);
        }
      });

  }

  getRouteCity() {
    this.getRouteCount();
    let param: any = {  };
      param.skip = this.skip
      param.limit = this.limit

    param.createdOn = 'Asia/Kolkata';
    if (this.sourceTypeCtrl.value && this.sourceTypeCtrl.value != '') {
      param.sourceCitySno = JSON.stringify(this.sourceTypeCtrl.value);
    }
    if (this.destinationTypeCtrl.value && this.destinationTypeCtrl.value != '') {
      param.destinationCitySno = this.destinationTypeCtrl.value;
    }
    if (this.viaTypeCtrl.value && this.viaTypeCtrl.value != '') {
      param.viaCitySno =  '{' + this.viaTypeCtrl.value + '}';

    }
    console.log(param)
    this.api.get('8054/api/get_city_bus', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        
        this.cityRouteList = result.data;
        console.log('cityName', this.cityRouteList)
        this.show = true;
      } else {
        this.cityRouteList = [];
      }
    });
  }

  SwappingSourDest() {
    if(this.sourceTypeCtrl.value!= null && this.destinationTypeCtrl.value != null){
      let swapValues : any = this.sourceTypeCtrl.value;
      this.sourceTypeCtrl.setValue(this.destinationTypeCtrl.value)
      this.destinationTypeCtrl.setValue(swapValues)

      const sourceCity = this.cityList.find(city => city.citySno === this.sourceTypeCtrl.value);

       const destCity = this.cityList.find(city => city.citySno === this.destinationTypeCtrl.value);

       if (sourceCity) {
        this.sourceCityName = sourceCity.cityName
       }
       if (destCity) {
        this.destCityName = destCity.cityName;
        this.getViaCity();
      }
       

      // const sourceCity = this.cityList.find(city => city.citySno === this.sourceTypeCtrl.value);

      // const destCity = this.cityList.find(city => city.citySno === this.destinationTypeCtrl.value);
      
      // console.log(sourceCity.cityName)
      // let swapNames : any = sourceCity.cityName;
      // sourceCity.cityName = destCity.cityName;
      // destCity.cityName = swapNames;
    }
  }

  onSourceTypeChange(event: any) {
    const sourceCitySno = this.sourceTypeCtrl.value;

    // Assuming this is your array of city objects
    const sourceCity = this.cityList.find(city => city.citySno === sourceCitySno);

    if (sourceCity) {
      this.sourceCityName = sourceCity.cityName;
      console.log('Selected City Name:', this.sourceCityName);
      // Do something with the cityName
    } else {
      console.log('City not found in the array.');
    }
  }

  onDestTypeChange(event: any) {
    const destinationCitySno = this.destinationTypeCtrl.value;

    // Assuming this is your array of city objects
    const destCity = this.cityList.find(city => city.citySno === destinationCitySno);

    if (destCity) {
      this.destCityName = destCity.cityName;
      console.log('Selected City Name:', this.destCityName);
      // Do something with the cityName
    } else {
      console.log('City not found in the array.');
    }
  }


  getRouteCount() {
    let param: any = {  };
    if (this.sourceTypeCtrl.value && this.sourceTypeCtrl.value != '') {
      param.sourceCitySno = JSON.stringify(this.sourceTypeCtrl.value);
    }
    if (this.destinationTypeCtrl.value && this.destinationTypeCtrl.value != '') {
      param.destinationCitySno = this.destinationTypeCtrl.value;
    }
    if (this.viaTypeCtrl.value && this.viaTypeCtrl.value != '') {
      param.viaCitySno =  '{' + this.viaTypeCtrl.value + '}';
    }
    console.log(param)
    this.api.get("8054/api/get_city_bus_count", param).subscribe(
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

  getMoreCity(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getRouteCity();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getRouteCity();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.cityRouteList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.cityRouteList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getRouteCity();
    }
    // if (this.cityRouteList.length <= this.pageIndex && isFirst) {
    //   this.getRouteCity();
    // }
  }

  check(){
    if (this.sourceTypeCtrl.valid) {
      console.log('mat-select is valid');
    } else {
      console.log('mat-select is not valid');
    }
  }

  onViaChange(event: any){
    this.skip = 0;
    // this.limit  = 0;
    this.pageSize  = 0;
    this.pageIndex  = 0;
  }

}
