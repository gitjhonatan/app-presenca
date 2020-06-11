import { Component, OnInit, ViewChild, ɵConsole } from '@angular/core';
import { IUser, IDebitInfos } from 'src/app/interfaces/user';
import { ManageUser } from 'src/app/services/manage-user.service';
import { Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from 'src/app/services/firebase.service';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-debito',
	templateUrl: './debito.page.html',
	styleUrls: ['./debito.page.scss'],
})

export class DebitoPage implements OnInit {

	@ViewChild('slides', { static: false }) slides: IonSlides;

	constructor(
		public http: HttpClient,
		private user: ManageUser,
		private router: Router,
		private storage: Storage,
		private fire: FirebaseService
	) {
		this.initPage();
	}

	userInfos: IUser = {};
	inputphone;
	buttonStatement1 = true;
	buttonStatement2 = true;
	phonebuttom = true;
	slideOpts = {
		allowTouchMove: false,
		initialSlide: 0
	};
	debit_infos: IDebitInfos;

	files = {
		statement1: {
			file: null,
			url: null
		},
		statement2: {
			file: null,
			url: null
		},
		extract1: {
			file: null,
			url: null
		},
		extract2: {
			file: null,
			url: null
		}
	}

	ngOnInit() { }

	initPage() {
		this.debit_infos = new IDebitInfos();

		this.user.get().then(async UserInfos => {
			if (UserInfos) {
				let debit_infos = <IDebitInfos>await this.storage.get('debit_infos');

				this.userInfos = UserInfos;

				if (!debit_infos)
					this.debit_infos = new IDebitInfos(UserInfos);
				else {
					this.debit_infos = debit_infos;
					this.checkdate();
				}

			}
		});
	}

	slideNext() {
		this.slides.slideNext();

	}

	slidePrev() {
		this.slides.slidePrev();
	}

	//checa quando o cliente fez sua ultima requisição
	checkdate() {
		this.debit_infos.datecheck = new Date(); //new Date();
		let date_diff = (this.debit_infos.datecheck.getTime() - this.debit_infos.dateRequest.getTime()); // data teste: 1570158000000; //
		let diff_days = date_diff / (1000 * 60 * 60 * 24);

		if (diff_days < 60) {
			this.slides.slideTo(7);
		} else {
			this.debit_infos = new IDebitInfos(this.userInfos);
		}
	}

	//altera a imagem file
	updateFile(id, event) {
		let file = <File>event.srcElement.files[0]
		this.files[id].file = file
		let image = <HTMLImageElement>document.getElementById(id);

		// verifica se há algum arquivo no input
		if (this.files[id].file == null) {
			image.src = "../../../assets/img/add-files.svg";
		} else {
			image.src = "assets/img/added-file.svg";
		}

		// controla o 'disable' dos botões
		if (this.files.statement1.file && this.files.statement2.file)
			this.buttonStatement1 = false
		else
			this.buttonStatement1 = true

		if (this.files.extract1.file && this.files.extract2.file)
			this.buttonStatement2 = false
		else
			this.buttonStatement2 = true
	}

	//validação do inputphone
	phoneValidate(ev) {

		let phone = ev.target.value;
		this.inputphone = phone;

		if (phone.length < 14)
			this.phonebuttom = true;
		else
			this.phonebuttom = false;
	}

	// envia os arquivos para o firebase
	sendFiles() {
		for (const key in this.files) {
			let ref = this.files[key]
			if (ref.file)
				this.fire.sendFile(ref.file, "debitoEmConta").then(url => {
					this.files[key].url = url
				})
		}
	}

	async send() {

		this.slideNext();
		this.sendFiles();
		this.user.saveDebitInfos(this.debit_infos);

		await new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, 5000);
		});

		this.slideNext();

		let channel = 'GSZU4U2S2';


		//integração com o slack
		this.http.post('', { //uma url privada foi omitida aquii

			"emailsOrIds": [
				channel
			],
			"message": 'Um novo cliente CREFISA pelo App Presença aguardando pagamento :atom_symbol:\n' +
				'\nNome: ' + (this.userInfos.name || 'NÃO RECEBIDO') +
				'\nCPF: ' + (this.userInfos.cpf || 'NÃO RECEBIDO') +
				'\nTelefone: ' + this.inputphone +
				'\nDemostrativos de pagamento 1: <' + this.files.extract1.url + '|Clique para ver> ' +
				'\nDemostrativos de pagamento 2: <' + this.files.extract2.url + '|Clique para ver> ' +
				'\nExtrato da Conta Corrente 1: <' + this.files.statement1.url + '|Clique para ver> ' +
				'\nExtrato da Conta Corrente 2: <' + this.files.statement2.url + '|Clique para ver> '

		}).subscribe({
			complete: () => {
			},
			error: (error) => {
			}
		})

	}

	// até aqui
}

