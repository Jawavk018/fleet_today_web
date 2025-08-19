import { Injectable } from '@angular/core';
import { Settings } from './app.settings.model';

@Injectable()
export class AppSettings {
    public settings = new Settings(
        'BusToday',
        'Angular Admin Template with Bootstrap 4',
        {
            menu: 'vertical', //horizontal , vertical
            menuType: 'compact', //default, compact, mini
            showMenu: true,
            navbarIsFixed: true,
            footerIsFixed: false,
            sidebarIsFixed: true,
            showSideChat: false,
            sideChatIsHoverable: true,
            skin: 'light'  //light , dark, blue, green, combined, purple, orange, brown, grey, pink          
        }
    )
}