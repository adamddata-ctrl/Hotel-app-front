import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Standard lifecycle hook fires the fetch routine automatically when the screen mounts
   */
  ngOnInit(): void {
    this.fetchActiveWaiters();
  }

   /**
   * Pulls the active staff profiles from our Spring Boot endpoint.
   * Note: The TenantInterceptor automatically handles attaching the X-Tenant-ID header.
   */
  fetchActiveWaiters(): void {
    this.http.get<Waiter[]>(`${environment.apiUrl}/waiters/create`)
      .subscribe({
        next: (data) => {
          this.waitersList = data;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load restaurant waiters. Please refresh.';
        }
      });
  }

  /**
   * Saves the selection variables into the active browser memory context 
   * and steps forward directly into the register checkout terminal interface.
   */
  selectWaiter(waiter: Waiter): void {
    localStorage.setItem('selected_waiter_id', waiter.id.toString());
    localStorage.setItem('selected_waiter_name', waiter.waiterName);
    this.router.navigate(['/register/terminal']);
  }

  /**
   * Triggers the quick-add shortcut modal overlay
   */
  toggleAddModal(): void {
    this.showModal = !this.showModal;
    this.newWaiterName = '';
  }

  /**
   * Quick-inserts a new waiter profile into your MySQL database 
   * in 3 seconds flat without leaving the screen workflow loop.
   */
  submitNewWaiter(): void {
    if (!this.newWaiterName.trim()) return;

    const payload = { waiterName: this.newWaiterName };
    this.http.post(`${environment.apiUrl}/waiters/create`, payload)
      .subscribe({
        next: () => {
          this.toggleAddModal();
          this.fetchActiveWaiters(); // Refresh grid layout metrics automatically
        },
        error: (err) => {
          this.errorMessage = 'Could not create waiter profile. Retry.';
        }

         });
  }
}