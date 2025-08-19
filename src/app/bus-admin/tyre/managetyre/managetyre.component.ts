import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { TokenStorageService } from '../../login/token-storage.service';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import Swal from 'sweetalert2';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TyreActivityComponent } from '../../tyre-activity/tyre-activity.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-managetyre',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FormsModule,
    AutocompleteLibModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './managetyre.component.html',
  styleUrls: ['./managetyre.component.scss'],
  providers: [MenuService],
  encapsulation: ViewEncapsulation.None
})
export class ManagetyreComponent implements OnInit {

  @Input('openModal') openModal: boolean

  searchText: string = "";
  @ViewChild('close') close: any;
  orgvehicles: any = [];
  appUser: any;
  selectedVehicle: any;
  isAdmin: boolean = false;
  vehicleKey = 'vehicleRegNumber';
  public form: UntypedFormGroup;
  searchTyre = new Subject<any>();
  user: any;
  searchKey: String = '';
  selectedItem: any;
  keyword = 'vehicleRegNumber';
  serial = 'tyreSerialNumber';
  data: any = [];
  tyreList: any = [];
  tyreChangeList: any = [];
  ispopUpShow: boolean = true;
  vehicleSno:number;

  // selectedPosition: any;

  // selectedVehicleSno: any;

  // selectedActivityTypeCd: any;

  prevIndex: number;
  searchTyreList: any = [];

  public vehicleFilterCtrl: FormControl = new FormControl();
  public vehicleCtrl: FormControl = new FormControl();
  public filteredVehicle: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  protected _onDestroy = new Subject<void>();
  // selectedVehicle: any;
  vehicleList: any = [];
  isDisabled: boolean = true;
  isShow: boolean = false;
  isAlready: boolean = false;

  tyreDetailList = [
    { createTime: 'T1', name: 'New', cdValue: '40000', startDate: '23-05-2019', endDate: '19-04-2021' },
    { createTime: 'T1', name: 'Retreading', cdValue: '4000', startDate: '23-05-2021', endDate: '19-12-2021' },
    { createTime: 'T1', name: 'Regroving', cdValue: '3000', startDate: '23-12-2021', endDate: '19-04-2022' },
  ];

  selectedTyre: any;

  constructor(
    private router: Router,
    private api: ApiService,
    public fb: UntypedFormBuilder,
    private toast: ToastrService,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private tokenStorageService: TokenStorageService,
    public dialog: MatDialog
  ) {

    this.user = this.tokenStorageService.getUser();
    this.form = this.fb.group({
      tyreSno: [null],
      vehicleSno: [null, Validators.compose([Validators.required])],
      wheelPosition: [null],
      description: [null],
      tyreActivityTypeCd: [null],
      odoMeter: [null, Validators.compose([Validators.required])],
      activityDate: [null, Validators.compose([Validators.required])],
      isRunning: [null],
    });

  }



  ngOnInit(): void {
    // this.getManageTyre();
    // this.getOrgVehicle();
    // this.getTyre();
    this.searchTyre
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value: any) => {
        this.tyreChangeList = [];
        // this.getManageTyre();
      });

    this.vehicleFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe((value: any) => {
        this.filterVehicle(value);
      });

    $(document).ready(() => {
      $('[data-toggle="popover"]').popover({});
    });

    this.getVehicle();
    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/managetyre');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }  
    
   
  }

  selectVehicle(item) {
    this.selectedVehicle = item.vehicleSno;
  }

  selectTyre(i: number, isStepney?: boolean) {
    if (!isStepney) {
      this.selectedTyre = this.selectedVehicle?.tyrePositionList?.tyreList[i];
    } else {
      this.selectedTyre = this.selectedVehicle?.tyrePositionList?.stepneyList[i];
    }
    this.selectedTyre.displayName = !isStepney ? 'T' : 'S';
    this.selectedTyre.index = i;
    if (this.selectedTyre?.tyreSno) {
      this.getTyreLifeCycle();
    }
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e) {

  }

  addActivity(i?: any, event?: any, type?: any) {
    let body: any = {};
    body.tyreSno = event?.value;
    body.vehicleSno = this.selectedVehicle?.VehicleSno;
    body.tyreActivityTypeCd = 97;
    body.description = 'Insert';
    body.odoMeter = type == 'main' ? this.form.value.odoMeter : null;
    body.isRunning = true;
    body.activityDate = this.api.dateToSavingStringFormatConvertion(new Date(this.form.value.activityDate));
    body.wheelPosition = (type == 'main' ? 'p' : 's') + (i + 1);
    this.api.post('8060/api/insert_tyre_activity', body).subscribe(result => {
      if (result != null && result.data) {
        if (type == 'main') {
          let j: number = this.selectedVehicle?.tyrePositionList?.tyreList[i]?.searchTyreList.findIndex((tyre) => tyre.tyreSno == this.selectedVehicle?.tyrePositionList?.tyreList[i]?.tyreSno);
          if (j != -1) {
            this.selectedVehicle.tyrePositionList.tyreList[i].tyreSerialNumber = this.selectedVehicle?.tyrePositionList?.tyreList[i]?.searchTyreList[j]?.tyreSerialNumber;
          }
        } else {
          let j: number = this.selectedVehicle?.tyrePositionList?.stepneyList[i]?.searchTyreList.findIndex((tyre) => tyre.tyreSno == this.selectedVehicle?.tyrePositionList?.stepneyList[i]?.tyreSno);
          if (j != -1) {
            this.selectedVehicle.tyrePositionList.stepneyList[i].tyreSerialNumber = this.selectedVehicle?.tyrePositionList?.stepneyList[i]?.searchTyreList[j]?.tyreSerialNumber;
          }
        }
        this.toastrService.success('Tyre Activity Added Successfully');
      }
      else {

      }
    });
  }

  getVehicle(vehicleSno?: any) {
    let param: any = { orgSno: this.user.orgSno };
    if (vehicleSno) {
      param.vehicleSno = vehicleSno;
    }
    this.api.get('8053/api/get_search_operator_vehicle', param).subscribe(result => {
      console.log(result);
      if (result != null && result.data) {
        if (vehicleSno && this.vehicleList?.length) {
          let i: number = this.vehicleList.findIndex((vehicle) => vehicle?.VehicleSno == vehicleSno);
          if (i != -1) {
            this.vehicleList[i] = result.data[0];
            this.selectedVehicle = this.vehicleList[i];
            if (this.selectedTyre?.index != null) {
              let index: number = this.selectedTyre?.index
              this.selectedTyre = this.selectedVehicle?.tyrePositionList?.tyreList[index];
              this.selectedTyre.index = index;
            }
            this.getTyrePosition();
          }
        } else {
          this.vehicleList = result?.data;
          this.filteredVehicle.next(this.vehicleList?.slice());
        }
      }
    });
  }

  filterVehicle(event) {
    if (!this.vehicleList) {
      return;
    }
    // get the search keyword
    let search = this.vehicleFilterCtrl.value;
    if (!search) {
      this.filteredVehicle.next(this.vehicleList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // // filter the categroy
    this.filteredVehicle.next(
      this.vehicleList.filter(vehicle => vehicle?.vehicleSno?.toLowerCase()?.indexOf(search) > -1)
    );
  }

  setSelectedVehicle() {
    this.form.reset();
    let index = this.vehicleList.findIndex(vehicle => vehicle?.VehicleSno == this.vehicleCtrl.value);
    if (index != -1) {
      this.selectedVehicle = this.vehicleList[index];
      this.getTyrePosition();

    } else {
      this.selectedVehicle = null;
    }
  }

  getAvailableTyre(i, isStepney?: boolean) {
    console.log(this.selectedVehicle)
    this.selectedVehicle.tyrePositionList.tyreList[i].searchTyreList = [];
    if (isStepney) {
      this.selectedVehicle.tyrePositionList.stepneyList[i].searchTyreList = [];
    }
    let param = { orgSno: this.user.orgSno,vehicleSno:this.vehicleSno }
    this.api.get('8053/api/get_search_available_tyre', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.selectedVehicle.tyrePositionList.tyreList[i].searchTyreList = result.data;
        if (isStepney) {
          this.selectedVehicle.tyrePositionList.stepneyList[i].searchTyreList = result.data;
        }
      }else{
        this.toastrService.error("There is no Tyre matching with this vehicle tyre type")
      }
    });
  }


  open(index: number) {
    let popup1: any = document.getElementById("myPopup" + this.prevIndex);
    if (this.prevIndex != null) {
      popup1.classList.toggle("hide");
    } else if (this.prevIndex == index) {
      popup1.classList.toggle("hide");
    }
    let popup: any = document.getElementById("myPopup" + index);
    popup.classList.toggle("show");
    this.prevIndex = index;
    this.selectTyre(index)
  }


  // addActivity() {
  //   let body: any = this.form.value;
  //   body.vehicleSno = this.selectedVehicle;
  //   body.tyreSno = this.selectedTyre;
  //   body.tyreActivityTypeCd = this.selectedActivityTypeCd;
  //   body.wheelPosition = this.selectedPosition;

  //   body.isRunning = this.selectedActivityTypeCd == 97 ? true : false

  //   console.log('BODY======', body);
  //   this.api.post('8060/api/insert_tyre_activity', body).subscribe(result => {
  //     if (result != null && result.data) {
  //       console.log(result);
  //       this.toastrService.success('Tyre Activity Added Successfully');
  //       this.close.nativeElement.click();
  //       this.form.reset();
  //       // this.getManageTyre()
  //     }
  //     else {

  //     }
  //   });
  // }

  closePopup() {
    this.form.reset();
    this.close.nativeElement.click();
  }

  closeActivityPopup() {
    let popup1: any = document.getElementById("myPopup" + this.prevIndex);
    popup1.classList.toggle("show");
    this.prevIndex = null;
  }

  goToEditTyre(i?: any) {
    this.form.patchValue({
      vehicle: this.tyreChangeList[i].vehicle,
      tyre: this.tyreChangeList[i].tyre,
      position: this.tyreChangeList[i].position,
      inOdometerReading: this.tyreChangeList[i].inOdometerReading,
      vehicleTyreSno: this.tyreChangeList[i].vehicleTyreSno,
      tyreChangeSno: this.tyreChangeList[i].tyreChangeSno
    });
    this.selectVehicle(this.tyreChangeList[i]);
  }

  updateTyre() {
    let body: any = this.form.value;
    this.api.put('8060/api/update_tyre_manage', body).subscribe((result: any) => {
      if (result != null) {
        this.toastrService.success('tyre Updated Successfully');
        this.close.nativeElement.click();
        // this.getManageTyre()
      } else {

      }
    });

  }

  getData() {
    var plus = document.getElementById('plus');
    function plusToggle() {
      plus.classList.toggle('plus--active');
    }

    plus.addEventListener('click', plusToggle);
  }



  deleteAlert(i: any) {
    Swal.fire({
      title: "Are you sure want to delete?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "lightgrey",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", "Your record has been deleted.", "success");
        this.deleteTyre(i);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Cancelled!", "Your record is safe", "error");
      }
    });
  }

  deleteTyre(i: number) {
    let body: any = { vehicleTyreSno: this.tyreChangeList[i].vehicleTyreSno, tyreChangeSno: this.tyreChangeList[i].tyreChangeSno };
    this.api.delete("8060/api/delete_tyre_manage", body).subscribe(
      (result: any) => {
        if (result != null) {
          this.tyreChangeList.splice(i, 1);
          this.toastrService.success("Deleted successfully");
        }
      },
      (err) => {
        this.toastrService.error(err);
      }
    );
  }



  validateTyreSno() {
    // let isDisabled = false;
    let count = 0;
    for (let vehicle of this.selectedVehicle?.tyrePositionList?.tyreList) {
      if (vehicle?.tyreSno) {
        //   isDisabled = true;
        // } else {
        count = count + 1;
      }
    }
    // this.isDisabled = isDisabled;
    this.isShow = false;
    if (this.selectedVehicle.tyreCount == count) {
      if (count == this.selectedVehicle?.tyrePositionList?.tyreList.length) {
        this.isShow = true;
      } else {
        this.isShow = false;
      }
    } else {
      this.toastrService.warning('Kindly select all main tyres')
    }
  }

  removeTyre(i: number) {
    let body: any = {};
    body.vehicleTyreSno = this.selectedVehicle?.tyrePositionList?.tyreList?.searchTyreList[i];
    body.orgSno = this.user.orgSno;
    this.api.delete("8060/api/delete_tyre_activity", body).subscribe(
      (result: any) => {
        if (result != null) {
          this.tyreChangeList.splice(i, 1);
          this.toastrService.success("Deleted successfully");
        }
      },
      (err) => {
        this.toastrService.error(err);
      }
    );
  }

  // openDialog(i:number,selectedActivityTypeCd:number,selectedActivityTypeCdName:string){
  //   let data:any = this.selectedVehicle?.tyrePositionList?.tyreList[i];
  //   data.vehicleSno = this.selectedVehicle?.VehicleSno;
  //   data.tyreActivityTypeCd = selectedActivityTypeCd;
  //   data.tyreActivityTypeCdName = selectedActivityTypeCdName;
  //   data.wheelPosition = 'p' + (i+1);
  //   const dialogRef = this.dialog.open(TyreActivityComponent, {
  //     data: data ,
  //     height: '330px',
  //     width: '600px',
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //   });
  // }

  openDialog(i: number, selectedActivityTypeCd: number, selectedActivityTypeCdName: string, isStepney?: boolean) {
    console.log(this.selectedVehicle);
    let data: any = JSON.parse(JSON.stringify(this.selectedVehicle?.tyrePositionList?.tyreList[i]));
    data.vehicleSno = this.selectedVehicle?.VehicleSno;
    data.vehicleOdoMeterValue = this.selectedVehicle?.odoMeterValue;
    data.tyreActivityTypeCd = selectedActivityTypeCd;
    data.tyreActivityTypeCdName = selectedActivityTypeCdName;
    data.wheelPosition = (isStepney ? 's' : 'p') + (i + 1);
    if (data?.tyreActivityTypeCdName == 'Rotation') {
      // data = {};
      // data.tyreList = JSON.parse(JSON.stringify(this.selectedVehicle?.tyrePositionList?.tyreList));
      // data.vehicleSno = this.selectedVehicle?.VehicleSno;
      // data.tyreActivityTypeCd = selectedActivityTypeCd;
      // data.tyreActivityTypeCdName = selectedActivityTypeCdName;
      // data.wheelPosition = 'p' + (i + 1);
      console.log(this.selectedVehicle)
      data.searchTyreList = [];
      for (let j in this.selectedVehicle?.tyrePositionList?.tyreList) {
        for (let k in this.selectedVehicle?.tyrePositionList?.tyreList[j]?.searchTyreList) {
          console.log(this.selectedVehicle?.tyrePositionList?.tyreList[j]?.searchTyreList[k])
          data.searchTyreList.push(this.selectedVehicle?.tyrePositionList?.tyreList[j]?.searchTyreList[k]);
        }
      }
      console.log(data.searchTyreList)
      delete data.wheelPosition;
      delete data.className;
      delete data.retreadingCount;
      delete data.tyreSerialNumber;
      delete data.tyreSno;
    } else {
      if (!isStepney) {
        data.stepneyList = JSON.parse(JSON.stringify(this.selectedVehicle?.tyrePositionList?.stepneyList));
      }
    }
    const dialogRef = this.dialog.open(TyreActivityComponent, {
      data: data,
      // height: '330px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTyrePosition();
      }
      // this.selectVehicle(this.selectedVehicle[i]);
      console.log('The dialog was closed');
    });
  }

  getTyreLifeCycle() {
    let param = {
      vehicleSno: this.selectedVehicle?.VehicleSno,
      // wheelPosition: 'p' + (parseInt(this.selectedTyre?.index) + 1) 
      tyreSno: this.selectedTyre?.tyreSno
    }
    this.api.get('8060/api/get_tyre_life_cycle', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        if (!this.selectedTyre?.tyreLifeCycleList?.length) {
          this.selectedTyre.tyreLifeCycleList = [];
        }
        this.selectedTyre.tyreLifeCycleList = result.data;
        // for (let i in this.selectedTyre.tyreLifeCycleList) {
        //   if (this.selectedTyre.tyreLifeCycleList[i]?.activityStartDate && this.api.isEmptyString(this.selectedTyre.tyreLifeCycleList[i]?.activityStartDate)) {
        //     this.isAlready = true;
        //     this.form.get('odoMeter').patchValue(this.selectedTyre.tyreLifeCycleList[i]?.activityStartDate);
        //     this.form.get('activityDate').patchValue(this.selectedTyre.tyreLifeCycleList[i]?.activityStartDate);
        //     break;
        //   }
        // }
      } else {
        this.selectedTyre.tyreLifeCycleList = [];
      }
    });
  }

  getTyrePosition() {

    let param: any = {
      vehicleSno: this.selectedVehicle?.VehicleSno,
      tyreCountCd: this.selectedVehicle?.tyreCountCd,
      tyreCount: this.selectedVehicle?.tyreCount
    }
    this.vehicleSno=this.selectedVehicle?.VehicleSno;
    if (this.selectedVehicle?.stepnyCount) {
      param.stepnyCount = this.selectedVehicle?.stepnyCount
    }
    this.api.get('8060/api/get_tyre_position', param).subscribe(result => {
      console.log(result)
      
      if (result && result?.data?.length) {
        this.selectedVehicle.tyrePositionList = {
          tyreList: result?.data[0]?.tyreList,
          stepneyList: result?.data[0]?.stepneyList
        };
        this.selectedVehicle.tyreList = result?.tyreList;
        this.selectedVehicle.stepneyList = result?.stepneyList;
        this.form.get('odoMeter').clearValidators();
        this.form.updateValueAndValidity();
        this.form.get('odoMeter').addValidators([Validators.max(this.selectedVehicle?.odoMeterValue || 0), Validators.required]);
        this.form.updateValueAndValidity();
        this.form.patchValue({
          'vehicleSno': this.selectedVehicle.VehicleSno,
          'odoMeter': this.selectedVehicle?.odoMeterValue
        });
        this.validateTyreSno();
        if (!this.isShow) {
          for (let i in this.selectedVehicle?.tyrePositionList?.tyreList) {
            if (this.selectedVehicle?.tyrePositionList?.tyreList[i].tyreSno) {
              this.form.patchValue({
                odoMeter: this.selectedVehicle?.tyrePositionList?.tyreList[i].odometer,
                activityDate: this.selectedVehicle?.tyrePositionList?.tyreList[i].activityDate
              });
              this.form.get('odoMeter').clearValidators();
              this.form.updateValueAndValidity();
              this.form.get('odoMeter').addValidators([Validators.max(this.selectedVehicle?.tyrePositionList?.tyreList[i].odometer || 0), Validators.required]);
              this.selectedVehicle.odoMeterValue = this.selectedVehicle?.tyrePositionList?.tyreList[i].odometer;
              break;
            }
          }
        }
        if (!this.selectedTyre) {
          this.selectedTyre = this.selectedVehicle?.tyrePositionList?.tyreList[0];
          this.selectedTyre.index = 0;
        }
        this.selectTyre(this.selectedTyre?.index);
      } else {
      }
    });
  }
}
