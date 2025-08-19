import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { TokenStorageService } from '../login/token-storage.service';
import { MatPaginator } from '@angular/material/paginator';



@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MaterialModule],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;
  locationform: any = UntypedFormGroup;
  cityform: any = UntypedFormGroup;
  stateform: any = UntypedFormGroup;
  districtform: any = UntypedFormGroup;
  selectedOption: any = 'city';
  isEdit: boolean = false;
  isPageLoading: boolean = false;
  isLoad: boolean = false;
  categoriesList: any = [];
  citySno: any;
  stateSno: any;
  districtSno: any;
  skip: any = 0;
  limit: number = 10;
  count: number = 0;
  user: any;
  content: any;
  @ViewChild('close') close: any;
  stateList: any = [];
  districtList: any = [];
  cityList: any = [];
  selectedCityIndex: number = 0;
  selectedStateIndex: number = 0;
  selectedDistrictIndex: number = 0;
  isNoRecord: boolean = true;
  isAdmin: boolean;

  moreStateList: any = [];
  statePageSize: number = 0;
  statePageIndex: number = 0;
  stateItemPerPage: any = [10, 20, 30, 40, 50];
  stateSkip: number = 0;
  stateLimit: number = 0;
  stateCount:number=0;
  
  

  moreCityList: any = [];
  cityPageSize: number = 0;
  cityCount: any;
  cityItemPerPage: any = [10, 20, 30, 40, 50];
  cityPageIndex: number = 0;
  citySkip: number = 0;
  cityLimit: number = 0;

  moreDistrictList: any = [];
  districtPageSize: number = 0;
  districtCount: any;
  districtItemPerPage: any = [10, 20, 30, 40, 50];
  districtPageIndex: number = 0;
  districtSkip: number = 0;
  districtLimit: number = 0;





  constructor(
    private api: ApiService, private toast: ToastrService,
    private tokenStorageService: TokenStorageService,

  ) {
    this.user = tokenStorageService.getUser();
    console.log(this.user);
    this.locationform = new UntypedFormGroup({
      selectLocation: new UntypedFormControl("city", Validators.required),
      district: new UntypedFormControl(null),
      city: new UntypedFormControl(null),
    });
    this.cityform = new UntypedFormGroup({
      stateSno: new UntypedFormControl(null,),
      districtSno: new UntypedFormControl(null, Validators.required),
      cityName: new UntypedFormControl(null, ([Validators.required,Validators.pattern("^[a-zA-Z .]*$")])),
      activeFlag: new UntypedFormControl("true", Validators.required),
    });
    this.stateform = new UntypedFormGroup({
      stateSno: new UntypedFormControl(null,),
      stateName: new UntypedFormControl(null, Validators.required),
      activeFlag: new UntypedFormControl("true", Validators.required),
    });
    this.districtform = new UntypedFormGroup({
      stateSno: new UntypedFormControl(null,),
      districtName: new UntypedFormControl(null, Validators.required),
      activeFlag: new UntypedFormControl("true", Validators.required),
    })

    this.stateLimit = this.stateItemPerPage.toString().split(',')[0];
    this.cityLimit = this.cityItemPerPage.toString().split(',')[0];
    this.districtLimit = this.districtItemPerPage.toString().split(',')[0];
  }

  ngOnInit(): void {
    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/location');
      if (index != -1) {
        this.isAdmin = this.user?.menus[index].isAdmin;
      }
      console.log('isAdmin',this.isAdmin)

    this.getState();
    this.getStateCount();
    this.getCityCount();
    this.getDistrictCount();
    this.getCity();
    this.getDistrict();
  }

  add() {
    this.cityform.reset();
    this.districtform.reset();
    this.stateform.reset();
    this.cityform.patchValue({
      activeFlag: 'true'
    });
    this.isEdit = false;
  }

  editCity(i: any) {
    this.citySno = this.cityList[i].citySno;
    this.cityform.patchValue({
      stateSno: this.cityList[i].stateSno,
      districtSno: this.cityList[i].districtSno,
      cityName: this.cityList[i].cityName,
      activeFlag: this.cityList[i].activeFlag.toString(),
    });
    this.isEdit = true;
  }

  editState(i: any) {
    this.stateSno = this.stateList[i].stateSno;
    this.stateform.patchValue({
      stateSno: this.stateList[i].stateSno,
      stateName: this.stateList[i].stateName,
      activeFlag: this.stateList[i].activeFlag.toString(),
    });
    this.isEdit = true;
  }

  editDistrict(i: any) {
    this.districtSno = this.districtList[i].districtSno;
    this.districtform.patchValue({
      stateSno: this.districtList[i].stateSno,
      districtName: this.districtList[i].districtName,
      activeFlag: this.districtList[i].activeFlag.toString(),
    });
    this.isEdit = true;
  }

  deleteCity(i: number) {
    let body: any = {
      citySno: this.citySno
    };
    this.api.delete('8054/api/delete_city', body).subscribe((data: any) => {
      if (data) {
        this.cityList.splice(i, 1);
        this.add();
      } else {
      }
      this.close.nativeElement.click();
    });
  }

  deleteState(i: number) {
    let body: any = {
      stateSno: this.stateSno
    };

    this.api.delete('8054/api/delete_state', body).subscribe((data: any) => {
      if (data?.isSuccess) {
        this.toast.success("delete success");
        this.add();
        this.stateList.splice(i, 1);
        this.add();
      } else {
        this.toast.show("You can't delete this field....")

      }
      this.getState();
      this.close.nativeElement.click();
    });
  }

  deleteDistrict(i: number) {
    let body: any = {
      districtSno: this.districtSno
    };

    this.api.delete('8054/api/delete_district', body).subscribe((data: any) => {
      if (data?.isSuccess) {
        this.toast.success("delete success");
        this.districtList.splice(i, 1);
        this.add();
      } else {
        this.toast.show("You can't delete this field....")
      }
      this.getDistrict();
      this.close.nativeElement.click();
    });
  }

  delete() {
    if (this.selectedOption == 'city') {
      this.deleteCity(this.selectedCityIndex);
    }
    else if (this.selectedOption == 'district') {
      this.deleteDistrict(this.selectedDistrictIndex);
    }
    else if (this.selectedOption == 'state') {
      this.deleteState(this.selectedStateIndex);
    }
  }

  updatCity() {
    let body: any = {
      districtSno: this.cityform.value.districtSno,
      cityName: this.cityform.value.cityName,
      activeFlag: this.cityform.value.activeFlag,
      citySno: this.citySno,
    };
    console.log(body);
    this.isLoad = true;
    this.api.put('8054/api/update_city', body).subscribe((data: any) => {
      this.isLoad = false;
      if (data != null) {
        this.add();
        this.getCity();
      } else {
      }
    });
  }

  updateState() {
    let body: any = {
      stateSno: this.stateform.value.stateSno,
      stateName: this.stateform.value.stateName,
      activeFlag: this.stateform.value.activeFlag,
    };
    console.log(body);
    this.isLoad = true;
    this.api.put('8054/api/update_state', body).subscribe((data: any) => {
      this.isLoad = false;
      if (data != null) {
        this.add();
        this.getState();
      } else {
      }
    });
  }

  updateDistrict() {
    let body: any = {
      stateSno: this.districtform.value.stateSno,
      districtName: this.districtform.value.districtName,
      activeFlag: this.districtform.value.activeFlag,
      districtSno: this.districtSno,
    };
    console.log(body);
    this.isLoad = true;
    this.api.put('8054/api/update_district', body).subscribe((data: any) => {
      this.isLoad = false;
      if (data != null) {
        this.add();
        this.getDistrict();
      } else {
      }
    });
  }

  saveCity() {
    let body: any = this.cityform.value;
    this.api.post('8054/api/create_city', body).subscribe(result => {
      if (result != null && result.data) {
        this.add();
      } else {
        if(result.msg){
          this.toast.error(result.msg)
        }
      }
      this.cityform.patchValue({
        cityName: null
      })
      this.getCity();
    });
  }

  saveState() {
    let body: any = this.stateform.value;
    this.api.post('8054/api/create_state', body).subscribe(result => {
      if (result != null && result.data) {

      } else {

      }
      this.add();
      this.getCity();
    });
  }

  saveDistrict() {
    let body: any = this.stateform.value;
    this.api.post('8054/api/create_state', body).subscribe(result => {
      if (result != null && result.data) {

      } else {

      }
      this.add();
      this.getCity();
    });
  }

  savedistrict() {
    let body: any = this.districtform.value;
    this.api.post('8054/api/create_district', body).subscribe(result => {
      if (result != null && result.data) {

      } else {

      }
      this.add();
      this.getCity();
    });
  }

  updateIndex(type: any) {
    if (type == 'Previous') {
      if (this.skip != this.count) {
        this.skip = this.skip + this.cityList.length;
        let skip = this.count - this.cityList.length;
        this.skip = this.skip - skip;
      } else {
        this.skip = 0;
      }
    } else if (type == 'Next') {
      this.skip = this.skip + this.cityList.length;
    }
  }

  openModal(index: any) {
    if (this.selectedOption == 'city') {
      this.selectedCityIndex = index;
      this.citySno = this.cityList[index].citySno
    }
    else if (this.selectedOption == 'district') {
      this.selectedDistrictIndex = index;
      this.districtSno = this.districtList[index].districtSno
    }
    else if (this.selectedOption == 'state') {
      this.selectedStateIndex = index;
      this.stateSno = this.stateList[index].stateSno
    }

  }

  getCategoryCount() {
    let params: any = {};
    this.api.get("8054/api/get_category_count", params).subscribe(result => {
      if (result != null && result.data) {
        this.count = result.data;
        if (this.count > 0) {
          // this.getCategory();
        }
      }
    });
  }

  getState() {
    let body: any = this.cityform.value;
    this.api.get("8054/api/get_state", body).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.stateList = result.data;
        // this.getDistrict();
      } else {
        this.stateList.success("Registered Successfully");
      }
    });
  }

  getStates() {
    let params = { skip: this.stateSkip, limit: this.stateLimit};

    this.moreStateList = [];
    this.isNoRecord = false;
    this.api.get("8054/api/get_state", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.moreStateList = result.data;
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

  getDistrict() {
    let params: any = {};
    if (this.cityform.value.stateSno)
      params.stateSno = this.cityform.value.stateSno
    this.api.get("8054/api/get_district", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.districtList = result.data;
        console.log(this.districtList);
      } else {
      }
    });
  }

  getDistricts() {
    let params = { skip: this.districtSkip, limit: this.districtLimit};

    this.moreDistrictList = [];
    this.isNoRecord = false;
    this.api.get("8054/api/get_district", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.moreDistrictList = result.data;
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
  


  

  getCity() {
    let params = { skip: this.citySkip, limit: this.cityLimit};
    console.log('PARAMS',params)
    this.moreCityList = [];
    this.isNoRecord = false;
    this.api.get("8054/api/get_city", params).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.moreCityList = result.data;
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

  onChange() {

  }

  getStateCount(){
    let param: any = {};
    this.isNoRecord = false;
    this.api.get("8054/api/get_state_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.stateCount = dataValue;
            }
            this.getStates();
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

 

  getCityCount(){
    let param: any = {};
    this.isNoRecord = false;
    this.api.get("8054/api/get_city_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.cityCount = dataValue;
            }
            this.getCity();
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

  getDistrictCount(){
    let param: any = {};
    this.isNoRecord = false;
    this.api.get("8054/api/get_district_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.districtCount = dataValue;
            }
            this.getDistricts();
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

  getMoreState(event: any) {
    let isFirst: boolean = true;
    this.statePageIndex = parseInt(event?.pageIndex);
    this.statePageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.stateSkip = this.stateSkip - event.pageSize;
      this.getStates();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.stateSkip = this.stateSkip + event.pageSize;
      this.getStates();
    } else {
      this.paginator.pageIndex = 0;
      this.statePageIndex = 0;
      this.stateSkip = 0;
      this.moreStateList = [];
    }

    if (this.stateLimit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.statePageIndex = 0;
      this.moreStateList = [];
      this.stateSkip = 0;

      this.stateLimit = event.pageSize;
      isFirst = false;
      this.getStates();
    }
    // if (this.moreStateList.length <= this.statePageIndex && isFirst) {
    //   console.log('isFirst',isFirst)
    //   console.log('list',this.moreStateList.length)
    //   // this.getStates();
    // }
  }

  getMoreCity(event: any) {
    let isFirst: boolean = true;
    this.cityPageIndex = parseInt(event?.pageIndex);
    this.cityPageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.citySkip = this.citySkip - event.pageSize;
      this.getCity();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.citySkip = this.citySkip + event.pageSize;
      this.getCity();
    } else {
      this.paginator.pageIndex = 0;
      this.cityPageIndex = 0;
      this.citySkip = 0;
      this.moreCityList = [];
      
    }

    if (this.cityLimit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.cityPageIndex = 0;
      this.moreCityList = [];
      this.citySkip = 0;

      this.cityLimit = event.pageSize;
      isFirst = false;
      this.getCity();
    }
    // if (this.moreStateList.length <= this.statePageIndex && isFirst) {
    //   console.log('isFirst',isFirst)
    //   console.log('list',this.moreStateList.length)
    //   // this.getStates();
    // }
  }

  getMoreDistrict(event: any) {
    let isFirst: boolean = true;
    this.districtPageIndex = parseInt(event?.pageIndex);
    this.districtPageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.districtSkip = this.districtSkip - event.pageSize;
      this.getDistricts();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.districtSkip = this.districtSkip + event.pageSize;
      this.getDistricts();
    } else {
      this.paginator.pageIndex = 0;
      this.districtPageIndex = 0;
      this.districtSkip = 0;
      this.moreDistrictList = [];
    }

    if (this.districtLimit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.districtPageIndex = 0;
      this.moreDistrictList = [];
      this.districtSkip = 0;

      this.districtLimit = event.pageSize;
      isFirst = false;
      this.getDistricts();
    }
    // if (this.moreStateList.length <= this.statePageIndex && isFirst) {
    //   console.log('isFirst',isFirst)
    //   console.log('list',this.moreStateList.length)
    //   // this.getStates();
    // }
  }




}
