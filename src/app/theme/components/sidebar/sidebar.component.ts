import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { TokenStorageService } from 'src/app/bus-admin/login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { MenuService } from '../menu/menu.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MenuService ]
})
export class SidebarComponent implements OnInit {  
  public settings: Settings;
  authUser: any;
  public menuItems:Array<any>;
  constructor(public appSettings:AppSettings, public menuService:MenuService,private tokenStorage:TokenStorageService,private api: ApiService) {
      this.settings = this.appSettings.settings;
      this.menuItems =  this.tokenStorage.getUserMenus();
      // this.menuItems  = this.menuService.getVerticalMenuItems();
      // console.log(this.menuItems);
      // console.log(JSON.stringify(menuItems1))
  }

  ngOnInit() {     
    // if(sessionStorage["userMenuItems"]) {
    //   let ids = JSON.parse(sessionStorage.getItem("userMenuItems"));
    //   let newArr = [];
    //   ids.forEach(id => {
    //     let newMenuItem = this.menuItems.filter(mail => mail.id == id);
    //     newArr.push(newMenuItem[0]);
    //   });
    //   this.menuItems = newArr; 
    // }
    this.authUser = this.tokenStorage.getUser();
    if (this.authUser?.appUserSno) {
      this.getMenu();
    }
  }

  public closeSubMenus(){
    let menu = document.querySelector("#menu0");
    for (let i = 0; i < menu.children.length; i++) {
        let child = menu.children[i].children[1]; 
        if(child){
            if(child.classList.contains('show')){
              child.classList.remove('show');
              menu.children[i].children[0].classList.add('collapsed'); 
            }             
        }
    }
  }

  getMenu() {
    let param: any = {};
    param.roleCd = this.authUser.roleCd;
    param.appUserSno = this.authUser.appUserSno;
    param.name = 'menu';
    this.api.get('8052/api/get_menu_role', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.menuItems = result.data;
        this.authUser.menus = result.data;
        this.tokenStorage.saveUser(this.authUser)
        // this.tokenStorage.updateUserMenus(result.data);
      } else {

      }
    });
  }


}
