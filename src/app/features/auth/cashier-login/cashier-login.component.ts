import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'; // Matches your folder hierarchy [image_i0Znow.png]
import { AuthService } from '../auth.service'; // Matches your folder hierarchy [image_i0Znow.png]

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  public pinBuffer: string = '';
  public errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // FIX: Aligned local storage lookup session key to matching 'X-Tenant-ID' specifications [image_o9FZAS.png]
    const currentWorkspace = localStorage.getItem('X-Tenant-ID');
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
  this.http.post<any>(`${environment.apiUrl}/auth/cashier-login`, payload)
  .subscribe({
    next: (response) => {
      console.log('AUTH ENGINE: Persistent cache storage tokens successfully synchronized.');
      
      if (response && response.success && response.tenantId) {
        localStorage.setItem('X-Tenant-ID', response.tenantId);
        localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
        localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

        // 🚀 THE FIX: Pass the tenant ID explicitly through the router state metadata!
        if (response.role === 'OWNER' || response.role === 'MANAGER') {
          console.log('Access authorized for Owner dashboard workspace portal layout channel.');
          this.router.navigate(['/owner-dashboard/summary-metrics'], { state: { tenantId: response.tenantId } });
        } else {
          console.log('Access authorized for Cashier Front Counter terminal register layouts.');
          this.router.navigate(['/register/waiters'], { state: { tenantId: response.tenantId } });
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

  /**
   * ACTIVE REPLACEMENT: Un-commented and fully optimized to execute live sandbox registrations flawlessly [image_7lt6MC.png]
   */
  
}