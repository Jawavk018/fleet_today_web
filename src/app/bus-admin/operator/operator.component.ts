import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../theme/components/menu/menu.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { TokenStorageService } from '../login/token-storage.service';

@Component({
  selector: 'app-operator',
  standalone: true,
  imports: [CommonModule,FormsModule,ConfirmDialogModule,PipesModule,NgbModule],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})

export class OperatorComponent implements OnInit {

  temp = [];
  projects = [];
  operatorList:any=[];
  isNoOperators: boolean = false;

  public searchText: string;
  public record: any=[];
  public action: string = "";
  public actionMode: string = "";
  public modalRef: NgbModalRef;
  projectLists:any=[];
  selectIndex:any;
  reason:any;

  @ViewChild(DatatableComponent) table: DatatableComponent;

  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  selected = [];
  editing = {};
  isEdit: boolean = false;
  projectList:any;
  public form: UntypedFormGroup;
  isNoData:boolean=false;
  user : any;
  orgSno:any;
  isAdmin: boolean;
 

  constructor(
    private router: Router, 
    private api: ApiService,
    public fb: UntypedFormBuilder,
    public toastrService: ToastrService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
    private tokenStorageService: TokenStorageService
    ) {

      this.user = this.tokenStorageService.getUser();

    }

  ngOnInit() {

    let param: any = window.history.state;
    if (param.data) {
      this.orgSno = param.data.orgSno
    } else {
      this.orgSno =  this.user.orgSno
    }
    if(this.user.roleCd != 5){
      this.getOrganization();
    } 
    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/operator');
      if (index != -1) {
        this.isAdmin = this.user?.menus[index].isAdmin;
      }

      console.log('isAdmin',this.isAdmin)
      
  }
  
  gotoEditOperator(i?: any, isCopy?: string) {

    let navigationExtras: any = {
      state: {
        operator: this.operatorList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/editoperator'], navigationExtras);
  }

  getOrganization() {
    let params = {orgSno:this.orgSno};
    this.api.get('8053/api/get_org', params).subscribe(result => {
      if (result != null && result.data) {
        this.operatorList = result.data;
        console.log(this.operatorList)
      } else {
        this.isNoOperators = true;
      }
    })

  }

  goToAddNewProject() {
    this.router.navigate(['/addoperator'])
  }

  selectedIndex(i){
  this.selectIndex = i;
  }

  changeStatus(type: any) {
    let body: any = { orgSno: this.operatorList[this.selectIndex].orgSno, orgStatusCd: type == 'Approve' ? 19 : 58, type: type };
    body.appUserSno=this.user.appUserSno;
    // body.createdOn=this.api.networkData.timezone;
    body.createdOn = 'Asia/Kolkata';
    if (type == 'Reject') {
      body.reason = this.reason
    }
    this.api.post('8053/api/accept_reject_operator_kyc', body).subscribe(result => {
      if (result != null) {
        this.operatorList[this.selectIndex].orgStatusCd = body.orgStatusCd;
      }

    })
  }





}
