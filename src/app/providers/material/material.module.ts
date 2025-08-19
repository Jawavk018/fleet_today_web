import { NgModule } from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


const MaterialComponent = [
  MatMenuModule,
  MatButtonModule,
  MatToolbarModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatCardModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatCheckboxModule,
  MatDialogModule,
  MatListModule,
  MatChipsModule,
  MatSidenavModule,
  MatGridListModule,
  MatPaginatorModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatAutocompleteModule
];  

@NgModule({
  declarations: [],
  imports: [
    MaterialComponent,
  ],
  exports:[
    MaterialComponent
  ]
})
export class MaterialModule { }
