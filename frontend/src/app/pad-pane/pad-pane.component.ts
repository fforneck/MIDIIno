import { Component, Input, Output } from '@angular/core';

import { Pad } from '../pad';
import { PadService } from '../pad.service';

@Component({
  selector: 'app-pad-pane',
  templateUrl: './pad-pane.component.html',
  styleUrls: ['./pad-pane.component.css']
})
export class PadPaneComponent {

  constructor(
    private padService: PadService
  ) { }
  
  @Input()
  pad: Pad;
  
  notes = [	
  	{number: 25, name: "Snare Roll"},
	{number: 26, name: "Finger Snap"},
	{number: 27, name: "High Q"},
	{number: 28, name: "Slap"},
	{number: 29, name: "Scratch Push"},
	{number: 30, name: "Scratch Pull"},
	{number: 31, name: "Sticks"},
	{number: 32, name: "Square Click"},
	{number: 33, name: "Metronome Click"},
	{number: 34, name: "Metronome Bell"},
	{number: 35, name: "Standard Kick 2"},
	{number: 36, name: "Standard Kick 1"},
	{number: 37, name: "Side Stick"},
	{number: 38, name: "Standard Snare 1"},
	{number: 39, name: "Hand Clap"},
	{number: 40, name: "Standard Snare 2"},
	{number: 41, name: "Low Tom 2"},
	{number: 42, name: "Closed Hi-hat"},
	{number: 43, name: "Low Tom 1"},
	{number: 44, name: "Pedal Hi-hat"},
	{number: 45, name: "Mid Tom 2"},
	{number: 46, name: "Open Hi-hat"},
	{number: 47, name: "Mid Tom 1"},
	{number: 48, name: "High Tom 2"},
	{number: 49, name: "Crash Symbal 1"},
	{number: 50, name: "High Tom 1"},
	{number: 51, name: "Ride Symbal 1"},
	{number: 52, name: "Chinese Cymbal"},
	{number: 53, name: "Ride Bell"},
	{number: 54, name: "Tambourine"},
	{number: 55, name: "Splash Cymbal"},
	{number: 56, name: "Cowbell"},
	{number: 57, name: "Crash Cymbal 2"},
	{number: 58, name: "Vibra-Snap"},
	{number: 59, name: "Ride Cymbal 2"},
	{number: 60, name: "High Bongo"},
	{number: 61, name: "Low Bongo"},
	{number: 62, name: "Mute High Conga"},
	{number: 63, name: "Open High Conga"}
  ];

  colorChange(value) {
    this.padService
	  .setPad(this.pad)
	  .then(pad => this.pad = pad);
  }

  onNotify(message:string):void {
    this.padService
	  .setPad(this.pad)
	  .then(pad => this.pad = pad);
  }

}
