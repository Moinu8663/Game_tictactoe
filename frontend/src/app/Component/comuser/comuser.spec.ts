import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comuser } from './comuser';

describe('Comuser', () => {
  let component: Comuser;
  let fixture: ComponentFixture<Comuser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comuser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Comuser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
