import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operator-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operator-attendance.component.html',
  styleUrls: ['./operator-attendance.component.scss']
})
export class OperatorAttendanceComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  addDriverAttendance() {
    this.router.navigate(['/addOperatorAttendance'])
  }

}
