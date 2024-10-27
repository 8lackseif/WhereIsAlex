import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent {
  constructor(public layoutService: LayoutService, public router: Router) { }
}
