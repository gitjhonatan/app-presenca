import { Component, OnInit } from '@angular/core';
import { GetClientCreditService } from 'src/app/services/get-client-credit.service';
import { PopoverController } from '@ionic/angular';
import { PopoverDetailsComponent } from '../../component/popover-details/popover-details.component';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage'

@Component({
	selector: 'app-credit-details',
	templateUrl: './credit-details.page.html',
	styleUrls: ['./credit-details.page.scss'],
})

export class CreditDetailsPage implements OnInit {

	constructor(
		private getCredit: GetClientCreditService,
		private popoverController: PopoverController,
		private router: Router,
		private storage: Storage,
	) { }


	ngOnInit() {
		this.storage.get('organ').then(res => {
			if (res) {
				if (res.organ == "Servidor Municipal") {
					this.banner = true
					this.organ = "pmsp"
				}
				else {
					this.organ = "govsp"
					this.url = {
						unlock: "https://www.youtube.com/watch?v=kRJTyDGqr10&feature=youtu.be",
						first: "https://www.youtube.com/watch?v=v4hxJYUp1QQ&feature=youtu.be"
					}
				}
			}
			else {
				this.url = {
					unlock: "https://www.youtube.com/watch?v=XVkdCKn-6VE&feature=youtu.be",
					first: "https://www.youtube.com/watch?v=Y4SkEztCAk0&feature=youtu.be"
				}

			}

		})

		this.storage.get('lock_public-server').then(res => {
			if (res && res.lock) {
				this.lock = res.lock
			}
		})
	}

	ionViewWillEnter() {
		this.getClientCredit();
	}

	//variável para o chat
	organ = "resgatar"

	url = {
		unlock: null,
		first: null,
	}


	total = {
		int: '0',
		cents: '00'
	}

	lock = false
	banner = false

	products = [
		{
			name: 'Empréstimo Novo',
			value: {
				int: '0',
				cents: '00'
			}
		},
		{
			name: 'Saque Complementar',
			value: {
				int: '0',
				cents: '00'
			}
		},
		{
			name: 'Refinanciamento',
			value: {
				int: '0',
				cents: '00'
			}
		},
	];

	async presentPopover(ev: any, obj: any) {
		let text: string;
		if (obj.name === "Saque Complementar")
			text = "Margem complementar para uso livre, liberada no cartão consignado";
		else if (obj.name === "Empréstimo Novo")
			text = "Margem livre disponível para novo empréstimo";
		else if (obj.name === "Refinanciamento")
			text = "Redução da taxa de juros com liberação de um troco em até 48h";
		else if (obj.name === "total")
			text = "Valor total pré-aprovado (Valor menor pode ser solicitado pelo atendimento)";
		else if (obj == "noMargin")
			text = "Infelizmente parece que não temos nenhum valor disponível para você. Mas não se preocupe, quando você tiver margem livre com a gente nós entraremos em contato!";

		const popover = await this.popoverController.create({
			component: PopoverDetailsComponent,
			event: ev,
			mode: 'ios',
			componentProps: { text: text },
			translucent: false
		});

		return await popover.present();
	}

	getClientCredit(): Promise<{ int: string, cents: string }> {
		return new Promise(() => {
			this.getCredit.getsepareted().then(values => {
				this.total = this.sanitizeValue(values.sum);
				this.products.find(element => { return element.name === 'Empréstimo Novo' }).value = this.sanitizeValue(values.novo);
				this.products.find(element => { return element.name === 'Refinanciamento' }).value = this.sanitizeValue(values.refin);
				this.products.find(element => { return element.name === 'Saque Complementar' }).value = this.sanitizeValue(values.mc);
				return;
			});
		})
	}

	sanitizeValue(value: number) {
		var Tnumber = (Math.trunc(value / 10) * 10).toFixed(2).replace('.', ',').replace(/\d(?=(\d{3})+\,)/g, '$&.');
		return {
			int: Tnumber.split(',')[0],
			cents: Tnumber.split(',')[1]
		}
	}

	pushPage(ev) {
		if (ev.toElement.id === "simulateAgain")
			this.router.navigateByUrl('public-server')
		else if (this.total.int == '0')
			this.presentPopover(ev, 'noMargin')
		else
			this.router.navigate(['chat', { data: this.organ }]);
	}

	doRefresh() {
		location.reload();
	}

}
