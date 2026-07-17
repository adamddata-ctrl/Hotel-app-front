import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Added: Required to navigate users after clearing sessions

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hotel-pos-frontend';

  constructor(private router: Router) {} // Injected router controller service node

  
  executeShiftHandoverLogout(): void {
    console.log('🔄 SECURITY ENGINE: Initiating staff shift rotation flush sequence...');

    // 1. Target and erase individual cashier and waiter data blocks from browser storage instantly
    localStorage.removeItem('cashier_id');
    localStorage.removeItem('cashier_name');
    localStorage.removeItem('selected_waiter_id');
    localStorage.removeItem('selected_waiter_name');

    
    this.router.navigate(['/login']);
  }
}