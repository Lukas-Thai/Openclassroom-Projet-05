import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { AuthService } from '../../services/auth.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [AuthService],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should invalidate form when email is missing', () => {
      component.form.setValue({
        email: '',
        firstName: 'Test',
        lastName: 'User',
        password: 'password'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('email')?.hasError('required')).toBe(true);
    });

    it('should invalidate form when email format is invalid', () => {
      component.form.setValue({
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        password: 'password'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('email')?.hasError('email')).toBe(true);
    });

    it('should invalidate form when firstName is missing', () => {
      component.form.setValue({
        email: 'test@test.com',
        firstName: '',
        lastName: 'User',
        password: 'password'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('firstName')?.hasError('required')).toBe(true);
    });

    it('should invalidate form when lastName is missing', () => {
      component.form.setValue({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: '',
        password: 'password'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('lastName')?.hasError('required')).toBe(true);
    });

    it('should invalidate form when password is missing', () => {
      component.form.setValue({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: ''
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('password')?.hasError('required')).toBe(true);
    });

    it('should validate form when all fields are valid', () => {
      component.form.setValue({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });

      expect(component.form.valid).toBe(true);
    });
  });
});

describe('RegisterComponent Integration Tests', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [AuthService],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('(integration) should register successfully', () => {
    const router = TestBed.inject(Router);

    component.form.setValue({
      email: 'newuser@test.com',
      firstName: 'New',
      lastName: 'User',
      password: 'test!1234'
    });

    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'newuser@test.com',
      firstName: 'New',
      lastName: 'User',
      password: 'test!1234'
    });
    req.flush(null);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('(integration) should handle registration error', () => {
    component.form.setValue({
      email: 'existing@test.com',
      firstName: 'Existing',
      lastName: 'User',
      password: 'password'
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });

    expect(component.onError).toBe(true);
  });
});
