//MODULES
import { Component, OnInit, } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { NotificationsService } from 'src/app/services/notifications.service';

// INTERFACES
import { INotification } from '../../interfaces/notification'

// PAGES
import { NotificationInfoPage } from '../notification-info/notification-info.page';
import { ManageUser } from 'src/app/services/manage-user.service';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.page.html',
	styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

	notList: INotification[] = [];

	constructor(
		public modalController: ModalController,
		private notifications: NotificationsService,
		private route: ActivatedRoute,
		private router: Router,
		private user: ManageUser
	) { }

	ngOnInit() {
		const pushId = this.route.snapshot.paramMap.get('pushId');
		window.history.pushState('notification', 'APP Presença', '/');
		if (pushId) {
			this.user.get().then(user => {
				this.notifications.getAirtableHistory(user).then(notifications => {
					this.notList = notifications;
					if (notifications.length > 0)
						notifications.forEach(notification => {
							if (notification.id === pushId)
								this.showNotInfos(notification);
						});
				})
			})
		}
		else
			this.notifications.getStorageHistory().then(notifications => {
				this.notList = notifications;
			});
	}

	dismiss() {
		this.modalController.dismiss({
			'dismissed': true
		}).catch(() => {
			this.router.navigate(['home']);
		});
	}

	async showNotInfos(notification: INotification) {
		const modal = await this.modalController.create({
			component: NotificationInfoPage,
			componentProps: notification,
			mode: "ios"
		});
		await modal.present();
		this.notifications.makeThisReaded(notification.id).then(notList => {
			this.notList = notList;
		});
		return;
	}

	doRefresh() {
		location.reload();
	}

}
