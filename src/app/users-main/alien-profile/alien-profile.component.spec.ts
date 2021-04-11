import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlienProfileComponent } from './alien-profile.component';

describe('AlienProfileComponent', () => {
  let component: AlienProfileComponent;
  let fixture: ComponentFixture<AlienProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlienProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlienProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
