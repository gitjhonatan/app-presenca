import { Component, OnInit } from '@angular/core'
import { LoadingController } from '@ionic/angular'
import { ModalController } from '@ionic/angular'
import { ActivatedRoute } from '@angular/router'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { NgForm } from '@angular/forms'
import { Storage } from '@ionic/storage'

import { IUser } from '../../../interfaces/user'
import { ManageUser } from '../../../services/manage-user.service'

// FIREBASE
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'

@Component({
	selector: 'app-attendance',
	templateUrl: './attendance.page.html',
	styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

	urlBase = 'attendanceChat'
	paramBase = 'attendance'
	url: SafeResourceUrl
	startChat = false
	informName = false
	submitted = false
	params: any = {}
	userInfos: IUser = {}
	cpfIsValid = false
	cpfIncomplete = true
	editCPF = true
	loading = false

	constructor(
		public modalController: ModalController,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer,
		private user: ManageUser,
		public storage: Storage,
		private loadingController: LoadingController
	) { }

	initText = {
		status: "Olá, gostaria de verificar o <b>status do meu contrato</b>",
		resgatar: "Olá, gostaria de resgatar o <b>valor disponível</b> no meu CPF",
		margem: "Olá, gostaria de consultar a <b>margem disponível</b> para o meu benefício",
		refin: "Olá, gostaria de simular um refinanciamento para <b>redução da taxa de juros</b> do meu consignado atual",
		portabilidade: "Olá, gostaria de simular uma portabilidade para <b>redução da taxa de juros</b> do meu consignado atual",
		antecipe: "Olá, gostaria de mais informações sobre <b>antecipação do aumento de salário</b>",
		publicserver: "Olá, gostaria de obter maiores informações sobre a <b>margem pré-aprovada</b> para funcionários da prefeitura de São Paulo"
	}

	ngOnInit() { }

	getUrl(): SafeResourceUrl {
		const url = `
		/${this.urlBase}/index.html?
		fullName=${this.userInfos.name}
		&tokenPUSH=${this.userInfos.token_push}
		&firebaseUID=${this.userInfos.firebase_uid}
		${this.userInfos.email ? '&email=' + this.userInfos.email : ''}
		${this.params.message ? '&textoInicio=' + this.params.message : ''}
		${this.userInfos.consultor ? '&consultor=' + this.userInfos.consultor : ''}
		${this.userInfos.cpf ? '&cpf=' + this.userInfos.cpf.replace(/[^0-9]/g, '') : ''}
		${this.userInfos.phoneNumber ? '&phoneNumber=' + this.userInfos.phoneNumber : ''}
		${this.userInfos.source ? '&campaign=' + this.userInfos.source : ''}`
			/** remover as quebras de linha */
			.replace(/\n\t*|\r/g, '')
		return this.sanitizer.bypassSecurityTrustResourceUrl(url)
	}

	getParams() {
		const search = location.search.substring(1)
		let urlData: any
		if (search)
			urlData = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')

		if (urlData)
			this.params = urlData

		this.route.params.subscribe(params => {

			if (params.data) {
				this.params.message = this.initText[params.data]
			}

			this.tryInit(true)

			this.get()
		})
	}

	get() {
		this.user.get().then(user => {
			if (user)
				this.userInfos = user

			if (!firebase.auth().currentUser || this.userInfos.cpf) {
				this.presentLoading()
			}
			else {
				this.tryInit()
			}
		})
	}

	ionViewWillEnter() {
		this.getParams()

		window.history.pushState(this.paramBase, 'APP Presença', '/' + this.paramBase)
	}

	init() {
		if (!this.userInfos.user_did_chat) {
			this.userInfos.user_did_chat = true
			if (!this.params.message)
				this.params.message = "Olá"
		}
		this.informName = false
		this.startChat = true
		this.userInfos.firebase_uid = firebase.auth().currentUser.uid
		this.user.update(this.userInfos)
		this.url = this.getUrl()
	}

	tryInit(load?: boolean) {

		if (this.startChat == true || this.loading || load)
			return

		if (this.params.p) {
			this.userInfos.phoneNumber = this.params.p
			this.params.message = "1"
			this.init()
		}

		else if (!this.userInfos.name)
			this.informName = true

		else
			this.init()
	}

	onSendInfos(form: NgForm) {
		this.submitted = true

		if (form.valid) {
			this.tryInit()
		}
	}

	testCPF() {
		let cpf = (<HTMLInputElement>document.querySelector('#CPFinput')).value
		this.cpfIncomplete = cpf.length > 13 ? false : true
		this.cpfIsValid = this.isThisCpfValid(cpf)
	}

	isThisCpfValid(strCPF: string): boolean {
		let Soma
		let Resto
		Soma = 0
		strCPF = strCPF.replace(/[^0-9]/g, "")
		let reduce = s => s.split("").sort().reduce((a, b) => (a[a.length - 1] != b) ? (a + b) : a, "")
		if (reduce(strCPF) == "0") return false

		for (let i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
		Resto = (Soma * 10) % 11

		if ((Resto == 10) || (Resto == 11)) Resto = 0
		if (Resto != parseInt(strCPF.substring(9, 10))) return false

		Soma = 0
		for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
		Resto = (Soma * 10) % 11

		if ((Resto == 10) || (Resto == 11)) Resto = 0
		if (Resto != parseInt(strCPF.substring(10, 11))) return false
		return true
	}

	async presentLoading() {
		this.loading = true
		const loading = await this.loadingController.create({
			duration: 1000,
			message: 'Aguarde...',
			translucent: true
		})

		await loading.present()

		await loading.onDidDismiss()
		this.loading = false

		firebase.auth().onAuthStateChanged(user => {
			if (user)
				this.tryInit()
		})
	}
}