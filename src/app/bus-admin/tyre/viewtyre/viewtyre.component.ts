import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ApiService } from 'src/app/providers/api/api.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { TokenStorageService } from '../../login/token-storage.service';

@Component({
  selector: 'app-viewtyre',
  standalone:true,
  imports:[CommonModule,ConfirmDialogModule,ReactiveFormsModule,FormsModule,AutocompleteLibModule],
  templateUrl: './viewtyre.component.html',
  styleUrls: ['./viewtyre.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class ViewtyreComponent implements OnInit {

  orgvehicles:any = [];
  viewTyreDetails = [];
  data:any = [];
  orgSno: any;
  tyre: any;
  tyreSno: any;
  user: any;
  public modalRef: NgbModalRef;

  constructor(
    public location:Location,
    public modalService: NgbModal,
    private api: ApiService,
    private tokenStorageService: TokenStorageService,
  ) { 
    let param: any = window.history.state;
  
    this.tyre = param.tyre;
    console.log(this.tyre);
    this.user = this.tokenStorageService.getUser();
  }

  ngOnInit(): void {
    // this.getTyreDetails();
  }

  closeView(){
    this.location.back();
  }
  
  // getTyreDetails(i:any){
  //     // let param = { vehicleSno: this.orgvehicles.vehicleSno}
  //     let param: any = {};
  //     param.vehicleSno = this.orgvehicles[i].vehicleSno;
  //     console.log(param)
  //         this.api.get('8060/api/get_tyre_details_by_vehicle', param).subscribe(result => {
  //       console.log(result)
  //       if (result != null && result.data) {
  //         this.viewTyreDetails=result.data;       
  //         console.log(this.viewTyreDetails)
  //       }
  //     });
  // }

  // getOrgVehicle() {
  //   let param = { orgSno: this.user.orgSno}
  //       this.api.get('8053/api/get_operator_vehicle', param).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.orgvehicles = result.data
  //       // this.data=result.data;
     
  //       console.log(this.orgvehicles)
  //     }
  //   });
  // }


  // public closeModal() {
  //   this.ngOnInit();
  //   this.modalRef.close();
  // }

}
