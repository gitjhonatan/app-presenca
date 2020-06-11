import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicServerPage } from './public-server.page';

const routes: Routes = [
  {
    path: '',
    component: PublicServerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicServerPageRoutingModule {}
