import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
//  import { VaultCategory } from './route'.model'; 
import { TOKEN_KEY } from 'src/util/constants';
import { RouteCategory } from './route.model';
// import { TOKEN_KEY } from 'src/app/theme/constants';

@Injectable()
export class RouteService {

  public portNo: any = 8084;

  constructor(public http: HttpClient) { }

  // getRecords(): Observable<any> {
  //   return this.http.get(API_URL + this.portNo + '/api/get_vault_category',
  //     { headers: this.getRequestHeader(), responseType: 'json' });
  // }

  // addRecord(app: RouteCategory) {
  //   console.log(window.sessionStorage.getItem(TOKEN_KEY));
  //   return this.http.post(API_URL + this.portNo + '/api/create_route', app, { headers: this.getRequestHeader() });
  // }

  // updateRecord(app: RouteCategory) {
  //   console.log(JSON.stringify(app));
  //   console.log(window.sessionStorage.getItem(TOKEN_KEY));
  //   return this.http.put(API_URL + this.portNo + '/api/update_route', app, { headers: this.getRequestHeader() });
  // }

  // deleteRecord(routeSno: number) {
  //   return this.http.delete(API_URL + this.portNo + '/api/delete_route' + "/" + routeSno, { headers: this.getRequestHeader() }).subscribe();
  // }

  getRequestHeader(): HttpHeaders {
    let token = (window.sessionStorage.getItem(TOKEN_KEY));
    const headers: HttpHeaders = new HttpHeaders()
      .append('Authorization', 'Bearer ' + token)
      .append('Accept', 'application/json');
    return headers;
  }

} 