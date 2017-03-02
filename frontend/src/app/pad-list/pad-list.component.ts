import { Component, OnInit } from '@angular/core';

import { Pad } from '../pad';
import { PadService } from '../pad.service';

@Component({
  selector: 'app-pad-list',
  templateUrl: './pad-list.component.html',
  styleUrls: ['./pad-list.component.css']
})
export class PadListComponent implements OnInit {

  constructor(
    private padService: PadService
  ) { }
  
  pads: Pad[];
  
  getPads(): void {
    this.padService
        .getPads()
        .then(pads => this.pads = pads);
  }

  ngOnInit() {
    this.getPads();
  }

}
