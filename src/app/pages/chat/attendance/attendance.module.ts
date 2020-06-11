import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AttendancePage } from './attendance.page';
import { BrMaskerModule } from 'br-mask';

const routes: Routes = [
	{
		path: '',
		component: AttendancePage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		BrMaskerModule,
		RouterModule.forChild(routes)
	],
	declarations: [AttendancePage]
})
export class AttendancePageModule { }
