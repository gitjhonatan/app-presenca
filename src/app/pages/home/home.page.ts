import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { NotificationsPage } from '../notifications/notifications.page'
import { ModalController } from '@ionic/angular'
import { Router } from '@angular/router'
import { ManageUser } from 'src/app/services/manage-user.service'
import { PopoverController } from '@ionic/angular'
import { Storage } from "@ionic/storage";
import { IUser } from '../../interfaces/user'
import { GetClientCreditService } from 'src/app/services/get-client-credit.service'
import { NotificationsService } from 'src/app/services/notifications.service'
import { PopoverDetailsComponent } from '../../component/popover-details/popover-details.component'
import { firebase } from '@firebase/app'
import '@firebase/messaging'
import { HttpClient } from '@angular/common/http'


@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
	@ViewChild('spinner', { static: false }) spinner: ElementRef<HTMLImageElement>
	@ViewChild('valueCredit', { static: false }) divValueCredit: ElementRef<HTMLDivElement>

	constructor(
		public http: HttpClient,
		private storage: Storage,
		private alertController: AlertController,
		private modalController: ModalController,
		private router: Router,
		private notifications: NotificationsService,
		private user: ManageUser,
		private getCredit: GetClientCreditService,
		private popoverController: PopoverController
	) {
		this.set_greeting()
	}

	ratingOptions = {
		autoHeight: true,
		loop: true,
		autoplay: true
	}

	value = {
		int: '0',
		cents: '00'
	}

	hour = new Date().getHours()

	hasMargin = false

	first_name: string
	userInfo: IUser = {}
	pushCount: number = 0
	greeting: string
	messageCount: number = 1


	ngOnInit() {
		this.checkNotifications()
		this.storage.get('lock_public-server').then(res => {
			if (res && res.lock) {
				this.lock = res.lock
			}
		})
		
		
	}

	lock = false

	set_greeting() {
		if (this.hour > 4 && this.hour < 12)
			this.greeting = "Bom dia"
		else if (this.hour > 11 && this.hour < 20)
			this.greeting = "Boa tarde"
		else
			this.greeting = "Boa noite"
	}

	newsOptions = {
		centerInsufficientSlides: true,
		centeredSlides: true,
		slidesPerView: 'auto',
		loop: true
	}
	async ionViewWillEnter() {
		this.getClientCredit().then(_ => {
			this.hideLoading()
		})
		this.user.get().then(res => {
			if (res != null) {
				this.userInfo = res
				if (this.userInfo.name)
					this.first_name = this.sanitizeName(this.userInfo.name).split(' ')[0]
			}
		})
	}

	checkNotifications() {
		this.notifications.isThisNewPush().then(number => { this.pushCount = number })
		this.user.get().then(res => {
			this.notifications.isThisNewPush(true, res).then(number => { this.pushCount = number })
		})
	}

	sanitizeName(name: string): string {
		if (typeof name !== 'string') return ''
		return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
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

	openCameras() {
		window.open("https://promotorapresenca.com.br/camera-1", '_blank')
	}

	async presentPopover(ev: any, text: string) {

		const popover = await this.popoverController.create({
			component: PopoverDetailsComponent,
			event: ev,
			mode: 'ios',
			componentProps: { text: text },
			translucent: false
		})

		return await popover.present()
	}

	async openNotifications() {
		const modal = await this.modalController.create({
			component: NotificationsPage,
			mode: "ios"
		})
		modal.onWillDismiss().then(modal => {
			this.notifications.isThisNewPush().then(number => { this.pushCount = number })
		})
		return await modal.present()
	}

	async pushPage(page, data, event?) {

		if (page == "notAvailable")
			return this.notAvailable()
		else if (page == "menu")
			if ((this.userInfo.cpf || this.hasMargin) && this.value.int != '0') {
				page = 'credit-details'
				data = {}
			}
			else if (this.userInfo.cpf && this.value.int === '0' && page != '' && !this.lock) {
				this.presentPopover(event, "Infelizmente parece que não temos nenhum valor disponível para você. Mas não se preocupe, quando você tiver margem livre com a gente nós entraremos em contato!")
				return
			}
			else
				page = "simulator"
		this.router.navigate([page, data])
	}

	getClientCredit(): Promise<{ int: string, cents: string }> {
		this.showLoading()
		return new Promise(resolve => {
			this.getCredit.total().then(number => {
				if (number != undefined) {
					var Tnumber = number.toFixed(2).replace('.', ',').replace(/\d(?=(\d{3})+\,)/g, '$&.')
					let value = {
						int: Tnumber.split(',')[0],
						cents: Tnumber.split(',')[1]
					}
					this.value = value
					if (number >= 500)
						this.hasMargin = true

					resolve(value)
				}
				else resolve()
			})
		})
	}

	doRefresh() {
		location.reload()
	}

	showLoading() {
		this.spinner.nativeElement.classList.remove('hidden')
		this.divValueCredit.nativeElement.classList.add('hidden')
	}

	hideLoading() {
		this.spinner.nativeElement.classList.add('hidden')
		this.divValueCredit.nativeElement.classList.remove('hidden')
	}

	shortcuts = [
		{
			link: "chat",
			data: { data: 'status' },
			img: "assets/img/icon-menu-status.svg",
			text: "Status de contrato"
		},
		{
			link: "simulator",
			data: { data: 'margem' },
			img: "assets/img/icon-menu-margem.svg",
			text: "Consultar margem"
		},
		{
			link: "chat",
			data: { data: 'refin' },
			img: "assets/img/icon-menu-refin.svg",
			text: "Refinanciar"
		},
		{
			link: "chat",
			data: { data: 'portabilidade' },
			img: "assets/img/icon-menu-portabilidade.svg",
			text: "Portabilidade"
		},
		{
			link: "soupresenca",
			data: {},
			img: "assets/img/icon-menu-soupresenca.svg",
			text: "Trabalhe conosco"
		},
		{
			link: "notAvailable",
			data: {},
			img: "assets/img/icon-menu-indicar.svg",
			text: "Indicações"
		}
	]

	rating = [
		{
			rate: "Fiquei impressionada pelo profissionalismo com que fui tratada. Estava cotando com outra empresa ao mesmo tempo e, enquanto a outra criou toda sorte de problemas, a Presença resolveu tudo rapidamente. Meu muito obrigada à Presença e especialmente à Luciana.",
			name: "Cintia Silvestre",
			city: "São Paulo",
			photo: "https://promotorapresenca.com.br/images/2018/02/25/cintia.jpg"
		},
		{
			rate: "Fiquei muito satisfeito com atendimento, com a gentileza e principalmente com a paciência que tiveram comigo, porque demorei muito, perguntei bastante e propus varias simulações e mesmo assim fui atendido com a mesma disposição, especialmente pela  Verônica que foi muito simpática e profissional para comigo. Obrigado.",
			name: "Eugênio Leite",
			city: "São Paulo",
			photo: "https://promotorapresenca.com.br/images/2018/02/25/eugenio.jpg"
		},
		{
			rate: "Atendimento rápido e com pessoas eficientes. Meu obrigada a Nádia que sempre com paciência, atendeu minha solicitação tirando dúvidas e nos orientando. Você faz parte indiretamente da realização do meu sonho. Obrigada.",
			name: "Maria Lo Rocha",
			city: "Fortaleza",
			photo: "https://promotorapresenca.com.br/images/2018/02/25/marialo.jpg"
		},
		{
			rate: "Ótimo atendimento, facilidade e agilidade no processo de avaliação e liberação de créditos. Fui atendida pela Bárbara Leal e super indico para quem precisar de crédito.",
			name: "Eunice Guerra",
			city: "Brasília",
			photo: "https://promotorapresenca.com.br/images/2018/02/25/eunice.jpg"
		},
		{
			rate: "Fui muito bem atendido o rapaz tirou todas as minhas dúvidas e ainda me deu sugestões muito favoráveis a minha situação.",
			name: "Pedro Silva",
			city: "Pernambuco",
			photo: "https://promotorapresenca.com.br/images/2018/02/25/pedro.jpg"
		}
	]

	async checkHour() {
		if (this.hour >= 22 || this.hour < 7) {
			const alert = await this.alertController.create({
				header: 'OPS!',
				message: 'Atualmente nossas simulações são realizadas no horário comercial extendido das 07h00 às 22h00.<br><br> Ative as notificações para ser avisado quando a consulta estiver disponível!',
				buttons: [
					{
						text: 'Permitir',
						handler: (blah) => {
							this.sendToken()
						}
					}],
				mode: "ios"
			})
			await alert.present()
		}
		else
			this.router.navigateByUrl('public-server')

	}

	sendToken() {
		if (!this.userInfo.token_push || this.userInfo.token_push === null) {
			this.notifications.requestPermission(true).then(() => {
				const messaging = firebase.messaging()
				// Listen to messages from service workers.
				navigator.serviceWorker.addEventListener('message', this.notifications.frontControler)
				// Optional and not covered in the article
				// Listen to messages when your app is in the foreground
				messaging.onMessage(this.notifications.frontControler);
				messaging.getToken().then(token => {
					this.http.get(``) //uma url privada foi omitida aquii
						.subscribe({
							next: () => {
								this.user.update({ token_push: token })
							},
							error: err => {
							}
						})
				}).catch(error => { })
			})
		}
		else {
			this.http.get(``) //url privada omitida
				.subscribe({
					next: () => {
					},
					error: err => {
					}
				})

		}
	}

}


