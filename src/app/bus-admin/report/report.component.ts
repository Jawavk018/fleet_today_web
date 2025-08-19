import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuService } from '../../theme/components/menu/menu.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})

export class ReportComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  
  goToBusReport() {
    this.router.navigate(['/bus-report'])
  }
  goToFuelReport() {
    this.router.navigate(['/fuel-report'])
  }
  goToDriverReport() {
    this.router.navigate(['/driver-report'])
  }

}
