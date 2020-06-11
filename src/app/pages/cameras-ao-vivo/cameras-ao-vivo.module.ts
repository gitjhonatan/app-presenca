import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CamerasAoVivoPage } from './cameras-ao-vivo.page';

const routes: Routes = [
  {
    path: '',
    component: CamerasAoVivoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CamerasAoVivoPage]
})
export class CamerasAoVivoPageModule {}
