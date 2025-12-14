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
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [SessionService, AuthService],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
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
        password: 'password'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('email')?.hasError('required')).toBe(true);
    });

    it('should invalidate form when password is missing', () => {
      component.form.setValue({
        email: 'test@test.com',
        password: ''
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('password')?.hasError('required')).toBe(true);
    });

    it('should validate form when all fields are valid', () => {
      component.form.setValue({
        email: 'test@test.com',
        password: 'password123'
      });

      expect(component.form.valid).toBe(true);
    });
  });
});

describe('LoginComponent Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [SessionService, AuthService],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('(integration) should login successfully', () => {
    const sessionService = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);

    const mockSessionInfo: SessionInformation = {
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'yoga@studio.com',
      firstName: 'Yoga',
      lastName: 'Studio',
      admin: true
    };

    component.form.setValue({
      email: 'yoga@studio.com',
      password: 'test!1234'
    });

    const sessionServiceSpy = jest.spyOn(sessionService, 'logIn');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'yoga@studio.com',
      password: 'test!1234'
    });
    req.flush(mockSessionInfo);

    expect(sessionServiceSpy).toHaveBeenCalledWith(mockSessionInfo);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('(integration) should handle login error', () => {
    component.form.setValue({
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(component.onError).toBe(true);
  });
});
