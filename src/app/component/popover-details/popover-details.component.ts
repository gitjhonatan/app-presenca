import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
	selector: 'app-credit-details',
	templateUrl: './popover-details.component.html',
	styleUrls: ['./popover-details.component.scss'],
})
export class PopoverDetailsComponent implements OnInit {

	text: any;

	constructor(
		private navParams: NavParams
	) { }

	ngOnInit() {
		this.text = this.navParams.data.text;
	}

}
