import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; 
export function HttpLoaderFactory(httpClient: HttpClient) { 
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { AgmCoreModule } from '@agm/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'; 

import { ToastrModule } from 'ngx-toastr';
import { PipesModule } from './theme/pipes/pipes.module';

import { AppRoutingModule } from './app.routing';
import { AppSettings } from './app.settings';

import { AppComponent } from './app.component';
import { PagesComponent } from './pages/pages.component';
import { HeaderComponent } from './theme/components/header/header.component';
import { FooterComponent } from './theme/components/footer/footer.component';
import { SidebarComponent } from './theme/components/sidebar/sidebar.component';
import { VerticalMenuComponent } from './theme/components/menu/vertical-menu/vertical-menu.component';
import { HorizontalMenuComponent } from './theme/components/menu/horizontal-menu/horizontal-menu.component';
import { BreadcrumbComponent } from './theme/components/breadcrumb/breadcrumb.component';
import { BackTopComponent } from './theme/components/back-top/back-top.component';
import { FullScreenComponent } from './theme/components/fullscreen/fullscreen.component';
import { ApplicationsComponent } from './theme/components/applications/applications.component';
import { MessagesComponent } from './theme/components/messages/messages.component';
import { UserMenuComponent } from './theme/components/user-menu/user-menu.component';
import { FlagsMenuComponent } from './theme/components/flags-menu/flags-menu.component';
import { SideChatComponent } from './theme/components/side-chat/side-chat.component';
import { FavoritesComponent } from './theme/components/favorites/favorites.component';
import { BlankComponent } from './pages/blank/blank.component';
import { SearchComponent } from './pages/search/search.component';
import { NotFoundComponent } from './pages/errors/not-found/not-found.component';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ManagetyreComponent } from './bus-admin/tyre/managetyre/managetyre.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChangePasswordComponent } from './bus-admin/change-password/change-password.component';
import { MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from './bus-admin/login/login.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ScheduleModule, RecurrenceEditorModule, DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService } from '@syncfusion/ej2-angular-schedule';
import { AgmDirectionModule } from 'agm-direction';


// initializeApp({
//   apiKey: "AIzaSyABJorEL7U_EFzSgkvVbf0LDbmC-3xJTso",
//   authDomain: "bustoday-b5aca.firebaseapp.com",
//   projectId: "bustoday-b5aca",
//   storageBucket: "bustoday-b5aca.appspot.com",
//   messagingSenderId: "367001029957",
//   appId: "1:367001029957:web:229df084300e93086c822c",
//   measurementId: "G-PMFCXZ7WYC", 
// });

@NgModule({  
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    NgbModule,
    MatButtonModule,
    MatIconModule,
    ManagetyreComponent,
    MultiselectDropdownModule,
    AutocompleteLibModule,
    MatDialogModule,
    NgOtpInputModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAO7Mg2Cs1qzo_3jkKkZAKY6jtwIlm41-I'
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAIlF9Gq02HuzE64jX_U0E3FcIs_TZsNJM',
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    ToastrModule.forRoot(), 
    PipesModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ScheduleModule,
    RecurrenceEditorModule,
    AgmDirectionModule,     // agm-direction

    
    
  ],
  declarations: [
    AppComponent,
    PagesComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    VerticalMenuComponent,
    HorizontalMenuComponent,
    BreadcrumbComponent,
    BackTopComponent,
    FullScreenComponent,
    ApplicationsComponent,
    MessagesComponent,
    UserMenuComponent,
    FlagsMenuComponent,
    SideChatComponent,
    FavoritesComponent,
    BlankComponent,
    SearchComponent,
    ChangePasswordComponent,
    NotFoundComponent,
    LoginComponent  ],
  providers: [ 
    DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService,
    DatePipe,
    AppSettings,
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }


  ],	

  bootstrap: [ AppComponent ]
})
export class AppModule { 

} 