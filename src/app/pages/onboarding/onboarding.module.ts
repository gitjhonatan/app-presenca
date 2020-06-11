import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { OnboardingPage } from './onboarding';
import { OnboardingPageRoutingModule } from './onboarding-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    OnboardingPageRoutingModule
  ],
  declarations: [OnboardingPage],
  entryComponents: [OnboardingPage],
})
export class OnboardingModule { }
