import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../providers/material/material.module';
import { TokenStorageService } from '../bus-admin/login/token-storage.service';
import { ApiService } from '../providers/api/api.service';
import { SidebarComponent } from '../theme/components/sidebar/sidebar.component';
import { FormsModule, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-menu-permission',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ConfirmDialogModule, MatSlideToggleModule],
  templateUrl: './menu-permission.component.html',
  styleUrls: ['./menu-permission.component.scss']
})
export class MenuPermissionComponent implements OnInit {
  // isChecked = false; 
  authUser: any;
  sidebar: SidebarComponent | any;
  menuList: any = [];
  updateList: any = [];
  appMenuSno: number;
  assignUserList: Array<any> = [];
  unAssignUserList: Array<any> = [];
  isAdmin: boolean;
  isLoad: boolean = false;
  constructor(private tokenStorageService: TokenStorageService,
    private api: ApiService, private toastrService: ToastrService,
    public confirmDialogService: ConfirmDialogService) { }

  ngOnInit(): void {
    this.authUser = this.tokenStorageService.getUser();
    this.getMenu();

    let index = this.authUser?.menus?.findIndex((menu) => menu?.routerLink == '/menu-permission');
      if (index != -1) {
        this.isAdmin = this.authUser?.menus[index].isAdmin;
      }
      console.log('isAdmin',this.isAdmin)
      console.log('isLoad',this.isLoad)
  }
  getMenu() {
    this.menuList = [];
    let param: any = {};
    param.roleCd = this.authUser.roleCd;
    param.appUserSno = this.authUser.appUserSno;
    param.name = 'menu';
    this.api.get('8052/api/get_menu_role', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        // this.tokenStorage.updateUserMenus(result.data);
        this.sidebar = result.data;
        for (let i = 0; i < result?.data?.length; i++) {
          if (result?.data[i].title != 'Dashboard' && result?.data[i].title != 'Notification') {
            this.menuList?.push(result.data[i])
          }
        }

        this.appMenuSno = this.menuList[0]?.appMenuSno;
        this.getAssignUnAssign();
        console.log(this.menuList)
      } else {

      }
    });
  }
  onChange() {
    this.getAssignUnAssign();
  }
  getAssignUnAssign() {
    this.assignUserList=[];
    this.unAssignUserList=[];
    let param: any = {};
    param.orgSno = this.authUser.orgSno;
    param.appMenuSno = this.appMenuSno;
    this.api.get('8053/api/get_assign_un_assigin_user', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        for (let i = 0; i < result.data[0]?.unAssignUserList?.length; i++) {
          if (result.data[0]?.unAssignUserList[i]) {
            this.unAssignUserList?.push(result.data[0]?.unAssignUserList[i]);
          }
        }
        for (let j = 0; j < result.data[0]?.assignUserList?.length; j++) {
          if (result.data[0]?.assignUserList[j]) {
            this.assignUserList?.push(result.data[0]?.assignUserList[j]);
          }
        }
        // this.unAssignUserList = result.data[0]?.unAssignUserList;
        // this.assignUserList = result.data[0]?.assignUserList;
        console.log(this.assignUserList)
        // this.tokenStorage.updateUserMenus(result.data);
        //         this.sidebar = result.data;
        //         this.menuList=result.data;
        // console.log(this.menuList)
      } else {

      }
    });
  }

  addMenuUser(i: number) {
    if (this.assignUserList == null) {
      this.assignUserList = [];
    }
    let body: any = {};
    body.appMenuSno = this.appMenuSno;
    body.appUserSno = this.unAssignUserList[i]?.appUserSno;
    body.roleCd = this.unAssignUserList[i]?.contactRoleCd;
    console.log(body);
    this.isLoad = true;
    this.api.post('8052/api/insert_app_menu_user', body).subscribe(result => {
      this.isLoad = false;
      if (result != null && result.data) {
        this.assignUserList.push(this.unAssignUserList[i]);
        this.unAssignUserList.splice(i, 1)
        this.toastrService.success('menu assigned successfully');
      }
    });
    console.log('isLoad Add',this.isLoad)
  }

  deleteMenuUser(i: number) {
    let confirmText = "Are you sure to Remove ? ";
    this.confirmDialogService?.confirmThis(confirmText, () => {
      let body: any = {
        appMenuSno: this.appMenuSno,
        roleCd: this.assignUserList[i].contactRoleCd,
        appUserSno: this.assignUserList[i]?.appUserSno
      };
      console.log(body)
      this.api.delete('8052/api/delete_menu_user_and_role', body).subscribe((result: any) => {
        console.log(result);
        if (result != null ) {
          this.unAssignUserList.push(this.assignUserList[i]);
          this.assignUserList.splice(i, 1);
          this.toastrService.success(" Removed Successfully");
        }
        console.log('isLoad Delete',this.isLoad)
      })
    }, () => {
    });
  }

  updateMenuUser(i: number,event){
    let body: any ={
      appMenuSno: this.appMenuSno,
        appUserSno: this.assignUserList[i]?.appUserSno,
        isAdmin: event.checked,
    };
    console.log(body)
      this.api.put('8052/api/update_app_menu_user', body).subscribe(result => {
        console.log(result)
        if (result != null && result) {
          this.toastrService.success("Status Updated Successfully");
        }
      });
  }


}
