import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { TokenStorageService } from '../bus-admin/login/token-storage.service';
import { ApiService } from '../providers/api/api.service';

@Component({
  selector: 'app-view-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {

  jobList : any = [];
  job:any;
  appUser : any;

  constructor( public location: Location,
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
    private api: ApiService) {
      let param: any = window.history.state;
    
      this.job = param.job;
      console.log(this.job);
      this.appUser = this.tokenStorageService.getUser();
     }

  ngOnInit(): void {
    // this.getpost();
  }

  closeView(){
    this.location.back();
  }

  // getpost() {
  //   let param = { jobPostSno: this.job.jobPostSno}
  //   this.api.get('8055/api/get_job_post', param).subscribe(result => {
  //     if (result != null && result.data) {
  //       this.jobList = result.data;
  //       console.log(this.jobList)
  //     }
  //     else {
  //     }
  //   });
  // }

}
