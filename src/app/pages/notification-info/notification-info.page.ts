import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { INotification } from 'src/app/interfaces/notification';

@Component({
	selector: 'app-notification-info',
	templateUrl: './notification-info.page.html',
	styleUrls: ['./notification-info.page.scss'],
})
export class NotificationInfoPage implements OnInit {

	not: INotification;

	constructor(
		private navParams: NavParams,
		private modalController: ModalController
	) { }

	ngOnInit() {
		this.not = <INotification>this.navParams.data;
	}

	dismiss() {
		// using the injected ModalController this page
		// can "dismiss" itself and optionally pass back data
		this.modalController.dismiss({
			'dismissed': true
		});
	}

	openUrl(url: string) {
		window.open(url, '_blank');
	}
}
