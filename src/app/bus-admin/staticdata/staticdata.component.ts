import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staticdata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staticdata.component.html',
  styleUrls: ['./staticdata.component.scss']
})
export class StaticdataComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
