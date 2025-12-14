import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';

import { FormComponent } from './form.component';
import { Session } from '../../interfaces/session.interface';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockSessionService = {
    sessionInformation: {
      admin: true
    }
  } 

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService
      ],
      declarations: [FormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the form', () => {
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.get('name')).toBeDefined();
      expect(component.sessionForm?.get('date')).toBeDefined();
      expect(component.sessionForm?.get('teacher_id')).toBeDefined();
      expect(component.sessionForm?.get('description')).toBeDefined();
    });
  });

});

describe('FormComponent - Non Admin User', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockNonAdminSessionService = {
    sessionInformation: {
      admin: false
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockNonAdminSessionService },
        SessionApiService
      ],
      declarations: [FormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
  });

  it('should redirect non-admin users to /sessions', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });
});

describe('FormComponent Integration Tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let httpMock: HttpTestingController;

  const mockSessionService = {
    sessionInformation: {
      admin: true
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService,
        TeacherService
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('(integration) should create a session', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const matSnackBar = TestBed.inject(MatSnackBar);

    // Mock teachers list
    const reqTeachers = httpMock.expectOne('api/teacher');
    reqTeachers.flush([]);
    tick();

    component.sessionForm?.setValue({
      name: 'New Yoga Session',
      date: '2024-06-01',
      teacher_id: 1,
      description: 'A relaxing yoga session'
    });

    const mockCreatedSession: Session = {
      id: 1,
      name: 'New Yoga Session',
      date: new Date('2024-06-01'),
      teacher_id: 1,
      description: 'A relaxing yoga session',
      users: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const snackBarSpy = jest.spyOn(matSnackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.submit();

    const reqCreate = httpMock.expectOne('api/session');
    expect(reqCreate.request.method).toBe('POST');
    reqCreate.flush(mockCreatedSession);

    tick();
    flush();

    expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  }));

  it('(integration) should update a session', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const matSnackBar = TestBed.inject(MatSnackBar);
    const activatedRoute = TestBed.inject(ActivatedRoute);

    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/1');
    jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');

    // Reinitialize component for update mode
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

    const mockSession: Session = {
      id: 1,
      name: 'Existing Session',
      date: new Date('2024-01-01'),
      teacher_id: 1,
      description: 'Old description',
      users: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.detectChanges();

    const reqTeachers = httpMock.expectOne('api/teacher');
    reqTeachers.flush([]);

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush(mockSession);
    tick();

    component.sessionForm?.patchValue({
      name: 'Updated Session',
      description: 'Updated description'
    });

    const mockUpdatedSession: Session = {
      ...mockSession,
      name: 'Updated Session',
      description: 'Updated description'
    };

    const snackBarSpy = jest.spyOn(matSnackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.submit();

    const reqUpdate = httpMock.expectOne('api/session/1');
    expect(reqUpdate.request.method).toBe('PUT');
    reqUpdate.flush(mockUpdatedSession);

    tick();
    flush();

    expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  }));
});
