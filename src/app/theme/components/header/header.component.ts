import { Component, OnInit, ViewEncapsulation, HostListener, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { MenuService } from '../menu/menu.service';
import { MessagesComponent } from '../messages/messages.component';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from 'src/app/bus-admin/login/token-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService],
  animations: [
    trigger('showInfo', [
      state('1', style({ transform: 'rotate(180deg)' })),
      state('0', style({ transform: 'rotate(0deg)' })),
      transition('1 => 0', animate('400ms')),
      transition('0 => 1', animate('400ms'))
    ])
  ]
})


export class HeaderComponent implements OnInit {
  user:any;
  public showHorizontalMenu: boolean = true;
  public showInfoContent: boolean = false;
  public settings: Settings;
  public menuItems: Array<any>;
  @ViewChild('messages') message: MessagesComponent;
  operatorList:any=[];
  constructor(public appSettings: AppSettings,
    public menuService: MenuService,
    public tokenStorage: TokenStorageService,
    private api: ApiService,
    private router:Router
  ) {
    this.settings = this.appSettings.settings;
    this.menuItems = this.menuService.getHorizontalMenuItems();
  }

  ngOnInit() {
    this.user=this.tokenStorage.getUser();
    this.getOrganization();
    if (window.innerWidth <= 768)
      this.showHorizontalMenu = false;
  }

  public closeSubMenus() {
    let menu = document.querySelector("#menu0");
    if (menu) {
      for (let i = 0; i < menu.children.length; i++) {
        let child = menu.children[i].children[1];
        if (child) {
          if (child.classList.contains('show')) {
            child.classList.remove('show');
            menu.children[i].children[0].classList.add('collapsed');
          }
        }
      }
    }
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (window.innerWidth <= 768) {
      this.showHorizontalMenu = false;
    }
    else {
      this.showHorizontalMenu = true;
    }
  }

  
  async goToLogout() {
  this.tokenStorage.signOut();
  await window.sessionStorage.clear();

  this.router.navigate(['/login'], {replaceUrl: true})
  // window.location.reload();
}
getOrganization() {
  let params = { orgSno: this.user.orgSno, appUserSno: this.user.appUserSno };
  this.api.get('8053/api/get_org', params).subscribe(result => {
    if (result != null && result.data) {
      this.operatorList = result.data;
      console.log(this.operatorList)
    } 
  })

}

}
