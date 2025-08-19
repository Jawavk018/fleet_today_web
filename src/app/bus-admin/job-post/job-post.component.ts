import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenStorageService } from '../login/token-storage.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogModule } from 'src/app/theme/components/confirm-dialog/confirm-dialog.module';
import { ConfirmDialogService } from 'src/app/theme/components/confirm-dialog/confirm-dialog.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';



@Component({
  selector: 'app-job-post',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    MatPaginatorModule,
    MatIconModule],
  templateUrl: './job-post.component.html',
  styleUrls: ['./job-post.component.scss']
})
export class JobPostComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: any = MatPaginator;

  user: any;
  isAdmin: boolean;
  jobList : any = [];
  searchKey: String = '';
  search = new Subject<any>();
  pageSize: number = 0;
  pageIndex: number = 0;
  itemPerPage: any = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  skip: number = 0;
  limit: number = 0;
  count: number = 0;
  isNoRecord: boolean = true;

  searchPost = new Subject<any>();

  constructor( private router: Router,
    private api: ApiService,
    private confirmDialogService: ConfirmDialogService,
    private toastrService: ToastrService,
    private tokenStorage: TokenStorageService) { 
    this.user = this.tokenStorage.getUser();
    this.limit = this.itemPerPage.toString().split(',')[0];
  }

  ngOnInit(): void {
    let index = this.user?.menus?.findIndex((menu) => menu?.routerLink == '/job-post');
    if (index != -1) {
      this.isAdmin = this.user?.menus[index].isAdmin;
    }
    this.getPostCount();
    this.getPost();

  
    // this.searchPost
    // .pipe(debounceTime(1000), distinctUntilChanged())
    // .subscribe((value: any) => {
    //   this.jobList = [];
    //   this.getPost();
    // });
  }


  getPost() {
    let param = { orgSno: this.user.orgSno, activeFlag: true, skip:this.skip, limit: this.limit}
    console.log(param)
    this.api.get('8055/api/get_job_post', param).subscribe(result => {
      if (result != null && result.data) {
        this.jobList = result.data;
        console.log(this.jobList)
      }
      else {
      }
    });
  }


  getPostCount() {
    let param = { orgSno: this.user.orgSno}
    this.isNoRecord = false;
    this.api.get("8055/api/get_job_post_count", param).subscribe(
      (result) => {
        console.log(result);
        // this.isShowLoad=false;
        if (result != null) {
          if (result.data != null && result.data.length > 0) {
            let dataValue = result.data[0].count;
            if (dataValue > 0) {
              this.count = dataValue;
            }
            this.getPost();
          }else{
            this.isNoRecord = true;
          }
        } else {
          // this.toastService.showError("Something went wrong");
        }
      },
      (err) => {
        // this.isShowLoad =false;
        // this.isNoRecord = true;
        // this.toastService.showError(err)
      }
    );
  }


  goToUpdatejob(i:any,isCopy?: string){
    let navigationExtras: any = {
      state: {
        job: this.jobList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/edit-post'], navigationExtras);
  }

  public deletePost(i: any) {
    let confirmText = "Are you sure to Delete ? ";
    this.confirmDialogService.confirmThis(confirmText, () => {
    let params: any = {};
    params.jobPostSno = this.jobList[i].jobPostSno;
    console.log(params)
    this.jobList.splice(i, 1);
    this.api.delete('8055/api/delete_job_post', params).subscribe(result => {
      if (result != null && result) {
      }
    })
    this.toastrService.success('Job Post delete Successfully');
  }, () => {
  });

  }

  gotoViewPost(i?: any, isCopy?: string) {
    let navigationExtras: any = {
      state: {
        job: this.jobList[i],
        isCopy: isCopy == 'copy' ? true : false
      }
    };
    this.router.navigate(['/view-post'], navigationExtras);
  }

  goToAddPost() {
    let navigationExtras: any = {
      state: {
        orgSno: this.user.orgSno,
      }
    };
    this.router.navigateByUrl('/addjob', navigationExtras);
  }

  getMorePost(event: any) {
    let isFirst: boolean = true;
    this.pageIndex = parseInt(event?.pageIndex);
    this.pageSize = parseInt(event?.pageSize);
    if (event.previousPageIndex > event.pageIndex) {
      this.skip = this.skip - event.pageSize;
      this.getPost();
    } else if (event.previousPageIndex < event.pageIndex) {
      this.skip = this.skip + event.pageSize;
      this.getPost();
    } else {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.skip = 0;
      this.jobList = [];
    }

    if (this.limit != event.pageSize) {
      this.paginator.pageIndex = 0;
      this.pageIndex = 0;
      this.jobList = [];
      this.skip = 0;

      this.limit = event.pageSize;
      isFirst = false;
      this.getPost();
    }
    // if (this.busReportList.length <= this.pageIndex && isFirst) {
    //   this.goToSearch();
    // }
  }

}
