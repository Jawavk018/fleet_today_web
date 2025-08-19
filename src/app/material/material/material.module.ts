import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCardModule} from '@angular/material/card';


const moduleList: any = [
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatButtonModule,
  MatDialogModule,
  MatListModule,
  MatMenuModule,
  CommonModule,
  MatAutocompleteModule,
  MatChipsModule,
  MatTabsModule,
  MatProgressBarModule,
  MatSelectModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatCardModule
]

@NgModule({
  declarations: [],
  imports: [
    moduleList,
  ], exports: [
    moduleList
  ]
})
export class MaterialModule { }
