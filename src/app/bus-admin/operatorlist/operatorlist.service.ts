import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from 'src/environments/environment';
import { TOKEN_KEY } from 'src/util/constants';
import { OperatorList } from './operatorlist.model';

@Injectable()
export class OperatorListService {
    // public url = "api/vault";
    public portNo: any = 8083;
    constructor(public http: HttpClient) { }
    

    getRecords(type:string): Observable<any> {
        let endpoint:string = '';
        if(type == 'vault'){
            endpoint = '/api/get_vault';
        } else if(type == 'vault_category'){
            endpoint = '/api/get_vault_category';
        }
        return this.http.get(API_URL + this.portNo + endpoint,
            { headers: this.getRequestHeader(), responseType: 'json' });
    }

    addRecord(app: OperatorList) {
        console.log(JSON.stringify(app));
        console.log(window.sessionStorage.getItem(TOKEN_KEY));
        return this.http.post(API_URL + this.portNo + '/api/insert_vault', app, { headers: this.getRequestHeader() });
    }

    updateRecord(app: OperatorList) {
        console.log(JSON.stringify(app));
        console.log(window.sessionStorage.getItem(TOKEN_KEY));
        return this.http.put(API_URL + this.portNo + '/api/update_vault', app, { headers: this.getRequestHeader() });
    }

    deleteRecord(VaultSno: number) {
        return this.http.delete(API_URL + this.portNo + '/api/delete_vault' + "/" + VaultSno, { headers: this.getRequestHeader() }).subscribe();
    }

    getRequestHeader(): HttpHeaders {
        let token = (window.sessionStorage.getItem(TOKEN_KEY));
        const headers: HttpHeaders = new HttpHeaders()
            .append('Authorization', 'Bearer ' + token)
            .append('Accept', 'application/json');
        return headers;
    }
} 