import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PublicServerPage } from './public-server.page';

describe('PublicServerPage', () => {
  let component: PublicServerPage;
  let fixture: ComponentFixture<PublicServerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicServerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicServerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
