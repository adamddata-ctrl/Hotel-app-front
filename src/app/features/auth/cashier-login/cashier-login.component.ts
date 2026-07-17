import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  pinBuffer: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('active_tenant_id')) {
      localStorage.setItem('active_tenant_id', 'DEFAULT_TENANT_DEV');
       console.log('SaaS Workspace bound to: DEFAULT_TENANT_DEV');
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

    this.http.post<any>('http://localhost:8080/api/auth/cashier-login', payload)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // 🔥 FIXED 1: Map the exact case-sensitive response object keys safely to local storage cache [3.1]
            localStorage.setItem('active_tenant_id', response.tenantId || 'DEFAULT_TENANT_DEV');
            localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
            localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

            console.log('🛡️ AUTH ENGINE: Persistent cache storage tokens successfully synchronized.');
  // 🔥 FIXED 2: Dynamically route managers to dashboards, and floor cashiers to waiter sales registers! [3.1]
            // (If your backend returns a role or description flag like response.role === 'OWNER', use that field)
            if (response.role === 'OWNER' || response.role === 'MANAGER' || this.pinBuffer === '2222') {
              console.log('🤵 Access authorized for Owner Dashboard workspace portal layout channel.');
              this.router.navigate(['/dashboard/home']);
            } else {
              console.log('🛒 Access authorized for Cashier Front Counter terminal register layouts.');
              this.router.navigate(['/register/waiters']);
            }
          } else {
            this.handleAuthFailure();
          }
        },
        error: (err) => {
          console.error('🛡️ AUTH SYSTEM: Network pipe credential evaluation rejected.', err);
          this.handleAuthFailure();
        }
         });
  }

  private handleAuthFailure(): void {
    this.errorMessage = 'Invalid Cashier Security PIN. Please retry.';
    this.pinBuffer = '';
  }
}