import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppSettings } from './app.settings';
import { Settings } from './app.settings.model';
import { MessagingService } from './providers/fire/messaging.service';
import { SidebarComponent } from './theme/components/sidebar/sidebar.component';
import { ApiService } from './providers/api/api.service';
import { filter } from 'rxjs';
import { TokenStorageService } from './bus-admin/login/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  sidebar: SidebarComponent | any;
  public settings: Settings;
  authUser: any;

  constructor(public appSettings: AppSettings, private router: Router,
    private messageService: MessagingService, public translate: TranslateService, private tokenStorage: TokenStorageService,
    private api: ApiService,
  ) {
    this.settings = this.appSettings.settings;
    translate.addLangs(['en', 'de', 'fr', 'ru', 'tr']);
    translate.setDefaultLang('en');
    translate.use('en');
    // this.messageService.requestPermission();
    // this.messageService.receivedMsg();
  }

  ngOnInit() {
    this.authUser = this.tokenStorage.getUser();
    // console.log(this.authUser)
    // this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe((event: NavigationEnd) => {
    //     const componentName = this.getComponentName(event.urlAfterRedirects);
    //     console.log(componentName);
    //     console.log(componentName?.trim()?.length)
    // console.log(this.authUser)

    //     if (this.authUser?.appUserSno) {
    //       this.router.navigateByUrl('/bus-dashboard');
    //       this.getMenu();
    //     }
    //     else{
    //       this.router.navigateByUrl('/login');
    //     }
    //     // if (this.authUser?.appUserSno) {
    //     //   this.router.navigateByUrl('/bus-dashboard');
    //     //   this.getMenu();
    //     // }else{
    //     //   this.router.navigateByUrl('/login');
    //     // }
    //   });
    // // if (!this.api.isEmpty(this.authUser)) {
    // //   this.getToken();

    // // }
    console.log(this.authUser)

    if (this.authUser?.appUserSno) {
      this.router.navigateByUrl('/bus-dashboard');
      this.getMenu();
    }
    else{
      this.router.navigateByUrl('/login');
    }
  }

  getComponentName(url: string): string {
    // Extract the component name from the URL
    const segments = url.split('/');
    const componentName = segments[segments.length - 1];

    return componentName;
  }

  getMenu() {
    let param: any = {};
    param.roleCd = this.authUser.roleCd;
    param.appUserSno = this.authUser.appUserSno;
    param.name = 'menu';
    this.api.get('8052/api/get_menu_role', param).subscribe(result => {
      console.log(result)
      if (result != null && result.data) {
        this.authUser.menus = result.data;
        this.tokenStorage.saveUser(this.authUser)
        this.sidebar = result.data;
        // this.tokenStorage.updateUserMenus(result.data);
      } else {

      }
    });
  }

  getToken() {
    // this.msalBroadcastService.msalSubject$
    //   .pipe(
    //     filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
    //   )
    //   .subscribe((result: EventMessage) => {
    //     console.log(result);
    //     const payload = result.payload as AuthenticationResult;
    //     this.authService.instance.setActiveAccount(payload.account);
    //   });
  }



  /* These following methods used for theme preview, you can remove this methods */

  // ngOnInit() { 
  //     var demo = this.getParameterByName('demo');
  //     this.setLayout(demo);
  // }

  // private getParameterByName(name) {
  //     var url = window.location.href;
  //     name = name.replace(/[\[\]]/g, "\\$&");
  //     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  //         results = regex.exec(url);
  //     if (!results) return null;
  //     if (!results[2]) return '';
  //     return decodeURIComponent(results[2].replace(/\+/g, " "));
  // }

  // private setLayout(demo){
  //      switch (demo) {
  //         case "vertical-default":
  //             this.settings.theme.menu = 'vertical';
  //             this.settings.theme.menuType = 'default';
  //             break;
  //         case "vertical-compact":
  //             this.settings.theme.menu = 'vertical';
  //             this.settings.theme.menuType = 'compact';
  //             break;
  //         case "vertical-mini":
  //             this.settings.theme.menu = 'vertical';
  //             this.settings.theme.menuType = 'mini';
  //             break;
  //         case "horizontal-default":
  //             this.settings.theme.menu = 'horizontal';
  //             this.settings.theme.menuType = 'default';
  //             break;
  //         case "horizontal-compact":
  //             this.settings.theme.menu = 'horizontal';
  //             this.settings.theme.menuType = 'compact';
  //             break;
  //         case "horizontal-mini":
  //             this.settings.theme.menu = 'horizontal';
  //             this.settings.theme.menuType = 'mini';
  //             break;
  //         default:
  //             this.settings.theme.menu = 'vertical';
  //             this.settings.theme.menuType = 'default';
  //     }
  //     this.router.navigate(['/']);
  // }

}
