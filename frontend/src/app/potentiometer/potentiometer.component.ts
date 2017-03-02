import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-potentiometer',
  templateUrl: './potentiometer.component.html',
  styleUrls: ['./potentiometer.component.css']
})
export class PotentiometerComponent {

  constructor() { }
  
  @Input()
  name: string;

  @Input()
  value: number;

  @Input()
  max: number;

  @Input()
  min: number;

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();

  change(value) {
    this.notify.emit('value changed');
  }

}
