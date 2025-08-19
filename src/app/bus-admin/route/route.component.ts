import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  Validators, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RouteService } from './route.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { RouteCategory } from './route.model';
import { ApiService } from 'src/app/providers/api/api.service';
import { IMultiSelectOption, MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { MaterialModule } from 'src/app/providers/material/material.module';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { TokenStorageService } from '../login/token-storage.service';

@Component({
  selector: 'app-route',
  standalone: true,
  imports: [CommonModule,FormsModule,MaterialModule,ConfirmDialogModule,NgxPaginationModule,ReactiveFormsModule,MultiselectDropdownModule],
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [RouteService]
})

export class RouteComponent implements OnInit {

  public records: RouteCategory[];
  public record: RouteCategory;
  public searchText: string;
  public p: any;
  public action: string = "";
  public actionMode: string = "";
  public type: string = 'grid';
  public modalRef: NgbModalRef;
  public form:any= FormGroup;
  isNoData: boolean = false;
  searchValue1: string = '';
  searchValue2: string = '';
  sourceCities: any = [];
  destCities: any = [];
  user: any;
  viaLists: any = [];
  cities: any = [];
  optionsModel: any = [];
  orgvehiclesList: any = [];
  busList: any = [];
  eventList: any = [];
  deleteList: any = [];
  myOptions: IMultiSelectOption[] | any = [];
  kycMsg: any;

  constructor(
    public fb:FormBuilder,
    public toastrService: ToastrService,
    public translateService: TranslateService,
    private confirmDialogService: ConfirmDialogService,
    public modalService: NgbModal,
    private api: ApiService,
    private tokenStorageService: TokenStorageService,
    private toast: ToastrService

  ) {
    this.user = tokenStorageService.getUser();
  }


  ngOnInit() {
    this.getSourceCity();
    this.getOrgVehicle();
    this.getDestCity();
    this.getRoute();
    this.form = this.fb.group({
      routeSno: [null],
      sourceCitySno: [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30),])],
      destinationCitySno: [null, Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30),])],
      activeFlag: [true, Validators.compose([Validators.required,])],
      sourceCityName: [null],
      destinationCityName: [null],
      selectedVehicle: [null],
      viaList: [null],
      busList: [null],
      operatorRouteSno: [null]
    });
  }


  createViaList(data: any) {
    if (data != null && data != '') {
      for (let source of this.sourceCities) {
        if (!this.viaLists?.length)
          this.viaLists = [];
        if (source.citySno == data) {
          this.viaLists.push(source);
        }
      }
    } else {
    }
  }




  remove(i: any) {
    if (this.viaLists[i].viaSno) {
      this.deleteList.push((this.viaLists[i].viaSno));
      this.viaLists.splice(i, 1);
    } else {
      this.viaLists.splice(i, 1);
    }
  }



  public addRecord() {
    console.log(this.form.value)

    let selectedVehicle = this.form.value.selectedVehicle;
    for (let i in selectedVehicle) {
      for (let j in this.orgvehiclesList) {
        if (selectedVehicle[i] == this.orgvehiclesList[j].vehicleSno) {
          this.busList.push(this.orgvehiclesList[i])
          break;
        }
      }
    }
    let body: any = this.form.value
    console.log(this.busList)
    body.operatorSno = this.user.orgSno;
    body.viaList = this.viaLists;
    body.busList = this.busList
    this.api.post("8054/api/create_route", body).subscribe(result => {
      if (result != null) {
        this.getRoute();
        this.toastrService.success("Route Added Successfully");
      }

    });
  }

  public updateRecord() {
    let selectedVehicle = this.form.value.selectedVehicle;
    for (let i in selectedVehicle) {
      for (let j in this.orgvehiclesList) {
        if (selectedVehicle[i] == this.orgvehiclesList[j].vehicleSno) {
          this.busList.push(this.orgvehiclesList[i])
          break;
        }
      }
    }
    let body: any = this.form.value
    body.operatorSno = this.user.orgSno;
    body.viaList = this.viaLists;
    body.busList = this.busList
    console.log(JSON.stringify(body))

    body.deleteList = this.deleteList
    this.api.put("8054/api/update_route", body).subscribe(result => {
      this.getRoute();
      this.toastrService.success("Route Updated Successfully");
    });
  }

  public deleteRecord(index: number, record: RouteCategory) {
  }

  public toggle(type) {
    this.type = type;
  }

  public openModal(modalContent, record, mode) {
    this.actionMode = mode;
    if (record && mode == 'u') {
      this.record = record;
      this.action = "Editing Route..";
      this.viaLists = record.viaList;
      console.log(JSON.stringify(this.record))
      this.form.setValue(record);
      this.viaLists = [];
      this.modalRef = this.modalService.open(modalContent, { container: '.app' });
      this.modalRef.result.then((result) => {
        this.form.reset();
      }, (reason) => {
        this.form.reset();
      });
    }

    else {
      if (this.kycMsg?.data) {
        this.record = new RouteCategory();
        this.action = "Adding New Bus Route..";
        this.viaLists = [];
        this.modalRef = this.modalService.open(modalContent, { container: '.app' });
        this.modalRef.result.then((result) => {
          this.form.reset();
        }, (reason) => {
          this.form.reset();
        });
      } else {
        this.toastrService.error("You can't add Route upto Verify Your KYC")
      }
    }

  }

  public closeModal() {
    this.ngOnInit();
    this.modalRef.close();
  }

  public clearModal() {
    this.searchValue1 = null;
    this.searchValue2 = null;
  }

  public onSubmit(record: RouteCategory): void {
    if (this.form.valid) {
      if (record.routeSno) {
        this.updateRecord();
      }
      else {
        this.addRecord();
      }
      this.modalRef.close();
    }
  }
  getOrgVehicle() {
    let params = { orgSno: this.user.orgSno };
    this.api.get("8053/api/get_org_vehicle", params).subscribe(result => {
      this.kycMsg = result

      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.orgvehiclesList = result.data;
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
  getRoute() {
    let body = { orgSno: this.user?.orgSno };
    this.api.get('8054/api/get_route', body).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.records = result.data;
        console.log((this.records))
      } else {
      }
    });
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
        this.destCities.push(this.sourceCities[i])
      }
    }
  }


}
