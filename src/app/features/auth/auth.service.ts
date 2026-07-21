import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TenantRegistrationDto {
  username?: string;
  pinCode?: string;
  pincode?: string;
  fullName?: string;
  restaurantName?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Uses /auth directly to eliminate the breaking /api path nesting
  private baseAuthUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  registerNewTenant(registrationData: TenantRegistrationDto): Observable<any> {
    return this.http.post<any>(`${this.baseAuthUrl}/register-tenant`, registrationData).pipe(
      tap(response => { 
         // Look for the standard response property containing your new ID token
        if (response && response.tenantId) {
          localStorage.setItem('active_tenant_id', response.tenantId);
          console.log('Isolated production tenant workspace assigned:', response.tenantId);
        }
      })
    );
  }
}