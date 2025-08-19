import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tyre-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './tyre-activity.component.html',
  styleUrls: ['./tyre-activity.component.scss']
})
export class TyreActivityComponent implements OnInit {

  public form: FormGroup;
  searchTyreList: any = [];
  user: any;

  constructor(
    public dialogRef: MatDialogRef<TyreActivityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    private api: ApiService,
    private tokenStorageService: TokenStorageService,
    public toastrService: ToastrService,

  ) {

  }

  ngOnInit(): void {
    console.log(this.data);
    this.user = this.tokenStorageService.getUser();
    if ((this.data?.tyreActivityTypeCdName == 'Retreading') || (this.data?.tyreActivityTypeCdName == 'Bursted')
      || (this.data?.tyreActivityTypeCdName == 'Insert') || (this.data?.tyreActivityTypeCdName == 'Puncture') 
      || (this.data?.tyreActivityTypeCdName == 'Powdering') || (this.data?.tyreActivityTypeCdName == 'Remove')) {
      this.getAvailableTyre();
      this.form = this.fb.group({
        tyreSno: [ (this.data?.tyreActivityTypeCdName == 'Powdering') ? this.data?.tyreSno : null, Validators.compose([Validators.required])],
        vehicleSno: [this.data.vehicleSno, Validators.compose([Validators.required])],
        wheelPosition: [this.data.wheelPosition],
        description: [null],
        tyreActivityTypeCd: [this.data.tyreActivityTypeCd],
        odoMeter: [this.data?.vehicleOdoMeterValue, Validators.compose([Validators.required, Validators.max(this.data?.vehicleOdoMeterValue || 0)])],
        activityDate: [null, Validators.compose([Validators.required])],
        isRunning: [(this.data.tyreActivityTypeCd == 98) || (this.data.tyreActivityTypeCd == 99) || (this.data.tyreActivityTypeCd == 102) ? false : true],
      });

    } else if (this.data?.tyreActivityTypeCdName == 'Rotation') {
      this.searchTyreList = JSON.parse(JSON.stringify(this.data?.searchTyreList));
      this.form = this.fb.group({
        rotationTyreList: new FormArray([]),
        description: [null],
        odoMeter: [this.data?.vehicleOdoMeterValue, Validators.compose([Validators.required])],
        activityDate: [null, Validators.compose([Validators.required])],
      });
      console.log(this.searchTyreList);
      for (let i in this.searchTyreList) {
        this.searchTyreList[i].tyreActivityTypeCd = this.data?.tyreActivityTypeCd;
        this.searchTyreList[i].vehicleSno = this.data?.vehicleSno;
        this.searchTyreList[i].wheelPosition = (parseInt(i) + 1);
        this.insertTyre(this.searchTyreList[i]);
      }
    }
  }


  rotationTyreList() {
    return this.form.get('rotationTyreList') as FormArray;
  }

  insertTyre(data) {
    this.rotationTyreList().push(this.fb.group({
      tyreSno: [data?.tyreSno, Validators.compose([Validators.required])],
      changeTyreSno: [data?.tyreSno, Validators.compose([Validators.required])],
      // vehicleSno: [data.vehicleSno, Validators.compose([Validators.required])],
      wheelPosition: [data.wheelPosition],
      // description: [null],
      // tyreActivityTypeCd: [data.tyreActivityTypeCd],
      // odoMeter: [null, Validators.compose([Validators.required])],
      // activityDate: [null, Validators.compose([Validators.required])],
      // isRunning: [data.tyreActivityTypeCd == 99 ? false : true],
      tyreSerialNumber: [data?.tyreSerialNumber],
    }))
  }




  getAvailableTyre() {
    this.searchTyreList = [];
    let param = { orgSno: this.user.orgSno,vehicleSno:this.data.vehicleSno }
    this.api.get('8053/api/get_search_available_tyre', param).subscribe(result => {
      console.log(result)
      if (result != null) {
        if (result?.data?.length) {
          this.searchTyreList = result.data;
        }
        console.log(this.data?.stepneyList)
        console.log(this.searchTyreList)
        if (this.data?.stepneyList) {
          for (let stepney of this.data?.stepneyList) {
            if (stepney?.tyreSno) {
              let stepneyObj = {
                tyreSno: stepney?.tyreSno,
                tyreSerialNumber: stepney?.tyreSerialNumber,
                typeTypeValue: '',
                retreadingCount: stepney?.retreadingCount,
                isStepney: true
              }
              this.searchTyreList.unshift(stepneyObj);
            }
          }
        }
        let tyre = this.data?.searchTyreList?.length ? this.data?.searchTyreList[0] : null;
        if (tyre && (this.data?.tyreActivityTypeCd == 101)) {
          let stepneyObj = {
            tyreSno: tyre?.tyreSno,
            tyreSerialNumber: tyre?.tyreSerialNumber,
            typeTypeValue: '',
            retreadingCount: tyre?.retreadingCount
          }
          this.searchTyreList.unshift(stepneyObj);
        }
      }
    });
  }

  addActivity() {
    let body: any = {};
    body = this.form.value;
    body.activityDate = this.api.dateToSavingStringFormatConvertion(new Date(body.activityDate));
    if ((body.tyreActivityTypeCd == 98) || (body.tyreActivityTypeCd == 99) || (body.tyreActivityTypeCd == 101) || (body.tyreActivityTypeCd == 102) || (body.tyreActivityTypeCd == 103)) {
      body.changeTyreSno = body.tyreSno;
      body.tyreSno = this.data.tyreSno;
    }
    console.log(body);
    this.api.post('8060/api/insert_tyre_activity', body).subscribe(result => {
      if (result != null && result.data) {
        console.log(result);
        this.toastrService.success('Saved Successfully');
        this.close();
      }
      else {

      }
    });
  }

  // updateTyre() {
  //   console.log(this.form.value);
  //   let body: any = this.form.value;
  //   console.log(body);
  //   this.api.put('8060/api/update_tyre_manage', body).subscribe((result: any) => {
  //     console.log(result)
  //     if (result != null) {
  //       this.toastrService.success('tyre Updated Successfully');
  //     } else {

  //     }
  //   });
  // }

  close() {
    this.dialogRef.close(true);
  }

  removeTyre(i: number) {
    let index: number = this.searchTyreList.findIndex((tyre) => tyre.tyreSno == this.rotationTyreList().at(i).get('changeTyreSno').value);
    if (index != -1) {
      this.rotationTyreList().at(i).patchValue({
        tyreSerialNumber: this.searchTyreList[index]?.tyreSerialNumber
      });
    }
    this.reloadTyre();
  }

  deleteTyre(i: number) {
    this.rotationTyreList().at(i).patchValue({
      tyreSerialNumber: null,
      changeTyreSno: null
    });
    this.reloadTyre();
  }

  reloadTyre() {
    this.searchTyreList = JSON.parse(JSON.stringify(this.data?.searchTyreList))
    for (let j in this.rotationTyreList().value) {
      for (let k in this.searchTyreList) {
        if (this.rotationTyreList().at(parseInt(j)).value.changeTyreSno == this.searchTyreList[k].tyreSno) {
          this.searchTyreList.splice(k, 1);
          break;
        }
      }
    }
  }

  saveRotationTyre() {
    let body: any = {};
    body.tyreList = [];
    let tempTyre: any = this.form.value;
    for (let tyre of tempTyre?.rotationTyreList) {
      if (tyre?.tyreSno != tyre?.changeTyreSno) {
        body.tyreList.push({
          tyreSno: tyre?.tyreSno,
          changeTyreSno: tyre?.changeTyreSno,
          vehicleSno: this.data?.vehicleSno,
          tyreActivityTypeCd: this.data?.tyreActivityTypeCd,
          // description: tempTyre?.description,
          description: 'Rotation',
          odoMeter: tempTyre?.odoMeter,
          isRunning: true,
          activityDate: this.api.dateToSavingStringFormatConvertion(new Date(tempTyre?.activityDate)),
          wheelPosition: 'p' + tyre?.wheelPosition
        });
      }
    }
    console.log(body)
    this.api.post('8060/api/insert_rotation_tyre_activity', body).subscribe(result => {
      if (result != null && result.data) {
        console.log(result);
        this.toastrService.success('Saved Successfully');
        this.close();
      }
      else {

      }
    });
  }
}
