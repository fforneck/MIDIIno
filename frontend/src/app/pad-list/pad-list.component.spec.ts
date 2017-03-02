import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PadListComponent } from './pad-list.component';

describe('PadListComponent', () => {
  let component: PadListComponent;
  let fixture: ComponentFixture<PadListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PadListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
