import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, FormControl, AbstractControl, UntypedFormBuilder, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { EmailValidators } from 'ngx-validators'
import { TokenStorageService } from './token-storage.service';
import { UserIdleService } from 'angular-user-idle';
import { ToastrService } from 'ngx-toastr';
import { MessagingService } from 'src/app/providers/fire/messaging.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from 'src/app/providers/api/api.service';
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  public router: Router;
  public form: UntypedFormGroup;
  public email: AbstractControl;
  public password: AbstractControl;
  public mobileNumber: AbstractControl;

  @ViewChild('carousel', { static: true }) carousel: ElementRef;

  isShowOTP: boolean = false;
  apiOtp: any;
  appUserSno: any;
  pushOtp: any;
  passwords: any;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  isOrg: boolean = false;

  roles: string[] = [];
  menus: any[] = [];
  userStoredName: string = "";
  isLoginPassword: boolean = true;
  isForgotPassword: boolean = false;
  isPasswordBox: boolean = false;
  passwordFrom: any = FormGroup;
  passwordInput: any;
  confirmPasswordInput: any;
  mobileNumberInput: any;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showPassword: boolean = false;
  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  user: any;
  simOtp: any;
  isDisabled: boolean = false;
  config: any = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '35px',
      'height': '35px',
      'background': 'rgba(0, 0, 0, 0)',
      'color': 'black'
    }

  };



  constructor(
    router: Router,
    public fb: FormBuilder,
    private toastrService: ToastrService,
    private tokenStorage: TokenStorageService,
    private userIdle: UserIdleService,
    private messagingService: MessagingService,

    // public azureConnectionService: azureService,
    public httpClient: HttpClient,
    private api: ApiService
  ) {
    this.router = router;
    this.form = fb.group({
      'mobileNumber': ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
      'password': [''],

    });

    this.passwordFrom = new UntypedFormGroup({
      appUserSno: new FormControl(),
      password: new FormControl(null, Validators.required),
      confirmPassword: new FormControl(null, Validators.required)
    })

    this.mobileNumber = this.form.controls['mobileNumber'];
  }

  ngOnInit() {
  }
  public toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToSave() {
    this.passwordFrom.patchValue({
      appUserSno: this.appUserSno
    })
    let body: any = this.passwordFrom.value;
    this.api.put('8052/api/update_app_user', body).subscribe((result: any) => {
      if (result != null && result.data) {
        if (this.isForgotPassword) {
          this.toastrService.success("Password Change Successfully");
          window.location.reload();
        } else {
          this.user.isPassword = true;
          this.tokenStorage.saveUser(this.user);
          this.form.reset();
          this.router.navigate(['/bus-dashboard'], { replaceUrl: true });
          this.toastrService.success("Registered Successfully");
        }

      }
    });
  }

  ngAfterViewInit() {
    document.getElementById('preloader').classList.add('hide');
  }

  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    this.userIdle.resetTimer();
  }
  goToShowPassword() {
    this.isLoginPassword = !this.isLoginPassword
  }

  mobileNumberChange(event: any) {
    this.mobileNumberInput = event.target.value;
    if (this.mobileNumberInput.length == 10) {
      let body = { mobileNumber: this.mobileNumberInput };
      this.api.get('8052/api/get_verify_mobile_number', body).subscribe((result) => {
        console.log(result)
        if (result != null && result?.data && result?.data[0]?.data) {
          this.toastrService.error(result.data[0].msg);
          this.isOrg = true;
        } else {
          this.isOrg = false;
          if (result != null && result.data) {
            if (result.data[0].password) {
              // this.isShowOTP=true
              this.isPasswordBox = true;
              this.form.get('password').setValidators(Validators.required);
              this.form.get('password').updateValueAndValidity();
            } else {
              this.form.get('password').removeValidators(Validators.required);
              this.form.get('password').updateValueAndValidity();
              this.isShowOTP = false;
              this.isPasswordBox = false;
            }
          }
        }
      });
    } else {
      this.form.get('password').removeValidators(Validators.required);
      this.form.get('password').updateValueAndValidity();
      this.isShowOTP = false;
      this.isPasswordBox = false;
    }
  }


  forgotPassword(event: any) {
    let body = {
      mobileNumber: this.form.value.mobileNumber,
      // appUserSno: this.appUserSno,
      pushOtp: this.pushOtp,
      apiOtp: this.apiOtp,
      // deviceId: this.api?.networkData?.query,
      deviceId: '12345',

      timeZone: this.api.zone_name,
      simOtp: this.simOtp,
      pageName: 'Forgot Password'
    };
    this.api.get('8052/api/get_verify_mobile_number', body).subscribe((result) => {
      this.isShowOTP = true;

      if (result != null && result.data) {
        if (!result.data[0].isMobileNumber) {
          this.toastrService.error("Invalid Mobilenumber please register");
        } else {
          $(".carousel").carousel(2);
          this.appUserSno = result.data[0].appUserSno;
          this.pushOtp = result.data[0].otp.pushOtp;
          this.apiOtp = result.data[0].otp.apiOtp;

        }
      }
    });
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
  confirmPasswordChange(event: any) {
    this.confirmPasswordInput = event.target.value
  }
  goToPrivacy() {
    this.router.navigate(['/privacy-policy'])
  }
  goToTerms() {
    this.router.navigate(['/terms'])
  }

  verifyOTP() {
    $(".carousel").carousel(2);
    let body = {
      appUserSno: this.appUserSno,
      pushOtp: this.pushOtp,
      apiOtp: this.apiOtp,
      // deviceId: this.api?.networkData?.query,
      deviceId: '12345',

      simOtp: this.simOtp,
      pushToken: this.messagingService.currentToken,
      timeZone: this.api.zone_name,
      deviceTypeName: 'Web',
      // createdOn: this.api.networkData.timezone,
      createdOn : 'Asia/Kolkata',
    };
    this.isDisabled = true;
    this.api.post("8052/api/verify_otp", body).subscribe(result => {
      this.isDisabled = false;
      console.log(result)
      if (!result.isVerifiedUser) {
        // this.common.openSnackBar(result.data.msg);
        this.toastrService.error(result.msg);
      } else {
        if (this.isForgotPassword) {
          $(".carousel").carousel(3);
        } else {
          result.mobileNumber = this.form.value.mobileNumber;
          this.tokenStorage.saveToken(result.accessToken);
          this.tokenStorage.saveUser(result);
          this.user = this.tokenStorage.getUser();
          $(".carousel").carousel(2);

        }
        // this.passwords = 'password';
        // this.isShowOTP = false;

        //  this.router.navigate(['/']);
        //   this.toastrService.success("Registered Successfully");
      }
    });
  }
  connectAzure() {
    // this.azureConnectionService.connectAzure((token) => {
    //   // console.log(token)
    //   const headers: HttpHeaders = new HttpHeaders()
    //     .append('Authorization', token.accessToken)
    //     .append('Accept', 'application/json');
    //   let reqOpts: any = {
    //     headers: headers
    //   };
    //   this.httpClient.get('https://graph.microsoft.com/v1.0/me', reqOpts).subscribe((res: any) => {
    //     // console.log(res)
    //     localStorage.clear();
    //     sessionStorage.clear();
    //     if (res) {
    //       this.login(res);
    //     }
    //   })
    // })
  }

  login() {

    let body = this.form.value;
    body.pushToken = this.messagingService.currentToken,
      body.timeZone = this.api.zone_name,
      body.deviceTypeName = 'Web',
      // body.deviceId = this.api?.networkData?.query
      body.deviceId = '12345'

    this.api.post('8052/api/login', body).subscribe((result) => {
      if (result != null) {
        result.isPassword = true;
        result.mobileNumber = body.mobileNumber;
        this.tokenStorage.saveToken(result.accessToken);
        this.tokenStorage.saveUser(result);
        if (result.msg == "Login Success") {
          this.router.navigate(['/bus-dashboard'], { replaceUrl: true });
          this.toastrService.success("Login Successfully");
          $(".carousel").carousel(1);
          // window.location.reload();
        } else {
          this.router.navigate(['/login'], { replaceUrl: true })
          this.toastrService.error("Invalid Password");
        }

      } else {

      }
    });
  }


  public onSubmit(values: Object): void {
    $(".carousel").carousel(1);
    if (this.form.valid) {
      let body: any = this.form.value;
      // body.deviceId = this.api?.networkData?.query;
      body.deviceId = '12345';

      body.pushToken = "12345";
      body.deviceTypeName = "web";
      body.timeZone = this.api.zone_name;
      this.api.post("8052/api/signin", body).subscribe((data) => {
        if (data.isLogin) {
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.pushOtp = data.pushOtp;
          this.apiOtp = data.apiOtp;
          this.appUserSno = data.appUserSno;
          if (!this.isPasswordBox) {
            this.isShowOTP = true;

          } else {
            // this.router.navigate(['/']);
            // this.toastrService.success("Login Successfully");
          }

          //Start watching for user inactivity.
          this.userIdle.startWatching();

          // Start watching when user idle is starting.
          this.userIdle.onTimerStart().subscribe(count => console.log(count));

          // Start watch when time is up.
          this.userIdle.onTimeout().subscribe(() => {
            console.log('Time is up!');
            this.stopWatching();
            this.stop();
            this.tokenStorage.signOut();
            this.router.navigate(['/login'], { replaceUrl: true });
            this.isLoginFailed = true;
            this.errorMessage = "User Session is Timed Out- Kindly Re-login...";
          });
        } else {
          this.isLoginFailed = true;
          this.toastrService.error(data.msg);
        }
      },
        err => {
          this.errorMessage = err.error.message;
          this.isLoginFailed = true;
          this.toastrService.error(err.error.message);
        }
      );
    }
  }


}
