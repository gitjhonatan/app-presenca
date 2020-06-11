import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebitoPageRoutingModule } from './debito-routing.module';

import { DebitoPage } from './debito.page';
import { BrMaskerModule } from 'br-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebitoPageRoutingModule,
    BrMaskerModule
  ],
  declarations: [DebitoPage]
})
export class DebitoPageModule {}
