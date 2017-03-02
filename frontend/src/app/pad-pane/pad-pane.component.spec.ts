import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PadPaneComponent } from './pad-pane.component';

describe('PadPaneComponent', () => {
  let component: PadPaneComponent;
  let fixture: ComponentFixture<PadPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PadPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PadPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
