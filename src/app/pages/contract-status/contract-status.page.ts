import { Component, OnInit } from '@angular/core';
import { GetClientContractsService } from 'src/app/services/get-client-contracts.service';
import { Storage } from '@ionic/storage';
import { IUser } from 'src/app/interfaces/user';
import { Contract } from 'src/app/interfaces/contracts';
import { ManageUser } from 'src/app/services/manage-user.service';

@Component({
	selector: 'app-contract-status',
	templateUrl: './contract-status.page.html',
	styleUrls: ['./contract-status.page.scss'],
})
export class ContractStatusPage implements OnInit {

	contractsData: Contract[] = [];
	expanded: number;

	constructor(
		private contractService: GetClientContractsService,
		private user: ManageUser
	) { }

	ngOnInit() {
		this.contractService.get().then(contracts => {
			if (contracts) {
				this.contractsData = contracts;
				for (const contract of this.contractsData) {
					contract.collapsed = true
				}
			}
		})
	}

	public currency(number: number): string {
		if (number)
			return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
		else
			return "R$ 0,00"
	}

	expandThis(p: Contract, i?: number) {
		if (p.collapsed)
			p.collapsed = false
		else
			p.collapsed = true

		if (this.expanded != undefined && this.expanded != i)
			this.contractsData[this.expanded].collapsed = true

		this.expanded = i
	}

}
