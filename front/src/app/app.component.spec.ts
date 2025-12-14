import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatToolbarModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initially be logged off', (done) => {
    component.$isLogged().subscribe((isLogged: boolean) => {
      expect(isLogged).toBe(false);
      done();
    });
  });

  describe('logout', () => {
    it('should call sessionService.logOut', () => {
      const logOutSpy = jest.spyOn(sessionService, 'logOut');
      component.logout();
      expect(logOutSpy).toHaveBeenCalled();
    });

    it('should navigate to home page', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.logout();
      expect(navigateSpy).toHaveBeenCalledWith(['']);
    });

    it('should set isLogged to false in sessionService', () => {
      //on connecte l'utilisateur d'abord
      sessionService.isLogged = true;
      component.logout();
      expect(sessionService.isLogged).toBe(false);
    });
  });
});