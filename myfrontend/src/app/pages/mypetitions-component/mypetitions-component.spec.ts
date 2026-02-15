import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypetitionsComponent } from './mypetitions-component';

describe('MypetitionsComponent', () => {
  let component: MypetitionsComponent;
  let fixture: ComponentFixture<MypetitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MypetitionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypetitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
