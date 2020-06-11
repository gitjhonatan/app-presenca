import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, IonSlides } from '@ionic/angular';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-onboarding',
  templateUrl: 'onboarding.html',
  styleUrls: ['./onboarding.scss'],
})
export class OnboardingPage {
  showSkip = true;

  @ViewChild('slides', { static: true }) slides: IonSlides;

  constructor(
    public menu: MenuController,
    public router: Router,
    public storage: Storage
  ) { }

  startApp() {
    this.router
      .navigateByUrl('/home')
      .then(() => this.storage.set('ion_did_onboarding', true));
  }

  onSlideChangeStart(event) {
    event.target.isEnd().then(isEnd => {
      this.showSkip = !isEnd;
    });
  }

  ionViewWillEnter() {
    this.storage.get('ion_did_onboarding').then(res => {
      if (res === true) {
        this.router.navigateByUrl('/home');
      }
    });

    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the onboarding page
    this.menu.enable(true);
  }

  nextPage() {
    this.slides.slideNext();
  }
}
