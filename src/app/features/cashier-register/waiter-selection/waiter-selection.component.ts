import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router'; // 🚀 Added ActivatedRoute here
import { environment } from '../../../../environments/environment';

interface Waiter {
  id: number;
  waiterName: string;
  active: boolean;
}

@Component({
  selector: 'app-waiter-selection',
  templateUrl: './waiter-selection.component.html',
  styleUrls: ['./waiter-selection.component.css']
})
export class WaiterSelectionComponent implements OnInit {
  waitersList: Waiter[] = [];
  errorMessage: string = '';
  showModal: boolean = false;
  newWaiterName: string = '';

  // 🚀 Updated constructor to inject ActivatedRoute cleanly
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🚀 STEP 1: Capture the live workspace parameter token directly from the active browser URL path
    const urlTenantId = this.route.snapshot.paramMap.get('tenantId');

    if (urlTenantId && urlTenantId.trim() !== '' && urlTenantId !== 'DEFAULT_TENANT_DEV') {
      // Synchronize browser storage instantly to keep outbound interceptor headers solid
      localStorage.setItem('X-Tenant-ID', urlTenantId);
      this.fetchActiveWaiters();
    } else {
      console.error('❌ WAITER SELECTION: Missing tenant identifier inside the route pathway.');
      this.errorMessage = 'Invalid or missing restaurant workspace identifier. Please log in again.';
    }
  }

  fetchActiveWaiters(): void {
    const tenantId = localStorage.getItem('X-Tenant-ID');

    if (!tenantId) {
      this.errorMessage = 'Tenant security context missing. Please log in again.';
      return;
    }

    // Fire the network query safely with zero timing delays or loops
    this.http.get<Waiter[]>(`${environment.apiUrl}/waiters/active`)
      .subscribe({
        next: (data) => {
          this.waitersList = data;
          this.errorMessage = ''; // Clear past errors
        },
        error: (err) => {
          console.error('FAILED TO FETCH RESTAURANT WAITERS:', err);
          this.errorMessage = 'Failed to load restaurant waiters. Please refresh the browser session.';
        }
      });
  }

  selectWaiter(waiter: Waiter): void {
    localStorage.setItem('selected_waiter_id', waiter.id.toString());
    localStorage.setItem('selected_waiter_name', waiter.waiterName);
    this.router.navigate(['/register/terminal']);
  }

  toggleAddModal(): void {
    this.showModal = !this.showModal;
    this.newWaiterName = '';
  }

  submitNewWaiter(): void {
    if (!this.newWaiterName || !this.newWaiterName.trim()) return;

    const tenantId = localStorage.getItem('X-Tenant-ID');
    if (!tenantId) {
      this.errorMessage = 'Session context expired. Please log out and enter your PIN again.';
      return;
    }

    const payload = { waiterName: this.newWaiterName.trim() };
    
    this.http.post<Waiter>(`${environment.apiUrl}/waiters`, payload)
      .subscribe({
        next: (newWaiter) => {
          this.waitersList.push(newWaiter);
          this.toggleAddModal();
        },
        error: (err) => {
          console.error('FAILED TO CREATE WAITER ENTRY:', err);
          this.errorMessage = 'Failed to register the new waiter. Try again.';
        }
      });
  }
}