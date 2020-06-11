import { Injectable } from '@angular/core';
import { ManageUser } from './manage-user.service';
import { AlertController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})
export class InstallControllerService {

	constructor(
		public user: ManageUser,
		private alertController: AlertController
	) { }

	deferredInstallPrompt: any = null;

	init(window: Window) {
		window.addEventListener('beforeinstallprompt', (e) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later on the button event.
			this.deferredInstallPrompt = e;
			// Show alert to notify the user they can add to home screen
			this.showAlert(e);
		});
	};

	async showAlert(e: Event) {
		const alert = await this.alertController.create({
			header: 'Instalar aplicativo',
			message: 'Quer ter todas as vantagens? Instale o aplicativo e tenha acesso à todos os serviços da Presença sempre que precisar!',
			buttons: [
				{
					text: 'Cancelar',
					role: 'cancel',
					cssClass: 'secondary',
					handler: (blah) => {
						this.denied();
					}
				}, {
					text: 'Instalar',
					handler: (blah) => {
						this.requestInstallation();
					}
				}],
			mode: "ios"
		});

		await alert.present();
	}

	denied() {
		return this.user.update({ installed: null });
	}

	requestInstallation() {
		this.deferredInstallPrompt.prompt();
		this.deferredInstallPrompt.userChoice
			.then(choice => {
				if (choice.outcome === 'accepted')
					this.user.update({ installed: true });
				else
					this.user.update({ installed: null });
			});
		this.deferredInstallPrompt = null;
	}
}
