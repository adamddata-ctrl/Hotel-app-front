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
   * Automatically executes the server data retrieval sequence when the UI page mounts.
   */
  ngOnInit(): void {
    this.fetchActiveWaiters();
  }
  fetchActiveWaiters(): void {
  const tenantId = localStorage.getItem('X-Tenant-ID');

  // If the tenant token is missing, do not send a broken request
  if (!tenantId) {
    console.warn('🕒 WaiterSelectionComponent: Tenant ID not ready yet. Retrying in 150ms...');
    setTimeout(() => this.fetchActiveWaiters(), 150);
    return;
  }

  // Execute the request safely once the token is confirmed
  this.http.get<Waiter[]>(`${environment.apiUrl}/waiters/active`)
    .subscribe({
      next: (data) => {
        this.waitersList = data;
      },
      error: (err) => {
        console.error('FAILED TO FETCH RESTAURANT WAITERS:', err);
        this.errorMessage = 'Failed to load restaurant waiters. Please refresh the browser session.';
      }
    });
}

  /**
    * Tracks the chosen worker assignment metrics inside active browser cache memory
   * and routes the workspace terminal view directly into the floor check order paths.
   */
  selectWaiter(waiter: Waiter): void {
    localStorage.setItem('selected_waiter_id', waiter.id.toString());
    localStorage.setItem('selected_waiter_name', waiter.waiterName);
    this.router.navigate(['/register/terminal']);
  }

  /**
   * Toggles the quick-insert shortcut pop-up interface overlay view state.
   */
  toggleAddModal(): void {
    this.showModal = !this.showModal;
    this.newWaiterName = '';
    }

  /**
   * Executes a direct outbound REST network stream to create a new worker row
   * inside our production cloud MySQL database cluster.
   */
  submitNewWaiter(): void {
  if (!this.newWaiterName || !this.newWaiterName.trim()) return;

  const tenantId = localStorage.getItem('X-Tenant-ID');
  if (!tenantId) {
    this.errorMessage = 'Session context expired. Please log out and enter your PIN again.';
    return;
  }

  const payload = { waiterName: this.newWaiterName.trim() };
  // ... rest of your http.post code remains exactly the same!
}
}