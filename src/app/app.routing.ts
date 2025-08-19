 import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, Router, NavigationEnd } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { BlankComponent } from './pages/blank/blank.component';
import { SearchComponent } from './pages/search/search.component';
import { NotFoundComponent } from './pages/errors/not-found/not-found.component';
import { BusAttendanceComponent } from './bus-admin/bus-attendance/bus-attendance.component';
import { BusFuelComponent } from './bus-admin/bus-fuel/bus-fuel.component';
import { DriverComponent } from './bus-admin/driver/driver.component';
import { LocationComponent } from './bus-admin/location/location.component';
import { OperatorComponent } from './bus-admin/operator/operator.component';
import { RegistervehicleComponent } from './bus-admin/registervehicle/registervehicle.component';
import { ReportComponent } from './bus-admin/report/report.component';
import { RouteComponent } from './bus-admin/route/route.component';
import { SingleComponent } from './bus-admin/single/single.component';
import { AddDriverComponent } from './bus-admin/driver/add-driver/add-driver.component';
import { TokenStorageService } from './bus-admin/login/token-storage.service';
import { ViewBookingComponent } from './bus-admin/view-booking/view-booking.component';
import { AddBookingComponent } from './bus-admin/add-booking/add-booking.component';
import { ReminderComponent } from './bus-admin/reminder/reminder.component';
import { SettingsComponent } from './bus-admin/settings/settings.component';
import { StaticdataComponent } from './bus-admin/staticdata/staticdata.component';
import { TyreComponent } from './bus-admin/tyre/tyre.component';
import { ViewtyreComponent } from './bus-admin/tyre/viewtyre/viewtyre.component';
import { NotificationComponent } from './bus-admin/notification/notification.component';
import { TyredetailsComponent } from './bus-admin/tyre/tyredetails/tyredetails.component';
import { AddtyreComponent } from './bus-admin/tyre/addtyre/addtyre.component';
import { OperatorAttendanceComponent } from './bus-admin/operator-attendance/operator-attendance.component';
import { AddOperatorAttendanceComponent } from './bus-admin/operator-attendance/add-operator-attendance/add-operator-attendance.component';
import { ViewDriverComponent } from './bus-admin/driver/view-driver/view-driver.component';
import { ChangePasswordComponent } from './bus-admin/change-password/change-password.component';
import { ViewvehicleComponent } from './bus-admin/registervehicle/viewvehicle/viewvehicle.component';
import { AddvehicleComponent } from './bus-admin/registervehicle/addvehicle/addvehicle.component';
import { DriverReportComponent } from './bus-admin/driver-report/driver-report.component';
import { FuelReportComponent } from './bus-admin/fuel-report/fuel-report.component';
import { BusReportComponent } from './bus-admin/bus-report/bus-report.component';
import { OperatorlistComponent } from './bus-admin/operatorlist/operatorlist.component';
import { ManagetyreComponent } from './bus-admin/tyre/managetyre/managetyre.component';
import { DriverlistComponent } from './bus-admin/driverlist/driverlist.component';
import { ApprovalComponent } from './bus-admin/approval/approval.component';
import { PrivacyPolicyComponent } from './bus-admin/privacy-policy/privacy-policy.component';
import { TermsComponent } from './terms/terms.component';
import { filter, takeUntil } from 'rxjs';
import { VehicleListComponent } from './bus-admin/vehicle-list/vehicle-list.component';
import { BusDashboardComponent } from './bus-admin/bus-dashboard/bus-dashboard.component';
import { AssignDriverComponent } from './bus-admin/assign-driver/assign-driver.component';
import { MenuPermissionComponent } from './menu-permission/menu-permission.component';
import { DrivingActionComponent } from './bus-admin/driving-action/driving-action.component';
import { TolldetailComponent } from './bus-admin/tolldetail/tolldetail.component';
import { DueDetailsComponent } from './bus-admin/due-details/due-details.component';
import { AddoperatorComponent } from './bus-admin/operator/addoperator/addoperator.component';
import { TripCalendarComponent } from './bus-admin/trip-calendar/trip-calendar.component';
import { FindBusComponent } from './bus-admin/find-bus/find-bus.component';
import { RentBusComponent } from './bus-admin/rent-bus/rent-bus.component';
import { TripCalculateComponent } from './bus-admin/trip-calculate/trip-calculate.component';
import { JobPostComponent } from './bus-admin/job-post/job-post.component';
import { JobSearchComponent } from './bus-admin/job-search/job-search.component';
import { AddjobComponent } from './bus-admin/addjob/addjob.component';
import { ViewPostComponent } from './view-post/view-post.component';
import { ViewDriverPostComponent } from './bus-admin/view-driver-post/view-driver-post.component';



export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      // { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule), data: { breadcrumb: 'Dashboard' } },
      // { path: 'membership', loadChildren: () => import('./pages/membership/membership.module').then(m => m.MembershipModule), data: { breadcrumb: 'Membership' } },
      // { path: 'ui', loadChildren: () => import('./pages/ui/ui.module').then(m => m.UiModule), data: { breadcrumb: 'UI' } },
      // { path: 'form-elements', loadChildren: () => import('./pages/form-elements/form-elements.module').then(m => m.FormElementsModule), data: { breadcrumb: 'Form Elements' } },
      // { path: 'tables', loadChildren: () => import('./pages/tables/tables.module').then(m => m.TablesModule), data: { breadcrumb: 'Tables' } },
      // { path: 'tools', loadChildren: () => import('./pages/tools/tools.module').then(m => m.ToolsModule), data: { breadcrumb: 'Tools' } },
      // { path: 'calendar', loadChildren: () => import('./pages/calendar/app-calendar.module').then(m => m.AppCalendarModule), data: { breadcrumb: 'Calendar' } },
      // { path: 'mailbox', loadChildren: () => import('./pages/mailbox/mailbox.module').then(m => m.MailboxModule), data: { breadcrumb: 'Mailbox' } },
      // { path: 'maps', loadChildren: () => import('./pages/maps/maps.module').then(m => m.MapsModule), data: { breadcrumb: 'Maps' } },
      // { path: 'charts', loadChildren: () => import('./pages/charts/charts.module').then(m => m.ChartsModule), data: { breadcrumb: 'Charts' } },
      // { path: 'dynamic-menu', loadChildren: () => import('./pages/dynamic-menu/dynamic-menu.module').then(m => m.DynamicMenuModule), data: { breadcrumb: 'Dynamic Menu' } },
      // { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule), data: { breadcrumb: 'Profile' } },
      // { path: 'blank', component: BlankComponent, data: { breadcrumb: 'Blank page' } },
      // { path: 'search', component: SearchComponent, data: { breadcrumb: 'Search' } },

      { path: 'busAttendance', component: BusAttendanceComponent, title: "bus attendance", data: { breadcrumb: 'Bus Attendance' } },
      { path: 'busFuel', component: BusFuelComponent, title: "bus fuel", data: { breadcrumb: 'Bus Fuel' } },
      { path: 'bus-report', component: BusReportComponent, title: "bus report", data: { breadcrumb: 'Bus Report' } },

      { path: 'driver', component: DriverComponent, title: "driver", data: { breadcrumb: 'Driver' } },
      { path: 'add-driver', component: AddDriverComponent, title: "add driver", data: { breadcrumb: 'Add Driver' } },

      { path: 'driver-report', component: DriverReportComponent, title: "driver report", data: { breadcrumb: 'Driver Report' } },
      { path: 'fuel-report', component: FuelReportComponent, title: "fuel report", data: { breadcrumb: 'Fuel Report' } },
      { path: 'location', component: LocationComponent, title: "location", data: { breadcrumb: 'Location' } },


      { path: 'operator', component: OperatorComponent, title: "operator", data: { breadcrumb: 'Operator' } },
      { path: 'addoperator', component: AddoperatorComponent, title: "addoperator", data: { breadcrumb: 'Add operator' } },

      { path: 'operatorlist', component: OperatorlistComponent, title: "operatorlist", data: { breadcrumb: 'Operators' } },

      { path: 'registervehicle', component: RegistervehicleComponent, title: "registervehicle", data: { breadcrumb: 'Vehicle' } },
      { path: 'addvehicle', component: AddvehicleComponent, title: "addvehicle", data: { breadcrumb: 'Add Vehicle' } },
      { path: 'editvehicle', component: AddvehicleComponent, title: "addvehicle", data: { breadcrumb: 'Edit Vehicle' } },
      { path: 'viewvehicle', component: ViewvehicleComponent, title: "viewvehicle", data: { breadcrumb: 'View Vehicle' } },

      { path: 'report', component: ReportComponent, title: "report", data: { breadcrumb: 'Report' } },
      { path: 'route', component: RouteComponent, title: "route", data: { breadcrumb: 'Route' } },
      { path: 'single', component: SingleComponent, title: "single", data: { breadcrumb: 'Single' } },

      { path: 'vehiclelist', component: VehicleListComponent, title: "vehicle-list", data: { breadcrumb: 'Vehicles' } },
      { path: 'view-booking', component: ViewBookingComponent, title: "view-booking", data: { breadcrumb: 'View Booking' } },
      { path: 'add-booking', component: AddBookingComponent, title: "add-booking", data: { breadcrumb: 'Add Booking' } },
      { path: 'edit-booking', component: AddBookingComponent, title: "add-booking", data: { breadcrumb: 'Edit Booking' } },
      { path: 'calendar', component: TripCalendarComponent, title: "calendar", data: { breadcrumb: 'Calendar' } },

      { path: 'reminder', component: ReminderComponent, title: "reminder", data: { breadcrumb: 'Reminder' } },
      { path: 'settings', component: SettingsComponent, title: "settings", data: { breadcrumb: 'Settings' } },
      { path: 'addstaticdata', component: StaticdataComponent, title: "addstaticdata", data: { breadcrumb: 'Add Static Data' } },

      { path: 'operatorAttendance', component: OperatorAttendanceComponent, title: "Operator Attendance", data: { breadcrumb: 'Operator Attendance' } },
      { path: 'addOperatorAttendance', component: AddOperatorAttendanceComponent, title: "Add Operator Attendance", data: { breadcrumb: 'Add Operator Attendance' } },
      { path: 'tyre', component: TyreComponent, title: "tyre", data: { breadcrumb: 'Tyre' } },
      { path: 'addtyre', component: AddtyreComponent, title: "addtyre", data: { breadcrumb: 'Add Tyre' } },
      { path: 'managetyre', component: ManagetyreComponent, title: "managetyre", data: { breadcrumb: 'Manage Tyre' } },
      { path: 'bus-dashboard', component: BusDashboardComponent, title: "bus-dashboard", data: { breadcrumb: 'Bus Dashboard' } },
      { path: 'viewtyre', component: ViewtyreComponent, title: "viewtyre", data: { breadcrumb: 'View Tyre' } },
      { path: 'tyredetails', component: TyredetailsComponent, title: "tyredetails", data: { breadcrumb: 'Tyre Details' } },
      { path: 'view-driver', component: ViewDriverComponent, title: "view-driver", data: { breadcrumb: 'View Driver' } },
      { path: 'changePassword', component: ChangePasswordComponent, title: "changePassword", data: { breadcrumb: 'Change Password' } },
      { path: 'notification', component: NotificationComponent, title: "notification", data: { breadcrumb: 'Notification' } },
      { path: 'editoperator', component: AddoperatorComponent, title: "editoperator", data: { breadcrumb: 'Edit Operator' } },
      { path: 'assign-driver', component: AssignDriverComponent, title: "assign-driver", data: { breadcrumb: 'assign-driver' } },

      { path: 'driverlist', component: DriverlistComponent, title: "driverlist", data: { breadcrumb: 'Drivers' } },
      { path: 'approval', component: ApprovalComponent, title: "approval", data: { breadcrumb: 'Approval' } },
      { path: 'menu-permission', component: MenuPermissionComponent, title: "menu-permission", data: { breadcrumb: 'menu-permission' } },
      { path: 'driving-action', component: DrivingActionComponent, title: "driving", data: { breadcrumb: 'driving' } },
      { path: 'tolldetail', component: TolldetailComponent, title: "tolldetail", data: { breadcrumb: 'Toll Detail' } },
      { path: 'due-details', component: DueDetailsComponent, title: "due-details", data: { breadcrumb: 'due-details' } },


      { path: 'find-bus', component: FindBusComponent, title: "find-bus", data: { breadcrumb: 'Find a Bus' } },
      { path: 'rent-bus', component: RentBusComponent, title: "rent-bus", data: { breadcrumb: 'Rent a Bus' } },
      { path: 'trip-calculate', component: TripCalculateComponent, title: "trip-calculate", data: { breadcrumb: 'Trip Calculate' } },

      { path: 'job-post', component: JobPostComponent, title: "job-post", data: { breadcrumb: 'job-post' } },
      { path: 'addjob', component: AddjobComponent, title: "addjob", data: { breadcrumb: 'addjob' } },
      { path: 'edit-post', component: AddjobComponent, title: "edit-post", data: { breadcrumb: 'aedit-post' } },
      { path: 'job-search', component: JobSearchComponent, title: "job-search", data: { breadcrumb: 'job-search' } },
      { path: 'view-post', component: ViewPostComponent, title: "view-post", data: { breadcrumb: 'view-post' } },
      { path: 'view-driver-post', component: ViewDriverPostComponent, title: "view-driver-post", data: { breadcrumb: 'view-driver-post' } },

    ]
  },
  { path: 'login', loadChildren: () => import('./bus-admin/login/login.module').then(m => m.LoginModule) },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule) },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: "privacy-policy", data: { breadcrumb: 'privacy-policy' } },
  { path: 'terms', component: TermsComponent, title: "terms", data: { breadcrumb: 'terms & condition' } },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules, // <- comment this line for activate lazy load
      relativeLinkResolution: 'legacy',
      // useHash: true
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {

  constructor(private router: Router, private tokenStorage: TokenStorageService) {
    // let unsubscribe = this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe((event: NavigationEnd) => {
    //     const componentName = this.getComponentName(event.urlAfterRedirects);
    //     unsubscribe.unsubscribe();
    //     console.log('Current component name:', componentName);
    //     if (componentName == 'terms') {
    //       this.router.navigateByUrl('/terms')

    //     } else if (componentName == 'privacy-policy') {
    //       this.router.navigateByUrl('/privacy-policy')

    //     } else {
    //       let authUser: any = this.tokenStorage.getUser();
    //       if (authUser?.appUserSno && authUser?.isPassword)
    //         this.router.navigateByUrl('/bus-dashboard')
    //       else
    //         this.router.navigateByUrl('/login')
    //     }
    //   });

  }

  getComponentName(url: string): string {
    // Extract the component name from the URL
    const segments = url.split('/');
    const componentName = segments[segments.length - 1];

    return componentName;
  }

}