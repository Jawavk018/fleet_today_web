import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor() {

   }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    document.getElementById('preloader').classList.add('hide');
  }
}
