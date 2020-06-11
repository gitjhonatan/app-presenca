import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrMaskerModule } from 'br-mask';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { PublicServerPageRoutingModule } from './public-server-routing.module';

import { PublicServerPage } from './public-server.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicServerPageRoutingModule,
    BrMaskerModule,
    HttpClientModule,
  ],
  declarations: [PublicServerPage]
})
export class PublicServerPageModule { }
