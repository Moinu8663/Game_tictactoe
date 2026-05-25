import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Multiuser } from './multiuser';

describe('Multiuser', () => {
  let component: Multiuser;
  let fixture: ComponentFixture<Multiuser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Multiuser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Multiuser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
