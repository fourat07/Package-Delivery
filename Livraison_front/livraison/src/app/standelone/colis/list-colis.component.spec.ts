import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListColisComponent } from './list-colis.component';

describe('ListColisComponent', () => {
  let component: ListColisComponent;
  let fixture: ComponentFixture<ListColisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListColisComponent]
    });
    fixture = TestBed.createComponent(ListColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
