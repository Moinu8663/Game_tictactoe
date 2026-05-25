import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Singleuser } from './singleuser';

describe('Singleuser', () => {
  let component: Singleuser;
  let fixture: ComponentFixture<Singleuser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Singleuser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Singleuser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
