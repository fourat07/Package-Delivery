import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptableComponent } from './comptable.component';

describe('ComptableComponent', () => {
  let component: ComptableComponent;
  let fixture: ComponentFixture<ComptableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComptableComponent]
    });
    fixture = TestBed.createComponent(ComptableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
