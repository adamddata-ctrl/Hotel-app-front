import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from './../../../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  // Direct variable strings driving your touch keypad layout indicator circles [3.1]
  public pinBuffer: string = '';
  public errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    // Structural multi-tenant diagnostic session tracking verification check
    const currentWorkspace = localStorage.getItem('X-Tenant-ID') || localStorage.getItem('active_tenant_id');
    if (currentWorkspace) {
      console.log(`Active SaaS Workspace Session Context Identified: ${currentWorkspace}`);
    } else {
      console.warn('No active workspace detected. Awaiting tenant authentication context...');
    }
  }

  /**
   * Captures button taps from your on-screen touch keypad grid [3.1]
   */
  public handleNumberInput(num: string): void {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += num;
      this.errorMessage = '';
    }
    // Automatically trigger validation the millisecond the 4th digit registers on screen
    if (this.pinBuffer.length === 4) {
      this.executePinValidation();
    }
  }

  /**
   * Clears out all input circles instantly from the terminal view screen (Clear Key) [3.1]
   */
  public handleClear(): void {
    this.pinBuffer = '';
    this.errorMessage = '';
  }

  /**
   * Dispatches the 4-digit token across network filters safely via a standard REST call
   */
  private executePinValidation(): void {
    const payload = { pin: this.pinBuffer };

    console.log('AUTH ENGINE: Dispatching terminal validation PIN sequence over network filters...');
    this.http.post<any>(`${environment.apiUrl}/auth/cashier-login`, payload)
      .subscribe({
        next: (response) => {
          console.log('AUTH ENGINE: Persistent cache storage tokens successfully synchronized.');

          if (response && response.success && response.tenantId) {
            // CRITICAL SYNC FIX: Write session parameters cleanly to BOTH key variants simultaneously!
            // This guarantees that your interceptor captures a valid token regardless of browser caching layers.
            localStorage.setItem('X-Tenant-ID', response.tenantId);
            localStorage.setItem('active_tenant_id', response.tenantId);
            localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
            localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

            // FIX: Normalize role text parsing to UPPERCASE to eliminate string layout evaluation breaks
            const userRole = response.role ? response.role.toUpperCase() : 'CASHIER';

            if (userRole === 'OWNER' || userRole === 'MANAGER') {
              console.log('Access authorized for Owner dashboard workspace portal layout channel.');
              this.router.navigate(['owner-dashboard/summary-metrics']);
            } else {
              console.log('Access authorized for Cashier Front Counter terminal register layouts.');
              // FIX: Stripped leading slash from path array to enforce pristine root module router matching
              this.router.navigate(['register/waiters']);
            }
          } else {
            console.error('CRITICAL: Server returned success status but omitted the multi-tenant identifier!');
            this.handleAuthFailure();
          }
        },
        error: (err) => {
          console.error('AUTH SYSTEM: Network pipe credential evaluation rejected by database boundary.', err);
          this.handleAuthFailure();
        }
      });
  }

  /**
   * Wipes input buffers and presents clear high-visibility messaging to screen operators [3.1]
   */
  private handleAuthFailure(): void {
    this.errorMessage = 'Invalid Cashier Security PIN. Please retry.';
    this.pinBuffer = '';
  }
}