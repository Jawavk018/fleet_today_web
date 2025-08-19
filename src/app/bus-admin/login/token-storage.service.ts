import { Injectable } from '@angular/core';
import { TOKEN_KEY, USER_KEY } from 'src/util/constants';
 
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  public getUserMenus(): any {
    let user:any = JSON.parse(window.sessionStorage.getItem(USER_KEY));
    if (user) {
      return user.menus;
    }
    return {};
  }

  public removeStorage(){
    window.sessionStorage.clear();
  }
}
