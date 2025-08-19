import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordComponent } from 'src/app/bus-admin/change-password/change-password.component';
import { TokenStorageService } from 'src/app/bus-admin/login/token-storage.service';
import { ApiService } from 'src/app/providers/api/api.service';
import { MessagingService } from 'src/app/providers/fire/messaging.service';
declare var $: any;

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserMenuComponent implements OnInit {
  userInfo: any;
  @ViewChild('openpopup') openPopup: any;
  @ViewChild('exampleModal') exampleModal: any;

  @ViewChild('closepassdialog') closePassDialog: any;
  @ViewChild('closepassdialog1') closePassDialog1: any;


  @ViewChild('closepassdialog2') closePassDialog2: any;

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showPassword: boolean = false;
  passwordBox = false;
  passwordInput: any;

  isShowOTP: boolean = false;
  apiOtp: any;
  appUserSno: any;
  pushOtp: any;

  confirmPasswordInput: any;
  newPasswordInput: any;
  passwords: any;
  appUserList: any = [];

  user: any;
  simOtp: any;
  isDisabled: boolean = false;
  // config: any = {
  //   allowNumbersOnly: true,
  //   length: 6,
  //   isPasswordInput: false,
  //   disableAutoFocus: false,
  //   placeholder: '',
  //   inputStyles: {
  //     'width': '35px',
  //     'height': '35px',
  //     'background': 'rgba(0, 0, 0, 0)',
  //     'color': 'black'
  //   }
  // }

  passwordFrom: any = UntypedFormGroup
  mobileFrom: any = UntypedFormGroup



  constructor(private tokenStorageService: TokenStorageService, private router: Router, private messagingService: MessagingService,
    private tokenStorage: TokenStorageService, public api: ApiService, private toastrService: ToastrService) {
    this.passwordFrom = new UntypedFormGroup({
      appUserSno: new UntypedFormControl(),
      oldPassword: new UntypedFormControl(null, Validators.required),
      password: new UntypedFormControl(null, Validators.required),
      confirmPassword: new UntypedFormControl(null, Validators.required)
    })
    this.mobileFrom = new UntypedFormGroup({
      appUserSno: new UntypedFormControl(),
      newMobileNumber: new UntypedFormControl(null, Validators.required),
    })
  }

  ngOnInit() {
    this.userInfo = this.tokenStorageService.getUser();

  }

  openDialogue() {
    this.openPopup.nativeElement.click();
    this.getAppUser();
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

  onOtpChange(ev: any) {
    this.simOtp = ev;
    if (this.simOtp.length != 6) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
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
      appUserSno: this.userInfo.appUserSno,
      // oldPassword: this.user.password
    })
    let body: any = this.passwordFrom.value;
    if (this.appUserList[0]['Password'] == this.passwordInput) {
      this.api.put('8052/api/update_app_user', body).subscribe((result: any) => {
        if (result != null && result.data) {
          console.log(result)
          this.userInfo.isPassword = true;
          this.tokenStorage.saveUser(this.userInfo);
          this.passwordFrom.reset();
          this.closePassDialog.nativeElement.click();
          this.toastrService.success("Password Changed Successfully");
        } else {
        }
      });
    } else {
      this.toastrService.error("You Entered Wrong Old Password");
    }
  }

  goToOtp() {
    this.mobileFrom.patchValue({
      appUserSno: this.userInfo.appUserSno,
    })
    let body: any = this.mobileFrom.value;
    // body.deviceId = this.api?.networkData?.query;
    body.deviceId = '12345';
    body.pushToken = "12345";
    body.deviceTypeName = "web";
    body.timeZone = this.api.zone_name;
    console.log(body)
    this.api.get('8052/api/check_mobile_number', body).subscribe((result) => {
      console.log(result)
      this.isShowOTP = true;
      if (result != null && result.data) {
        if (result.data[0]?.isNewUser) {
          this.appUserSno = result.data[0]?.appUserSno;
          this.pushOtp = result.data[0]?.pushOtp;
          this.apiOtp = result.data[0]?.apiOtp;
          this.closePassDialog1.nativeElement.click();
          this.exampleModal.nativeElement.click();
        } else {
          this.toastrService.error(result.data[0]?.msg);
        }
      }
    });
  }


  verifyOTP() {
    let body = {
      appUserSno: this.appUserSno,
      pushOtp: this.pushOtp,
      apiOtp: this.apiOtp,
      // deviceId: this.api?.networkData?.query,
      deviceId:'12345',

      simOtp: this.simOtp,
      pushToken: this.messagingService.currentToken,
      timeZone: this.api.zone_name,
      deviceTypeName: 'Web',
      mobileNumber: this.mobileFrom?.value.newMobileNumber
    };

    this.isDisabled = true;
    this.api.post("8052/api/change_mobile_number", body).subscribe(result => {
      this.isDisabled = false;
      console.log(result)
      if (result != null && result.data) {

        this.toastrService.success('Mobile Number Change Successfully');
        this.closePassDialog2.nativeElement.click();
      } else {
        this.toastrService.error(result?.msg);

      }

    });
  }

  public getAppUser() {
    let param: any = { appUserSno: this.userInfo.appUserSno };
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
