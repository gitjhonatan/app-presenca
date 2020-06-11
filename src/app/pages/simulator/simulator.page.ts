import { Component, OnInit, ViewChild } from '@angular/core'
import { IUser, ISimulationInfos } from 'src/app/interfaces/user'
import { ManageUser } from 'src/app/services/manage-user.service'
import { Router } from '@angular/router'
import { LoadingController, IonSlides, IonInput, AlertController } from '@ionic/angular'
import { PopoverController } from '@ionic/angular'
import { InformCPFComponent } from '../../component/inform-cpf/inform-cpf.component'
import { Storage } from '@ionic/storage'
import { GetClientCreditService } from 'src/app/services/get-client-credit.service'
import { HttpClient } from '@angular/common/http'


@Component({
	selector: 'app-simulator',
	templateUrl: './simulator.page.html',
	styleUrls: ['./simulator.page.scss'],
})
export class SimulatorPage implements OnInit {
	@ViewChild('slides', { static: false }) slides: IonSlides
	@ViewChild('cpfInput', { static: false }) cpfInput: IonInput

	constructor(
		public http: HttpClient,
		private user: ManageUser,
		private router: Router,
		private popoverController: PopoverController,
		private loadingController: LoadingController,
		private alertController: AlertController,
		private credit: GetClientCreditService,
		private storage: Storage
	) {
		this.initPage()
	}

	userInfos: IUser = {}
	submitted = false
	cpfIsValid = false
	cpfIncomplete = true
	editCPF = true
	loading: HTMLIonLoadingElement
	toLoad = false
	maxDate: string
	slideOpts = {
		allowTouchMove: false,
		// initialSlide: 6
	}
	simulation_infos: ISimulationInfos

	profiles = {
		'Aposentado': {
			categories_title: "",
			categories: [],
			sub_categories: [],
			inactive: false
		},
		'Pensionista': {
			categories_title: "",
			categories: [],
			sub_categories: [],
			inactive: false
		},
		'Servidor público': {
			categories_title: "Selecione sua carreira:",
			categories: [
				"Servidor Municipal",
				"Servidor Estadual",
				"Servidor Federal",
			],
			sub_categories: [],
			inactive: false
		},
		'Forças armadas': {
			categories_title: "Selecione o convênio:",
			categories: [
				"Exército Brasileiro",
				"Marinha do Brasil",
				"Força Aérea Brasileira"
			],
			sub_categories: [
				"Carreira",
				"Temporário"
			],
			inactive: true
		},

		'Funcionário CLT/Estagiário': {
			categories_title: "",
			categories: [],
			sub_categories: [],
			inactive: true
		},
		'Empresário ou autônomo': {
			categories_title: "",
			categories: [],
			sub_categories: [],
			inactive: true
		}
	}

	simulationOptions = []

	ngOnInit() {
		this.simulationOptions = Object.keys(this.profiles)
	}

	initPage() {
		this.simulation_infos = new ISimulationInfos()
		let now = new Date()
		now.setHours(0, 0, 0, 0)
		this.maxDate = now.toISOString()
		this.user.get().then(async infos => {
			if (infos) {
				this.userInfos = infos
				let simulation_infos = this.userInfos.simulation_infos
				// let simulation_infos = await this.storage.get('simulation_infos')
				if (!simulation_infos)
					this.simulation_infos = new ISimulationInfos()
				else
					this.simulation_infos = simulation_infos
				if (infos.cpf) {
					this.editCPF = false
					await new Promise(resolve => {
						setTimeout(() => {
							resolve()
						}, 50)
					})
					this.testCPF({ target: { value: infos.cpf } })
				}
				this.userInfos = <IUser>infos
			}
		})
	}

	testCPF(ev) {
		// TODO: AS VEZES NÃO FUNCIONA
		// todo: verificar no início
		let cpf = ev.target.value
		this.cpfIncomplete = cpf.length > 13 ? false : true
		this.cpfIsValid = this.validateCPF(cpf)
	}

	validateCPF(strCPF: string): boolean {
		var Soma
		var Resto
		Soma = 0
		strCPF = strCPF.replace(/[^0-9]/g, "")
		var reduce = s => s.split("").sort().reduce((a, b) => (a[a.length - 1] != b) ? (a + b) : a, "")
		if (reduce(strCPF) == "0") return false

		for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
		Resto = (Soma * 10) % 11

		if ((Resto == 10) || (Resto == 11)) Resto = 0
		if (Resto != parseInt(strCPF.substring(9, 10))) return false

		Soma = 0
		for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
		Resto = (Soma * 10) % 11

		if ((Resto == 10) || (Resto == 11)) Resto = 0
		if (Resto != parseInt(strCPF.substring(10, 11))) return false
		return true
	}

	async presentLoading() {
		this.toLoad = true
		this.loading = await this.loadingController.create({
			message: 'Aguarde',
			spinner: 'crescent'
		})
		if (this.toLoad)
			await this.loading.present()
	}

	dismissLoading() {
		if (this.loading) {
			this.loading.dismiss()
		} else this.toLoad = false
	}

	slideNext() {

		this.slides.slideNext()
	}

	slidePrev() {
		this.slides.slidePrev()
	}

	async notAvailable() {
		const alert = await this.alertController.create({
			header: 'Opção indisponível',
			message: 'Esta opção ainda não está disponível!',
			buttons: ['Okay'],
			mode: "ios"
		})

		await alert.present()
	}

	selectThis(option: string, ev: any) {
		let value: any = ''
		// if (option === 'category' && ev.target.innerText == /Federal/g) {
		// 	// console.log(ev.target.innerText)
		// 	this.notAvailable()
		// }
		if (ev.target)
			if (ev.target.innerText)
				value = ev.target.innerText
		if (ev.detail)
			if (ev.detail.value)
				value = ev.detail.value
		if (value == "(em breve)") {
			this.notAvailable()
			return
		}
		if (option == 'profile') {
			if (ev.target.classList.contains('option')) {
				if (value.replace)
					value = value.replace(/(\r|\n)\(em breve\)/g, '')
				if (this.profiles[value] && this.profiles[value].inactive) {
					this.notAvailable()
					return
				}
				this.simulation_infos.profile = value
				this.simulation_infos.category = null
				this.simulation_infos.sub_category = null
			}
		}
		else if (option == 'category') {
			this.storage.set('organ', { organ: ev.target.innerText })
			if (ev.target.classList.contains('option')) {
				this.simulation_infos.category = value
			}
		}
		else if (option == 'sub_category') {
			if (ev.target.classList.contains('sub-option'))
				this.simulation_infos.sub_category = value
		}
		else if (option == 'money_needed')
			this.simulation_infos.money_needed = parseInt(value)
		else if (option == 'income')
			this.simulation_infos.income = parseInt(value)
		else if (option == 'hasLoan')
			if (ev.target.classList.contains('sub-option')) {
				if (ev.target.innerText == 'Sim') {
					this.simulation_infos.hasLoans = true
					if (this.simulation_infos.activeLoans.length == 0)
						this.addLoan()
				}
				else {
					this.simulation_infos.hasLoans = false
					this.simulation_infos.activeLoans = []
				}
			}
	}

	public addLoan() {
		this.simulation_infos.activeLoans.push({ number: 0, text: '' })
	}

	public currency(number: number): string {
		if (number)
			return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
		else
			return "R$ 0,00"
	}

	async presentPopover(ev: any, option: string) {

		const popover = await this.popoverController.create({
			component: InformCPFComponent,
			event: ev,
			mode: 'ios',
			componentProps: { option: option },
			translucent: false
		})

		await popover.present()
		const { data } = await popover.onWillDismiss()
		if (data == 'dont-inform')
			this.slideNext()
		// dont inform
	}

	validateLoans() {
		if (this.simulation_infos.hasLoans == null)
			return false
		let valid = true
		for (let i = 0; i < this.simulation_infos.activeLoans.length; i++) {
			if (this.simulation_infos.activeLoans[i].text != '')
				this.simulation_infos.activeLoans[i].number = parseInt(this.simulation_infos.activeLoans[i].text.replace(/[^0-9]/g, '')) / 100
			else
				this.simulation_infos.activeLoans[i].number = 0
			if (this.simulation_infos.activeLoans[i].number == 0)
				valid = false
		}
		this.simulation_infos.activeLoans.forEach(loan => {
			if (loan.number == 0)
				valid = false
		})
		return valid
	}

	async simulate() {
		// todo: save user infos
		let profile = this.simulation_infos.profile
		if (profile == 'Aposentado' || profile == 'Pensionista') {
			this.slideNext()
			this.userInfos.simulation_infos = Object.assign({}, this.simulation_infos)
			this.user.update(this.userInfos).then(() => {
				this.credit.getData()
			})

			await new Promise(resolve => {
				setTimeout(() => {
					resolve()
				}, 5000)
			})
			this.router.navigateByUrl('credit-details')

			await new Promise(resolve => {
				setTimeout(() => {
					resolve()
				}, 1000)
			})
			this.slides.slideTo(0)
		}
	}

	eraseThisLoan(i: number) {
		this.simulation_infos.activeLoans.splice(i, 1)
	}

	pushPage(ev) {

		this.router.navigateByUrl('public-server')
		// else
		// 	this.router.navigate(['chat', { data: 'resgatar' }]);
	}



}