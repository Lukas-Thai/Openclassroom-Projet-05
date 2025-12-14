import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule, } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DetailComponent } from './detail.component';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService,
        TeacherService
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call window.history.back', () => {
    const backSpy = jest.spyOn(window.history, 'back');

    component.back();

    expect(backSpy).toHaveBeenCalled();
  });
});

describe('DetailComponent Integration Tests', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService,
        TeacherService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('(integration) should load session and teacher', fakeAsync(() => {
    const mockSession: Session = {
      id: 1,
      name: 'Yoga Session',
      description: 'Relaxing yoga',
      date: new Date('2024-01-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockTeacher: Teacher = {
      id: 1,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.detectChanges();

    const reqSession = httpMock.expectOne('api/session/1');
    expect(reqSession.request.method).toBe('GET');
    reqSession.flush(mockSession);

    tick();

    const reqTeacher = httpMock.expectOne('api/teacher/1');
    expect(reqTeacher.request.method).toBe('GET');
    reqTeacher.flush(mockTeacher);

    tick();

    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(true);
  }));

  it('(integration) should delete session', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const matSnackBar = TestBed.inject(MatSnackBar);

    const mockSession: Session = {
      id: 1,
      name: 'Yoga Session',
      description: 'Relaxing yoga',
      date: new Date('2024-01-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockTeacher: Teacher = {
      id: 1,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.detectChanges();

    const reqSession = httpMock.expectOne('api/session/1');
    reqSession.flush(mockSession);
    tick();

    const reqTeacher = httpMock.expectOne('api/teacher/1');
    reqTeacher.flush(mockTeacher);
    tick();

    const snackBarSpy = jest.spyOn(matSnackBar, 'open');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.delete();

    const reqDelete = httpMock.expectOne('api/session/1');
    expect(reqDelete.request.method).toBe('DELETE');
    reqDelete.flush(null);

    tick();
    flush();

    expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  }));

  it('(integration) should participate in session', fakeAsync(() => {
    const mockSession: Session = {
      id: 1,
      name: 'Yoga Session',
      description: 'Relaxing yoga',
      date: new Date('2024-01-01'),
      teacher_id: 1,
      users: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockTeacher: Teacher = {
      id: 1,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.detectChanges();

    const reqSession1 = httpMock.expectOne('api/session/1');
    reqSession1.flush(mockSession);
    tick();

    const reqTeacher1 = httpMock.expectOne('api/teacher/1');
    reqTeacher1.flush(mockTeacher);
    tick();

    expect(component.isParticipate).toBe(false);

    component.participate();

    const reqParticipate = httpMock.expectOne('api/session/1/participate/1');
    expect(reqParticipate.request.method).toBe('POST');
    reqParticipate.flush(null);

    tick();

    const mockSessionWithUser: Session = {
      ...mockSession,
      users: [1]
    };

    const reqSession2 = httpMock.expectOne('api/session/1');
    reqSession2.flush(mockSessionWithUser);
    tick();

    const reqTeacher2 = httpMock.expectOne('api/teacher/1');
    reqTeacher2.flush(mockTeacher);
    tick();

    expect(component.isParticipate).toBe(true);
  }));

  it('(integration) should unparticipate from session', fakeAsync(() => {
    const mockSession: Session = {
      id: 1,
      name: 'Yoga Session',
      description: 'Relaxing yoga',
      date: new Date('2024-01-01'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockTeacher: Teacher = {
      id: 1,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    fixture.detectChanges();

    const reqSession1 = httpMock.expectOne('api/session/1');
    reqSession1.flush(mockSession);
    tick();

    const reqTeacher1 = httpMock.expectOne('api/teacher/1');
    reqTeacher1.flush(mockTeacher);
    tick();

    expect(component.isParticipate).toBe(true);

    component.unParticipate();

    const reqUnParticipate = httpMock.expectOne('api/session/1/participate/1');
    expect(reqUnParticipate.request.method).toBe('DELETE');
    reqUnParticipate.flush(null);

    tick();

    const mockSessionWithoutUser: Session = {
      ...mockSession,
      users: [2, 3]
    };

    const reqSession2 = httpMock.expectOne('api/session/1');
    reqSession2.flush(mockSessionWithoutUser);
    tick();

    const reqTeacher2 = httpMock.expectOne('api/teacher/1');
    reqTeacher2.flush(mockTeacher);
    tick();

    expect(component.isParticipate).toBe(false);
  }));
});

