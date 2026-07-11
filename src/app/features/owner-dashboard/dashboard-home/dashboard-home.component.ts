import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  ownerEmail: string = '';

  constructor(private router: Router) {}

  /**
   * Automatically extracts authorization parameters from secure local memory banks on mount
   */
  ngOnInit(): void { 
     this.ownerEmail = localStorage.getItem('owner_email') || 'Restaurant Owner Account';
  }

  /**
   * Securely logs out the manager, clears local storage sessions, and routes backward to the home login screen
   */
  executeLogoutWorkflow(): void {
    localStorage.clear(); // Wipes tenant IDs and user contextual tokens instantly
    this.router.navigate(['/login']);
  }
}