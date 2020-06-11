import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { BrMaskerModule } from 'br-mask';

import { IonicModule } from '@ionic/angular';

import { UpdateUserInfosPage } from './update-user-infos.page';

const routes: Routes = [
	{
		path: '',
		component: UpdateUserInfosPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		BrMaskerModule
	],
	declarations: [UpdateUserInfosPage]
})
export class UpdateUserInfosPageModule { }
