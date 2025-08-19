import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { TokenStorageService } from '../login/token-storage.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-driver-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-driver-post.component.html',
  styleUrls: ['./view-driver-post.component.scss']
})
export class ViewDriverPostComponent implements OnInit {
  
  postList: any = [];
  post:any;
  mileageList:any = [];
  appUser : any;
  isLoading: boolean = false;
  isNoRecord: boolean = false;


  constructor(
    public location: Location,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    private api: ApiService
  ) {
    let param: any = window.history.state;
    this.post = param.post;
    console.log(this.post);
    this.appUser = this.tokenStorageService.getUser();
   }

  ngOnInit(): void {
  }

  closeView(){
    this.location.back();
  }

  checkLicenseExpiry(post){
    let currentDate: any = new Date();
    let dateSent: any = new Date(post.licenceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }
  checkTransportlicenceExpiry(post){
    let currentDate: any = new Date();
    let dateSent: any = new Date(post.transportlicenceExpiryDate);
    let count = Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    if (count > 30) {
      return 'text-success'
    } else if (count > 10) {
      return 'text-warning'
    } else {
      return 'text-danger'
    }
  }

}
