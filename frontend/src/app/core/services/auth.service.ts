import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  name?: string;
  password?: string;
  lastName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  
  // Storage signals
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      try {
        this.currentUser.set(JSON.parse(userJson));
      } catch (e) {
        localStorage.removeItem('user');
      }
    } else if (token) {
      const decodedUser = this.decodeToken(token);
      if (decodedUser) {
        this.currentUser.set(decodedUser);
      }
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      
      return {
        id: decoded.id || decoded.sub || decoded._id,
        username: decoded.username || decoded.name || decoded.email,
        email: decoded.email,
        firstName: decoded.firstName || decoded.username || decoded.name
      };
    } catch (e) {
      return null;
    }
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  verifyEmail(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, data);
  }

  login(credentials: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {

        const token = res.token || res.data?.token || res.accessToken;
        if (token) {
          localStorage.setItem('token', token);
        }

        // 2. Extract User - Flexible Detection
        let user: User | null = null; // Changed type to User | null

        if (res.user) {
          user = res.user; // Priority to explicit user object
        } else if (res.data?.user) {
          user = res.data.user;
        } else if (res.data && (res.data.email || res.data.username)) {
          user = res.data;
        } else if (res.email || res.username || res.id || res._id) {
          user = res; // Response itself is the user
        }

        // Fallback to token if user is still null
        if (!user && token) {
          user = this.decodeToken(token);
        }

        if (user) {
          // Add role if present in res but not in user object
          if (!user.role && res.role) user.role = res.role;
          if (!user.role && res.data?.role) user.role = res.data.role;

          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
          console.log('👤 Auth: Final recognized User with Role:', user);
        } else {
          console.error('❌ Auth: Login success but NO user data found');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    console.log('🚪 Auth: User logged out');
  }
}
