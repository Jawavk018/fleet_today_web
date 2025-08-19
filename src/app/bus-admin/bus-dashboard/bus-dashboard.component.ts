import { Component, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { VisitorsComponent } from 'src/app/pages/dashboard/visitors/visitors.component';
import { CostComponent } from 'src/app/pages/dashboard/cost/cost.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {MatGridListModule} from '@angular/material/grid-list';



@Component({
  selector: 'app-bus-dashboard',
  standalone: true,
  imports: [CommonModule,MatIconModule,VisitorsComponent,CostComponent,MatGridListModule],
  templateUrl: './bus-dashboard.component.html',
  styleUrls: ['./bus-dashboard.component.scss']
})
export class BusDashboardComponent implements OnInit {

  user: any;
  dashboardList: any = [];
  dashboardCountList : any = [];
  operatorList: any = [];
  statusList: any = [];
  selecteDate: any;
  expiryList:any=[];
  blinkCard : any = 'zoom-in-out-box';
  expiryListDtl:any=[];
  @Input(`ngHoverClass`)
  set classesToAply(v: string | string[]){
     this.classes = Array.isArray(v) ? v: v.split(' ');
  }
  private classes: string[] = [];

  constructor( 
    private api: ApiService,
    private router: Router,
    private toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    private renderer: Renderer2,
    private element: ElementRef) 
    { 
   
  }


  getValue(data:any){
return Math.round(data);
  }
  @HostListener('mouseover')
  onHover(){
    this.classes.forEach(c=> this.renderer.addClass(this.element.nativeElement, c));
  }

  @HostListener('mouseleave')
  onLeave(){
    this.classes.forEach(c=> this.renderer.removeClass(this.element.nativeElement, c));
  }

  ngOnInit(): void {
    this.user = this.tokenStorageService.getUser();
    if(this.user.roleCd != 5){
      this.getDashboardCount();
    }  
      this.getOrganization();
  }
  iconList=[
    {"icon":"fa fa-truck"},{"icon":"fa fa-bus"},{"icon":"fa fa-bus"},{"icon":"fa fa-bus"},
    {"icon":"fa fa-phone"},{"icon":"fa fa-calendar-check-o"},{"icon":"fa fa-home"},
    {"icon":"fa fa-user"},{"icon":"fa fa-road"},{"icon":"fa fa-bus"},
    {"icon":"fa fa-bus"},{"icon":"fa fa-bus"},{"icon":"fa fa-tire"}
  ]

  getDashboardCount() {
    let params = { orgSno: this.user.orgSno , roleCd:this.user.roleCd, currentDate : this.api.dateToSavingStringFormatConvertion(new Date())};
    this.api.get("8053/api/get_dashboard_count", params).subscribe(result => {
      console.log(result)
      if (result.data != null && result.data.length > 0) {
        this.dashboardList = result.data[0].dashboard;
        this.dashboardCountList = result.data[0].dashboardList;
        this.expiryList=result.data[0].expiryList;
        this.expiryListDtl=result.data[0].expiryListDtl;
        this.statusList=result.data[0].statusList
        console.log(this.dashboardCountList)
      } else {
      }
    });
  }

  goToPage(path:any,name:any,count:number){
    if(count > 0){
      let navigationExtras: any = {
        state: {
          name: name != 'Total Vehicles' ? name : null,
          status: name != 'Total Vehicles' ? name : null,
          count: name != 'Total Vehicles' ? count : null,
          selecteDate : this.selecteDate = 10,
        }
      };
      this.router.navigateByUrl('/'+path,navigationExtras);
    }else{
      this.toastrService.error('No  '+ name +'  found')
    }
  }

  getOrganization() {
    let params = { orgSno: this.user.orgSno };
    this.api.get('8053/api/get_org', params).subscribe(result => {
      if (result != null && result.data) {
        this.operatorList = result.data;
        console.log(this.operatorList)
      } 
    })

  }
}