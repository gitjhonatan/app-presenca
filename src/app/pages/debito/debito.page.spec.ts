import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DebitoPage } from './debito.page';

describe('DebitoPage', () => {
  let component: DebitoPage;
  let fixture: ComponentFixture<DebitoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebitoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DebitoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
