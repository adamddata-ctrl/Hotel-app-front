import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSignupComponent } from './tenant-signup.component';

describe('TenantSignupComponent', () => {
  let component: TenantSignupComponent;
  let fixture: ComponentFixture<TenantSignupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TenantSignupComponent]
    });
    fixture = TestBed.createComponent(TenantSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
