import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Pad } from './pad';

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
