import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Pad } from './pad';

// for testing without the backend
export const PADS: Pad[] = [
  {id: 0, note:39, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "blue"},
  {id: 1, note:43, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "red"},
  {id: 2, note:51, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "yellow"},
  {id: 3, note:42, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "green"},
  {id: 4, note:49, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "light blue"},
  {id: 5, note:36, threshold:50, gain:50, relevantSamples:15, irrelevantNoise:100, color: "black"}
]

@Injectable()
export class PadService {
	
  private headers = new Headers({'Content-Type': 'application/json'});
  private url = "http://localhost:3000";

  constructor(private http: Http) { }
  
  getPads(): Promise<Pad[]> {
    return this.http.get(`${this.url}/pads`)
               .toPromise()
               .then(response => response.json() as Pad[])
               .catch(this.handleError);
    // for testing without the backend
    //return Promise.resolve(PADS);
  }
  
  setPad(pad: Pad): Promise<Pad> {
    const url = `${this.url}/pad/${pad.id}`;
    return this.http
      .put(url, JSON.stringify(pad), {headers: this.headers})
      .toPromise()
      .then(() => pad)
      .catch(this.handleError);
	  
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
