import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, throwError } from 'rxjs';
import { catchError } from "rxjs/operators";
import * as moment from 'moment-timezone';


@Injectable({
  providedIn: 'root'
})
 
export class ApiService {  

  url: any = '';
  
  port: any = '8000/api/tnbus_';     
  isLive: boolean = false;
  
  public zone_name = moment.tz.guess();
  public networkData: any;
  constructor(public httpClient: HttpClient,private datePipe:DatePipe) {

    if(this.isLive){
      this.url = "https://www.fleettoday.in:"; 
      // this.url="https://13.126.41.105:"
      // this.url="http://20.198.104.253:"
    } else{
      this.url = "http://localhost:";
    }

    
    // this.getIp((result: any) => {
    //   this.networkData = result;
    // })
  }

  get(endpoint: string, params?: any, reqOpts?: any): Observable<any> {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    if (this.isLive) {
      endpoint = this.split_at_index(endpoint, 9)
    }

    return this.httpClient.get(this.url + endpoint, reqOpts).pipe(
      // retry(1), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
  }

  post(endpoint: string, body: any, reqOpts?: any): Observable<any> {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    reqOpts.params = new HttpParams();

    if (this.isLive) {
      endpoint = this.split_at_index(endpoint, 9)
    }

    return this.httpClient
      .post(this.url + endpoint, JSON.stringify(body), reqOpts)
      .pipe(
        // retry(1), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
    // .map((res: Response) =>res.json())
    // .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

  }

  put(endpoint: string, body: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    reqOpts.params = new HttpParams();

    if (this.isLive) {
      endpoint = this.split_at_index(endpoint, 9)
    }

    return this.httpClient.put(this.url + endpoint, body, reqOpts).pipe(
      // retry(1), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
  }

  delete(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    // reqOpts.params = reqOpts.params.set("jwt", localStorage.getItem("jwttoken"));

    if (this.isLive) {
      endpoint = this.split_at_index(endpoint, 9)
    }

    return this.httpClient.delete(this.url + endpoint, reqOpts)
      .pipe(
        catchError((err) => this.handleError(err))
      )
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    if (this.isLive) {
      endpoint = this.split_at_index(endpoint, 4)
    }
    return this.httpClient.patch(this.url + '/' + endpoint, body, reqOpts);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.log("Server was down");
    }
    // return an observable with a user-facing error message
    return throwError("Something bad happened; please try again later.");
  }

  dateToSavingStringFormatConvertion(currentDate: Date) {
    let datewithouttimezone: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
    return this.datePipe.transform(datewithouttimezone, 'yyyy-MM-dd HH:mm:ss');
  }

  isEmptyString(str: any) {
    return str?.trim()?.length > 0;
  }

  // scrapWeb(url: any, params?: any, callback?: any) {
  //   let param: any = {
  //     'api_key': 'YI1W5FOMD4UH1QBXBF9BCI6H1W2HSCS909TE17O4XC7T549WRVYNQCTP31D2GQWZY6CEPRJYYDOC5XJB',
  //     'url': url
  //   }
  //   param.extract_rules = params;
  //   axios.get('https://app.scrapingbee.com/api/v1', {
  //     params: param
  //   }).then((response: any) => {
  //     if (response?.data) {
  //       callback(response?.data);
  //     } else {
  //       alert('please try again...')
  //     }
  //   });
  // }

  getIp(callback: any) {
    axios.get('http://ip-api.com/json/', {
    }).then((response: any) => {
      if (response?.data) {
        callback(response?.data);
      } else {
        alert('please try again...')
      }
    });
  }

  split_at_index(value: any, index: number) {
    return (this.port + value.substring(index));
  }


}