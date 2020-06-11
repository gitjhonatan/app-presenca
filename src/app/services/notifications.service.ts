import { Injectable } from '@angular/core'

import { firebase } from '@firebase/app'
import '@firebase/messaging'
import { environment } from 'src/environments/environment'
import { ManageUser } from './manage-user.service'
import { AlertController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { IUser } from '../interfaces/user'
import { notification_airtable } from '../interfaces/airtable'
import { INotification } from '../interfaces/notification'

@Injectable({
	providedIn: 'root'
})
export class NotificationsService {
	registration: any

	constructor(
		private user: ManageUser,
		private alertController: AlertController,
		private storage: Storage,
		private http: HttpClient
	) {
	}

	frontControler(ev) {
		if (!ev || !ev.data)
			return
		const payload = ev.data["firebase-messaging-msg-data"]
		const data = payload.data

		const notificationOptions: NotificationOptions = {
			body: data.body,
			icon: data.icon,
			badge: data.icon,
			data: `${self.location.origin}/notification/${data.id}`,
			image: data.image
		}

		let url = self.location.href

		let page = 'attendance'

		if (data.origin == 'botrouterteste1')
			page = 'chat'

		if (data.type === 'new message') {
			url = `${self.location.origin}/${page}`
			notificationOptions.data = `${self.location.origin}/${page}`
		}

		const not = new Notification(data.title, notificationOptions)
		not.onclick = () => {
			not.close()
			open(not.data)
		}

		setTimeout(() => {
			if (self.location.href != url)
				self.location.href = url
		}, 1000)
	}

	init(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			navigator.serviceWorker.ready.then((registration) => {
				// Don't crash an error if messaging not supported
				if (!firebase.messaging.isSupported()) {
					resolve();
					return;
				}

				const messaging = firebase.messaging();

				// Register the Service Worker
				messaging.useServiceWorker(registration);

				// Initialize your VAPI key
				// messaging.usePublicVapidKey(
				// 	environment.firebase.vapidKey
				// );
				// Optional and not covered in the article
				// Handle token refresh
				messaging.onTokenRefresh(() => {
					messaging.getToken().then(
						(refreshedToken: string) => {
							this.user.update({ token_push: refreshedToken });
						}).catch((err) => {
							console.error(err);
						});
				});

				resolve();
			}, (err) => {
				reject(err);
				console.error(err)
			});
		});
	}

	requestPermission(alert: boolean): Promise<void> {
		return new Promise<void>(async (resolve) => {
			if (!Notification) {
				resolve();
				return;
			}
			if (!firebase.messaging.isSupported()) {
				resolve();
				return;
			}
			if (Notification.permission == "default" && !alert) {
				this.alertNotifications();
				resolve();
				return;
			}
			else if (Notification.permission == "denied") {
				// NOTIFICATIONS DENIED
				this.denied();
				resolve();
			}
			else {
				try {
					Notification.requestPermission().then(res => {
						if (res == "granted") {
							const messaging = firebase.messaging()

							// Listen to messages from service workers.
							navigator.serviceWorker.addEventListener('message', this.frontControler)

							// Optional and not covered in the article
							// Listen to messages when your app is in the foreground
							messaging.onMessage(this.frontControler);

							messaging.getToken().then(token => {
								this.user.update({ token_push: token })
								resolve()
							}).catch(error => { })
						}
						else {
							this.denied()
							resolve()
						}
					})
				} catch (err) {
					// No notifications granted
				}
				resolve()
			}
		})
	}

	async alertNotifications() {
		const alert = await this.alertController.create({
			header: 'Notificações no APP',
			message: 'Quer receber novidades sobre seu contrato e margem liberada?',
			buttons: [
				{
					text: 'Negar',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {
						this.denied()
					}
				}, {
					text: 'Permitir',
					handler: (blah) => {
						this.requestPermission(true)
					}
				}],
			mode: "ios"
		})

		await alert.present()
	}

	denied() {
		return this.user.update({ token_push: null })
	}

	getAirtableHistory(user: IUser): Promise<INotification[]> {
		return new Promise(resolve => {
			if (!user)
				user = { cpf: '', email: '' }
			this.storage.get('record_id').then(record_id => {
				this.getStorageHistory().then(notification_list => {
					if (!notification_list)
						notification_list = []
					let url = '' //url privada omitida
					var headers = new HttpHeaders
					headers = headers.append('Authorization', this.user.airtableAuth)

					this.http.get(url, { headers }).toPromise().then(data => {
						let sanitizedData: any = data
						let notifications: notification_airtable[] = sanitizedData.records

						notifications.forEach(notification => {
							let id = notification.id
							if (notification_list.find(element => { return element.id == id }))
								return
							notification_list.push({
								id: notification.id,
								title: notification.fields.titulo,
								body: notification.fields.corpo,
								date: notification.createdTime,
								image: notification.fields.imagem,
								clique_imagem: notification.fields.clique_imagem,
								readed: false
							})
						})
						this.storage.set('notification_list', notification_list)
						resolve(notification_list)
					})
				})
			})
		})
	}

	getStorageHistory(): Promise<INotification[]> {
		return new Promise(resolve => {
			this.storage.get('notification_list').then(notificationsStorage => {
				let returnNot: INotification[] = notificationsStorage
				resolve(returnNot)
			})
		})
	}

	isThisNewPush(force: boolean = false, user?: IUser): Promise<number> {
		return new Promise(async resolve => {
			if (force === true)
				var notifications = await this.getAirtableHistory(user)
			else
				notifications = await this.getStorageHistory()
			if (notifications) {
				let number: number = 0
				notifications.forEach(notification => {
					if (notification.readed === false)
						number++
				})
				resolve(number)
			}
			else resolve(0)
		})
	}

	makeThisReaded(record_id: string): Promise<INotification[]> {
		return new Promise(resolve => {
			this.getStorageHistory().then(notifications => {
				notifications.forEach(notification => {
					let id = notification.id
					if (record_id == id)
						notification.readed = true
				})
				this.storage.set('notification_list', notifications)
				resolve(notifications)
			})
		})
	}
}
