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

  this.http.post<any>('http://localhost:8080/api/auth/cashier-login', payload)
    .subscribe({
      next: (response) => {
        // 1. Core Safeguard: Only proceed if authentication succeeded and a valid tenant workspace ID exists
        if (response && response.success && response.tenantId) {
          
          // 2. Synchronize application session cache states
          localStorage.setItem('active_tenant_id', response.tenantId);
          localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
          localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

          console.log('AUTH ENGINE: Persistent cache storage tokens successfully synchronized.');

          // 3. Secure Role Routing: Evaluate backend permission roles directly to avoid pin bypass hacks
          if (response.role === 'OWNER' || response.role === 'MANAGER') { 
             console.log('Access authorized for Owner Dashboard workspace portal layout channel.');
          this.router.navigate(['/owner-dashboard/summary-metrics']);
          } else {
            console.log('Access authorized for Cashier Front Counter terminal register layouts.');
            this.router.navigate(['/register/waiters']);
          }

        } else {
          // Fallback if success flag is returned but tenant parameters are missing or corrupted
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
}