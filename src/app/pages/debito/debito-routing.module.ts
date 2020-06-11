import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebitoPage } from './debito.page';

const routes: Routes = [
  {
    path: '',
    component: DebitoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebitoPageRoutingModule {}
