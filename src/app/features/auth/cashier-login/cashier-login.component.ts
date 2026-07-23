import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  pinBuffer: string = '';
  errorMessage: string = ''; 
   constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentWorkspace = localStorage.getItem('active_tenant_id');
    if (currentWorkspace) {
      console.log(`Active SaaS Workspace Session: ${currentWorkspace}`);
    } else {
      console.warn('No active workspace detected. Awaiting tenant authentication context...');
    }
  }
 handleNumberInput(num: string): void {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += num;
      this.errorMessage = '';
    }

    if (this.pinBuffer.length === 4) {
      this.executePinValidation();
    }
  }

  handleClear(): void {
    this.pinBuffer = '';
    this.errorMessage = '';
  }
   private executePinValidation(): void {
    const payload = { pin: this.pinBuffer };

    // FIX: Removed the /api path prefix to sync up with your Spring Boot AuthController endpoints
    this.http.post<any>(`${environment.apiUrl}/auth/cashier-login`, payload)
      .subscribe({
        next: (response) => {
          console.log('AUTH ENGINE: Persistent cache storage tokens successfully synchronized.');

          if (response && response.success && response.tenantId) {
            localStorage.setItem('active_tenant_id', response.tenantId);
            localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
            localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

            if (response.role === 'OWNER' || response.role === 'MANAGER') {
               console.log('Access authorized for Owner dashboard workspace portal layout channel.');
              this.router.navigate(['/owner-dashboard/summary-metrics']);
            } else {
              console.log('Access authorized for Cashier Front Counter terminal register layouts.');
              this.router.navigate(['/register/waiters']);
            }
          } else {
            console.error('CRITICAL: Server returned success status but omitted the multi-tenant identifier!');
            this.handleAuthFailure();
          }
        },
        error: (err) => {
          console.error('AUTH SYSTEM: Network pipe credential evaluation rejected.', err);
          this.handleAuthFailure();
        }
         });
  }

  private handleAuthFailure(): void {
    this.errorMessage = 'Invalid Cashier Security PIN. Please retry.';
    this.pinBuffer = '';
  }

  executeTestTenantSignup(): void {
  // Generates a random number so the database entry is always unique
  const randomId = Math.floor(Math.random() * 10000);

  const mockRegistrationData = {
    username: 'OwnerAdmin_' + randomId, // Becomes unique every click (e.g., OwnerAdmin_4821)
    pinCode: '4321',
    fullName: 'Pizza Paradise Admin'
  };

  console.log('Sending clean, dynamic matching registration payload to Render...');
  this.authService.registerNewTenant(mockRegistrationData).subscribe({
    next: (response) => { 
      alert('SUCCESS! Permanent Tenant Created: ' + response.tenantId);
      console.log('Server registration payload confirmed:', response);
    },
    error: (err) => {
      console.error('Registration pipeline failed:', err);
      alert('Error provisioning tenant: ' + err.message);
    }
  });
}
}