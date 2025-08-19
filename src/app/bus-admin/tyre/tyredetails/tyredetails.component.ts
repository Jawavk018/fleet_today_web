import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../../login/token-storage.service';

@Component({
  selector: 'app-tyredetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tyredetails.component.html',
  styleUrls: ['./tyredetails.component.scss']
})
export class TyredetailsComponent implements OnInit {

  appUser: any;
  tyre: any;

  constructor(
    private api: ApiService, 
    public toastrService: ToastrService,
    private tokenStorageService: TokenStorageService,
  ) { 
    let param: any = window.history.state;
    console.log(param);
    this.tyre = param.tyre;
    this.appUser = this.tokenStorageService.getUser();
  }

  ngOnInit(): void {
    console.log(this.tyre);

  }

}
