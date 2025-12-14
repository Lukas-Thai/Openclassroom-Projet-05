import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSession: Session = {
    id: 1,
    name: 'Test Session',
    description: 'Test Description',
    date: new Date(),
    teacher_id: 1,
    users: [1, 2],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('(integration) should return all sessions', () => {
      const mockSessions: Session[] = [mockSession];

      service.all().subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });
  });

  describe('detail', () => {
    it('(integration) should return a session by id', () => {
      service.detail('1').subscribe(session => {
        expect(session).toEqual(mockSession);
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('delete', () => {
    it('(integration) should delete a session', () => {
      service.delete('1').subscribe(response => {
        expect(response).toEqual({});
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('create', () => {
    it('(integration) should create a new session', () => {
      service.create(mockSession).subscribe(session => {
        expect(session).toEqual(mockSession);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSession);
      req.flush(mockSession);
    });
  });

  describe('update', () => {
    it('(integration) should update a session', () => {
      service.update('1', mockSession).subscribe(session => {
        expect(session).toEqual(mockSession);
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockSession);
      req.flush(mockSession);
    });
  });

  describe('participate', () => {
    it('(integration) should add user to session', () => {
      service.participate('1', '2').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/2');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('unParticipate', () => {
    it('(integration) should remove user from session', () => {
      service.unParticipate('1', '2').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/2');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
