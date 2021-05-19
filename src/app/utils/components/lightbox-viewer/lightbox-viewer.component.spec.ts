import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightboxViewerComponent } from './lightbox-viewer.component';

describe('LightboxViewerComponent', () => {
  let component: LightboxViewerComponent;
  let fixture: ComponentFixture<LightboxViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LightboxViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightboxViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
