import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/providers/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PhotoService } from 'src/app/providers/photoservice/photoservice.service';
import { TokenStorageService } from '../../login/token-storage.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import axios from 'axios';
import { stringify } from 'querystring';
declare var $: any;

@Component({
  selector: 'app-addoperator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './addoperator.component.html',
  styleUrls: ['./addoperator.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AddoperatorComponent implements OnInit {

  public form: UntypedFormGroup;
  public organizationStatusList: any = [];
  public socialList = [];
  project: any;
  projectList: any = [];
  isCopy: boolean;
  removeUserList: any = [];
  @ViewChild('myInput') myInputVariable: ElementRef | any;
  appUser: any;
  organization: any;
  contactLists: any = [];
  searchPincode = new Subject<any>();
  operator: any;
  roleCd: any;
  orgSno: any;
  cityList: any = [];
  isAdmin: boolean;
  constructor(
    public fb: UntypedFormBuilder,
    private api: ApiService,
    private router: Router,
    public toastrService: ToastrService,
    public location: Location,
    public photoService: PhotoService,
    private tokenStorageService: TokenStorageService) {

  }

  ngOnInit() {
    this.appUser = this.tokenStorageService.getUser();
    let index = this.appUser?.menus?.findIndex((menu) => menu?.routerLink == '/operator');
    if (index != -1) {
      this.isAdmin = this.appUser?.menus[index].isAdmin;
    }

    console.log('isAdmin', this.isAdmin)
    let param: any = window.history.state;
    this.operator = param.operator;
    this.roleCd = param.roleCd;
    this.searchPincode.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      console.log(this.form.value.address?.pincode?.toString()?.length == 6)
      if (this.form.value.address?.pincode?.toString()?.length == 6) {
        this.getLocation();
      }
    });

    var invalidChars = ["-", "e", "+", "E"];

    $("input[type='number']").on("keydown", function (e) {
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
    });
    this.getContactRole();
    this.form = this.fb.group({
      orgSno: null,
      orgName: [null, Validators.compose([Validators.required])],
      orgStatusCd: [null],
      // mobileNumber: [null],
      ownerDetails: this.fb.group({
        ownerName: [null, Validators.compose([Validators.required])],
        vehicleNumber: [null, Validators.compose([Validators.required])],
      }),
      orgDetails: this.fb.group({
        detailSno: null,
        website: [null],
        coverImage: [null],
        logo: [null],
      }),
      contactList: new UntypedFormArray([]),
      accountList: new UntypedFormArray([]),

      // contactList: new FormArray([]),

      social: new UntypedFormArray([]),
      address: this.fb.group({
        addressSno: null,
        addressLine1: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])],
        addressLine2: [null, Validators.compose([Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])],
        pincode: [null, Validators.compose([Validators.required])],
        city: [null, Validators.compose([Validators.required])],
        state: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])],
        district: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])],
        countryCode: [+91],
        country: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9 ./,-]*$")])],
        latitude: [null],
        longitude: [null]
      }),
      rejectReason: [null]
    });

    console.log(this.appUser.roleCd)
    if (this.appUser?.roleCd == 1) {
      this.form.addControl('mobileNumber', this.fb.control('', [Validators.required]));
    }

    this.getOrganization((data: any) => {
      this.organization = data;
      if (this.organization && this.organization.orgSno) {
        if (this.isCopy) {
          this.organization.orgSno = null;
        }
        console.log(this.organization)
        for (let i in this.organization.contactList) {
          this.updateContactList(this.organization.contactList[i])
        }
        if (this.organization?.accountList != null) {
          for (let i in this.organization?.accountList) {
            this.updateAccountList(this.organization?.accountList[i])
          }
        } else {
          this.createAccountList();
        }
        for (let i in this.organization.social) {
          this.updateSocial(this.organization.social[i])
        }
        if (this.appUser?.roleCd == 2 || this.appUser?.roleCd == 127 || this.appUser?.roleCd == 128) {
          delete this.organization.mobileNumber;
        }
        console.log(this.organization)
        // this.organization.accountList=[{'accountDetailSno':null,'bankAccountName':'','orgSno':null}];

        // alert(JSON.stringify(this.form.value?.orgSno))
        // this.form.setValue(this.organization);
        // alert(JSON.stringify(this.form.value?.orgSno))


      } else {
        this.getSocialEnums();
        this.createContactList();
      }
    });

  }

  verifyNumber(obj: any, i: number) {
    let body: any = {};
    body.mobileNumber = obj.value.mobileNumber;
    console.log(body)
    this.api.get('8052/api/check_role_mobile_number', body).subscribe((result) => {
      console.log(result)
      if (result != null && result.data) {
        if (result.data[0].msg) {
          this.toastrService.error(result?.data[0]?.msg);
          const formGroup = this.contactList.at(i) as FormGroup;
          formGroup.get('mobileNumber').setValue('');
        }
      }
    });
  }

  removeAccount(i: any) {
    this.accountList.removeAt(i);
  }

  getOrganization(callback: any) {
    if (this.appUser.roleCd != 5) {
      if (this.orgSno = this.operator?.orgSno) {
        let params = { orgSno: this.operator?.orgSno };
        this.api.get('8053/api/get_org', params).subscribe(result => {
          if (result != null && result.data) {
            console.log(JSON.stringify(result))
            callback(result.data[0]);
          } else {
            callback(null);
          }
        })
      } else if (this.roleCd == 1) {
        callback(null)
      }
      else {
        let params = { orgSno: this.appUser?.orgSno };
        this.api.get('8053/api/get_org', params).subscribe(result => {
          if (result != null && result.data) {
            callback(result.data[0]);
          } else {
            callback(null);
          }
        })
      }
    } else {
      callback(null);
    }

  }
  ngAfterViewInit() {
    console.log(this.organization)

    setTimeout(() => {
      this.form.setValue(this.organization);
      console.log("muthukumar")
    }, 1000);
  }

  get contactList() {
    return this.form.controls["contactList"] as UntypedFormArray;
  }

  get accountList() {
    return this.form.controls["accountList"] as UntypedFormArray;
  }

  createContactList() {
    let contact = this.fb.group({
      orgContactSno: [null],
      contactSno: [null],
      name: [null, Validators.compose([Validators.required])],
      contactRoleCd: [null, Validators.compose([Validators.required])],
      mobileNumber: [null, Validators.compose([Validators.required])],
      email: [null, Validators.pattern("^([a-zA-Z0-9.])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})|(^[0-9]{10})+$")],
      isShow: [null]
    });
    this.contactList?.push(contact);
  }

  createAccountList() {
    let arr: any = [];
    let account = this.fb.group({
      accountDetailSno: [null],
      orgSno: [null],
      bankAccountName: [null]
    });

    this.accountList?.push(account);
    if (this.organization != null && this.organization.accountList == null) {
      arr.push(account.value);
      this.organization.accountList = arr;
    }
    console.log(this.accountList)
    console.log(this.form)
  }

  updateContactList(contact: any) {
    const contactForm = this.fb.group(contact);
    this.contactList.push(contactForm);
  }

  updateAccountList(account: any) {
    const accountForm = this.fb.group(account);
    this.accountList.push(accountForm);
  }

  get social() {
    return this.form.controls["social"] as UntypedFormArray;
  }

  createSocial(data) {
    let social: any = {};
    social.orgSocialLinkSno = null;
    social.socialLinkSno = null;
    social.socialTypeCd = data.codesDtlSno;
    social.urlLink = '';
    social.socialTypeName = data.cdValue;

    const socialForm = this.fb.group(social);
    this.social.push(socialForm);
  }

  updateSocial(social) {
    const socialForm = this.fb.group(social);
    this.social.push(socialForm)
  }

  public getSocialEnums(): void {
    let param: any = { codeType: 'social_type_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        this.socialList = result.data;
        for (let i in this.socialList) {
          this.createSocial(this.socialList[i])
        }
      } else {

      }
    });
  }

  save() {
    if (this.form.value.accountList != null) {
      let accList = [];
      for (let i in this.form.value.accountList) {
        if (this.form.value.accountList[i].bankAccountName != null) {
          accList.push(this.form.value.accountList[i])
        }
      }
      this.form.value.accountList = Object.assign([], accList);
    }
    let body: any = this.form.value;
    body.media = [];
    body.media.push(body.orgDetails.logo);
    body.media.push(body.orgDetails.coverImage);
    if (this.appUser.roleCdValue != 'Admin') {
      body.appUserSno = this.appUser.appUserSno;
      body.orgStatusCd = 20;
    } else {
      body.orgStatusCd = 19;
    }
    delete body.orgDetails.logo;
    delete body.orgDetails.coverImage;
    console.log(body);
    this.api.post('8053/api/create_org', body).subscribe(result => {
      if (result != null && result.data) {
        this.toastrService.success('Organization Added Successfully');
        if (this.appUser.roleCdValue != 'Admin') {
          this.appUser.menus = result?.data?.menus
          this.appUser.orgSno = result.data.orgSno;
          this.appUser.orgStatusCd = 20;
          this.appUser.roleCd = 2;
          this.tokenStorageService.saveUser(this.appUser);
        }
        window.location.reload();
        this.form.reset();
      } else {

      }
    });
  }

  update() {
    if (this.form.value.accountList != null) {
      let accList = [];
      for (let i in this.form.value.accountList) {
        if (this.form.value.accountList[i].bankAccountName != null) {
          accList.push(this.form.value.accountList[i])
        }
      }
      this.form.value.accountList = Object.assign([], accList);
    }
    let body: any = this.form.value;
    body.media = [];
    body.media.push(body.orgDetails.logo);
    body.media.push(body.orgDetails.coverImage);
    body.appUserSno = this.appUser.appUserSno;
    delete body.orgDetails.logo;
    delete body.orgDetails.coverImage;
    console.log(body)
    this.api.put('8053/api/update_org', body).subscribe((result: any) => {
      if (result != null && result.data) {
        if (result?.data?.msg != null) {
          this.toastrService.error(result?.data?.msg);
        } else {
        this.toastrService.success('Organization Updated Successfully');
        this.appUser.orgSno = result.data.orgSno;
        this.tokenStorageService.saveUser(this.appUser);
        this.form.reset();
        this.location.back();
      }}
    });
  }
  updateAppUserRole() {
    let body: any = { appUserSno: this.appUser.appUserSno, roleCd: 2 };
    this.api.put('8052/api/update_app_user_role', body).subscribe(result => {
      console.log(result)
      if (result != null && result) {
      }
    });
  }

  addMedia(type: any) {
    if (type == 'logo') {
      let element: HTMLElement = document.querySelector('input[name="fileUploader"]') as HTMLElement;
      element.click();
    } else {
      let element: HTMLElement = document.querySelector('input[name="fileBannerUploader"]') as HTMLElement;
      element.click();
    }

  }

  onFileChange(e: any, type: any) {
    this.photoService.onFileChange(e, ['png', 'jpeg', 'jpg', 'webp'], (result: any) => {
      if (result != null && result != undefined && result.length > 0) {
        result[0].keyName = type
        if (type == 'logo') {
          this.form.patchValue({
            orgDetails: {
              logo: result[0]
            }
          })
        } else if (type == 'coverImage') {
          this.form.patchValue({
            orgDetails: {
              coverImage: result[0]
            }
          })
        }
      }
      this.myInputVariable.nativeElement.value = "";
    });
  }
  public getContactRole() {
    this.contactLists = [];
    let param: any = { codeType: 'role_cd' };
    this.api.get('8052/api/get_enum_names', param).subscribe(result => {
      if (result != null && result.data) {
        // this.contactLists = result.data;
        for (let i = 0; i < result?.data?.length; i++) {
          if (result?.data[i]?.filter1) {
            this.contactLists.push(result?.data[i]);
          }
        }
      } else {

      }
    });
  }
  getLocation() {
    axios.get('https://api.postalpincode.in/pincode/' + this.form.value.address.pincode, {}).then((response: any) => {
      console.log(response)
      if (response?.data?.length) {
        if (response?.data[0]?.PostOffice?.length) {
          this.cityList = response?.data[0]?.PostOffice;
          let address = response?.data[0]?.PostOffice[0];
          console.log(address)
          this.form.patchValue({
            address: {
              // city: address.Block,
              state: address.State,
              district: address.District,
              country: address.Country
            }
          });
        }
      }

    });

  }

}
