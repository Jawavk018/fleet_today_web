import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-list-group',
  templateUrl: './list-group.component.html',
  styleUrls: ['./list-group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListGroupComponent implements OnInit {

  lat: number = 45.421530;
  lng: number = -75.697193;
  zoom: number = 7;
  constructor() { }

  ngOnInit() {
  }

}
