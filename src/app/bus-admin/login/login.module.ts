import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { NgOtpInputModule } from 'ng-otp-input';

export const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})

export class LoginModule { }