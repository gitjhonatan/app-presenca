import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
	selector: 'app-inform-cpf',
	templateUrl: './inform-cpf.component.html',
	styleUrls: ['./inform-cpf.component.scss'],
})
export class InformCPFComponent implements OnInit {

	constructor(
		private navParams: NavParams,
		private controller: PopoverController
	) { }

	option: string;

	ngOnInit() {
		this.option = this.navParams.data.option;
	}

	close(option) {
		this.controller.dismiss(option);
	}

}
