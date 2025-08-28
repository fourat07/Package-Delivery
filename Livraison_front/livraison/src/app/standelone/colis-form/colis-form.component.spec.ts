import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisFormComponent } from './colis-form.component';

describe('ColisFormComponent', () => {
  let component: ColisFormComponent;
  let fixture: ComponentFixture<ColisFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ColisFormComponent]
    });
    fixture = TestBed.createComponent(ColisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
