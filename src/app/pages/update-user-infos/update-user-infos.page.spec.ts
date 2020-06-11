import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserInfosPage } from './update-user-infos.page';

describe('UpdateUserInfosPage', () => {
	let component: UpdateUserInfosPage;
	let fixture: ComponentFixture<UpdateUserInfosPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UpdateUserInfosPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UpdateUserInfosPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
