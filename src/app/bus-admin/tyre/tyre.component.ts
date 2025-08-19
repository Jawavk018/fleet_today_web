import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { PipesModule } from 'src/app/theme/pipes/pipes.module';
import { MenuService } from '../../theme/components/menu/menu.service';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-tyre',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogModule, PipesModule, AutocompleteLibModule, MatPaginatorModule],
  templateUrl: './tyre.component.html',
  styleUrls: ['./tyre.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class TyreComponent implements OnInit {

  tyreList = [];
  orgSno: any;
  tyreSno: any;
  user: any;
  location: any;
  isAdmin: boolean = false;
  searchKey: String = '';
  searchTyre = new Subject<any>();
  isLoading: boolean = false;
  isNoRecord: boolean = false;
  public actionMode: string = "";
  public record: any = [];
  selectedTyre: any;
  public action: string = "";
  public modalRef: NgbModalRef;
  public form: UntypedFormGroup;
  isNoData: boolean = false;
  editing = {};
  selected = []

  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;

  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  tyreCompanyList: any = [];

  public tyreCompanySno: FormControl = new FormControl();
  public status: FormControl = new FormControl();

  constructor(
    private router: Router,
    private api: ApiService,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    public modalService: NgbModal,
    private confirmDialogService: ConfirmDialogService,
  ) {
    this.user = this.tokenStorageService.getUser();
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit(): void {

    let param: any = window.history.state;
    console.log(param.status)
    this.tyreList = [];

    if(param.status == 'Total Running Tyres'){
      this.status.patchValue('running');
    }

    if(param.status == 'Total Stock Tyres'){
      this.status.patchValue('stock');
    }
    this.getTyre();
    // this.getTyreCount();
    this.getTyreCompany();

    this.searchTyre
      .subscribe((value: any) => {
        this.tyreList = [];
        this.skip = 0;
        // this.getTyreCount();
        this.getTyre();
      });

    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/tyre');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }
    

   
  }

  goToAddNewTyre() {
    let navigationExtras: any = {
      state: {
        orgSno: this.user.orgSno,
      }
    };
    this.router.navigateByUrl('/addtyre', navigationExtras);
  }

  getTyreCount() {
    let param: any = { orgSno: this.user.orgSno, activeFlag: true, searchKey: this.searchKey, }

    if(this.tyreCompanySno.value != null && this.tyreCompanySno.value != 'null'){
      param.tyreCompanySno = this.tyreCompanySno.value
    }

    if(this.status.value != null && this.status.value != 'null'){
      param.status = this.status.value
    }
    console.log(param)
    this.api.get('8060/api/get_tyre_count', param).subscribe(result => {
      this.isLoading = false;
      console.log(result)
      if (result != null) {
        if (result.data?.length) {
          this.count = result.data[0]?.counts;
          // this.getTyre();
        } 
        else {
          this.isNoRecord = true;
        }
      } else {
        this.isNoRecord = true;
      }
    });
  }

  getTyre() {
    this.getTyreCount();

    let param: any = { orgSno: this.user.orgSno, activeFlag: true, searchKey: this.searchKey }
    if (this.tyreCompanySno.value != null && this.tyreCompanySno.value != 'null') {
      console.log(this.tyreCompanySno.value)
      param.tyreCompanySno = this.tyreCompanySno.value
    }
    if (this.status.value != null && this.status.value != 'null') {
      param.status = this.status.value
    }
    param.skip = this.skip
    param.limit = this.limit
    this.isLoading = true;
    this.tyreList = [];
    this.isNoRecord = false;
    console.log(param)
    this.api.get("8060/api/get_tyre", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            this.tyreList = result.data;
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

  getMoreTyre(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getTyre();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getTyre();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.tyreList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.tyreList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getTyre();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

  public openModal(i, modalContent, mode) {
    this.actionMode = mode;
    this.record = this.tyreList;
    if (this.record && mode == 'u') {
      this.goToEditProject(i);
    }

    else if (this.record && mode == 'v') {
      this.selectedTyre = this.tyreList[i];
      window.scrollTo(0, 0)
      this.action = "View Tyre Details";
    }
    else {
      this.action = "Adding New Tyre...";
    }
    this.modalRef = this.modalService.open(modalContent, { container: '.app' });
    this.modalRef.result.then((result) => {
      this.form?.reset();
    }, (reason) => {
      this.form?.reset();
    });
  }
  totalKm(a: any, b: any) {
    return (parseInt(a) + parseInt(b))

  }

  gotoViewTyre(i?: any, isCopy?: string) {
    let navigationExtras: any = {
      state: {
        tyre: this.tyreList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/viewtyre'], navigationExtras);
  }

  goToEditProject(i?: any, isCopy?: string) {

    let navigationExtras: any = {
      state: {
        tyre: this.tyreList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/addtyre'], navigationExtras);
  }


  public deleteTyre(i: any) {
    let confirmText = "Are you sure to Delete ? ";
    this.confirmDialogService.confirmThis(confirmText, () => {
      let params: any = {};
      params.tyreSno = this.tyreList[i].tyreSno;
      console.log(params)
      this.tyreList.splice(i, 1);
      this.api.delete('8060/api/delete_tyre', params).subscribe(result => {
        if (result != null && result) {
        }
      })
      this.toastrService.success('Tyre delete Successfully');
    }, () => {
    });

  }

  public closeModal() {
    this.ngOnInit();
    this.modalRef.close();
  }

  public getTyreCompany() {
    let param: any = {};
    this.api.get('8054/api/get_tyre_company', param).subscribe(result => {
      console.log(result);
      if (result != null && result.data) {
        this.tyreCompanyList = result.data;
        console.log(this.tyreCompanyList)
      } else {

      }
    });
  }


}


