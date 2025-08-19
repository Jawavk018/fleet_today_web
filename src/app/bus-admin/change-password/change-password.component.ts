import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/providers/api/api.service';
import { MessagingService } from 'src/app/providers/fire/messaging.service';
import { TokenStorageService } from '../login/token-storage.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public router: Router;
  public form: UntypedFormGroup;

  appUserSno: any;
  // oldPassword: any;
  showNewPassword:boolean = false;
  showConfirmPassword:boolean = false;
  showPassword:boolean=false;
  passwordBox = false;
  passwordInput: any;
  confirmPasswordInput: any;
  newPasswordInput: any;
  passwords: any;
  user: any;
  appUserList:any=[]; 
  passwordFrom: any = UntypedFormGroup
  

  constructor(router: Router, fb: UntypedFormBuilder,  private toastrService: ToastrService,
    private tokenStorage: TokenStorageService, private userIdle: UserIdleService, private api: ApiService, private messagingService: MessagingService,private tokenStorageService: TokenStorageService) 
    {
      

      this.router = router;
    
    this.passwordFrom = new UntypedFormGroup({
      appUserSno: new UntypedFormControl(),
      oldPassword: new UntypedFormControl(null, Validators.required),
      password: new UntypedFormControl(null, Validators.required),
      confirmPassword: new UntypedFormControl(null, Validators.required)
    })
   }

   public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
 public toggleNewPasswordVisibility(): void {
  this.showNewPassword = !this.showNewPassword;
}

public toggleConfirmPasswordVisibility(): void {
  this.showConfirmPassword = !this.showConfirmPassword;
}

  ngOnInit(): void {
    this.user = this.tokenStorageService.getUser();
    console.log('================')
    console.log('USER=====',this.user)
    this.getAppUser();
  }

  onChangeEvent(event: any) {
    console.log(event.target.value);
    this.passwordInput = event.target.value;
  }

  newPasswordChange(event: any) {
    console.log(event.target.value);
    this.newPasswordInput = event.target.value
  }

  confirmPasswordChange(event: any) {
    console.log(event.target.value);
    this.confirmPasswordInput = event.target.value
  }

  goToSave() {
    this.passwordFrom.patchValue({
      appUserSno: this.user.appUserSno,
      // oldPassword: this.user.password
    })
    let body: any = this.passwordFrom.value;
    if(this.appUserList[0]['Password'] == this.passwordInput){
      this.api.put('8052/api/update_app_user', body).subscribe((result: any) => {
        if (result != null && result.data) {
          console.log(result)
          this.user.isPassword = true;
          this.tokenStorage.saveUser(this.user);
          this.passwordFrom.reset();
          this.router.navigate(['/dashboard']);
          this.toastrService.success("Password Changed Successfully");
        } else {
        }
      });
    } else{
      this.toastrService.error("You Entered Wrong Old Password");
    }
    
    
  }

  public getAppUser() {
    let param: any = { appUserSno: this.user.appUserSno };
    this.api.get('8052/api/get_app_user', param).subscribe(result => {
      if (result != null && result.data) {
        this.appUserList = result.data;
        console.log(this.appUserList)
        console.log(this.appUserList[0]['Password'])
      } else {

      }
    });
  }



}
