import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TenantRegistrationDto {
  username: string;
  pinCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService { 
     private baseAuthUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  registerNewTenant(registrationData: TenantRegistrationDto): Observable<any> {
    return this.http.post<any>(`${this.baseAuthUrl}/register-tenant`, registrationData).pipe(
      tap(response => {
        if (response && response.success && response.tenantId) {
          // Immediately secure the generated tenant session key inside your browser
          localStorage.setItem('active_tenant_id', response.tenantId);
          console.log('Isolated production tenant workspace assigned:', response.tenantId);
        }
      })
    );
  }
}