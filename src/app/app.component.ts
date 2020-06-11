import { Component } from '@angular/core'

import { Platform, ToastController } from '@ionic/angular'
import { Storage } from '@ionic/storage'
import { Router } from '@angular/router'
import { AlertController } from '@ionic/angular'
import { InstallControllerService } from './services/install-controller.service'

import { SwUpdate } from '@angular/service-worker'

// FIREBASE
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { NotificationsService } from './services/notifications.service'
import { ManageUser } from './services/manage-user.service'
import { IUser } from './interfaces/user'

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {
	title = 'app-presenca'

	constructor(
		private notifications: NotificationsService,
		private platform: Platform,
		private storage: Storage,
		private router: Router,
		private alertController: AlertController,
		private installer: InstallControllerService,
		private swUpdate: SwUpdate,
		private toastController: ToastController,
		private user: ManageUser
	) {
		this.initializeApp()
		if (this.swUpdate.isEnabled) {
			this.swUpdate.available.subscribe({
				complete: () => {
					this.showToast()
				}
			})
			this.swUpdate.available.subscribe(() => {
				this.showToast()
			})
		}
	}

	// TODO: MUDAR COR DO TEXTO RECARREGAR
	async showToast() {
		const toast = await this.toastController.create({
			message: 'Atualização disponível',
			position: 'bottom',
			mode: 'md',
			color: 'primary',
			buttons: [{
				text: 'Recarregar',
				handler: () => {
					location.reload()
				}
			}
			]
		})
		toast.present()

	}

	isApp = false

	appPages = [
		{
			title: 'Início',
			link: 'home',
			data: {},
			icon: 'home',
			mode: 'md'
		},
		{
			title: 'Atendimento',
			link: 'attendance',
			data: {},
			icon: 'chatbubbles',
			mode: 'ios'
		},
		{
			title: 'Sou Presença',
			link: 'soupresenca',
			data: {},
			icon: 'people',
			mode: 'ios'
		},
		{
			title: 'Simular empréstimo',
			link: 'simulator',
			data: {},
			icon: 'calculator',
			mode: 'ios'
		},
		{
			title: 'Câmeras ao vivo',
			link: 'cameras-ao-vivo',
			data: {},
			icon: 'videocam',
			mode: 'ios'
		}
	]
	loggedIn = false

	initializeApp() {
		this.checkSource()
		if (this.platform.is('desktop')) {
			this.isApp = false
		} else {
			this.isApp = true
		}
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.platform.ready().then(() => {
					this.notifications.requestPermission(false)
				})
			}
		})
	}

	checkSource() {
		const search = location.search.substring(1)
		let urlData: any
		if (search)
			urlData = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
		let params: IUser = {}
		if (urlData && urlData.source) {
			params.source = urlData.source
		}
		if (urlData && urlData.i) {
			params.indicator = [urlData.i]
		}
		if (JSON.stringify(params) != "{}") {
			this.user.update(params, { airtable: false })
		}

	}

	async notAvailable() {
		const alert = await this.alertController.create({
			header: 'Função indisponível',
			message: 'Esta função ainda não está disponível!',
			buttons: ['Okay'],
			mode: "ios"
		})

		await alert.present()
	}

	pushPage(page, data) {
		if (page == "notAvailable")
			this.notAvailable()
		else
			this.router.navigate([page, data])
	}

	openOnboarding() {
		this.storage.set('ion_did_onboarding', false).then(test => {
			this.router.navigateByUrl('/onboarding')
		})
	}

	ngOnInit() {
		this.platform.ready().then(async () => {
			this.installer.init(window)
			// this.notifications.init()
		})
	}

	ngAfterViewInit() { }
}
