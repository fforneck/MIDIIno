import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from "@angular/flex-layout";

import 'hammerjs';

import { AppComponent } from './app.component';
import { PotentiometerComponent } from './potentiometer/potentiometer.component';
import { PadPaneComponent } from './pad-pane/pad-pane.component';
import { PadListComponent } from './pad-list/pad-list.component';

import { PadService } from './pad.service';

@NgModule({
  declarations: [
    AppComponent,	
    PadListComponent,
    PadPaneComponent,
    PotentiometerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    FlexLayoutModule.forRoot()
  ],
  providers: [ PadService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
