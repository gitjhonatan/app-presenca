import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { IUser } from '../../interfaces/user';

import { ManageUser } from '../../services/manage-user.service';

@Component({
	selector: 'app-update-user-infos',
	templateUrl: './update-user-infos.page.html',
	styleUrls: ['./update-user-infos.page.scss'],
})
export class UpdateUserInfosPage implements OnInit {
	userInfos: IUser = {};
	submitted = false;
	update = false;
	cpfIsValid = true;
	cpfIncomplete = true;
	editCPF = true;

	constructor(
		private alertController: AlertController,
		public router: Router,
		public user: ManageUser) { }

	async ngOnInit() {
		this.user.get().then(infos => {
			if (infos) {
				if (infos.name || infos.email || infos.cpf)
					this.update = true;
				if (infos.cpf)
					this.editCPF = false;
				this.userInfos = <IUser>infos;
			}
		});
	}

	async onSendInfos(form: NgForm) {
		this.submitted = true;

		this.testCPF();

		if (form.valid && this.cpfIsValid == true) {


			this.user.update(this.userInfos).then(user => {
				this.userInfos = user
			})

			if (this.update == true)
				var alert = await this.alertController.create({
					header: 'Dados atualizados',
					message: 'Os dados foram atualizados com sucesso!',
					buttons: [{ text: 'Okay', handler: (res) => { this.router.navigateByUrl('home'); } }],
					mode: "ios"
				});
			else
				var alert = await this.alertController.create({
					header: 'Dados inseridos',
					message: 'Os dados foram inseridos com sucesso!',
					buttons: [{ text: 'Continuar', handler: (res) => { this.router.navigateByUrl('home'); } }],
					mode: "ios"
				});

			await alert.present();
		}
	}

	testCPF() {
		let cpf = (<HTMLInputElement>document.querySelector('#CPFinput')).value;
		this.cpfIncomplete = cpf.length > 13 ? false : true;
		this.cpfIsValid = this.isThisCpfValid(cpf);
	}

	isThisCpfValid(strCPF: string): boolean {
		if(!strCPF)
		return true
		var Soma;
		var Resto;
		Soma = 0;
		strCPF = strCPF.replace(/[^0-9]/g, "");
		var reduce = s => s.split("").sort().reduce((a, b) => (a[a.length - 1] != b) ? (a + b) : a, "");
		if (reduce(strCPF) == "0") return false;

		for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
		Resto = (Soma * 10) % 11;

		if ((Resto == 10) || (Resto == 11)) Resto = 0;
		if (Resto != parseInt(strCPF.substring(9, 10))) return false;

		Soma = 0;
		for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
		Resto = (Soma * 10) % 11;

		if ((Resto == 10) || (Resto == 11)) Resto = 0;
		if (Resto != parseInt(strCPF.substring(10, 11))) return false;
		return true;
	}

}
