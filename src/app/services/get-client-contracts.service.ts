import { Injectable } from '@angular/core';
import { Contract } from '../interfaces/contracts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IUser } from '../interfaces/user';
import { ManageUser } from './manage-user.service';

@Injectable({
	providedIn: 'root'
})
export class GetClientContractsService {

	constructor(
		public http: HttpClient,
		private user: ManageUser
	) { }

	get(): Promise<Contract[]> {
		return new Promise(resolve => {
			this.user.get().then(user => {
				if (user && user.contract_data)
					resolve(user.contract_data)
				else
					resolve(this.getFromBureau())
			})
		});
	};

	private getFromBureau(): Promise<Contract[]> {
		return new Promise(resolve => {
			this.user.get().then((user: IUser) => {
				if (user && user.cpf) {
					let headers = new HttpHeaders;
					headers = headers.append('Authorization', '');
					this.http.get(``, { headers }).toPromise().then((data: Contract[]) => {
						this.user.update({ contract_data: data })
						resolve(data);
					}).catch(err => { })
				}
				else resolve();
			});
		});
	}
}
