import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { CreditData, ProductsBureau, Product, ICoefficient } from '../interfaces/margin-api'
import { Storage } from '@ionic/storage'
import { IUser, IValueAvailable } from '../interfaces/user'
import { ManageUser } from './manage-user.service'

@Injectable({
	providedIn: 'root'
})
export class GetClientCreditService {

	constructor(
		public http: HttpClient,
		private storage: Storage,
		private user: ManageUser
	) { }

	total(): Promise<number> {
		return new Promise(resolve => {
			this.getData().then(data => {
				if (data) {
					let returnValue = (Math.trunc(data.sum / 10) * 10)
					resolve(returnValue)
				}
				else
					resolve()
			})
		})
	}

	getsepareted(): Promise<{ novo: number, refin: number, mc: number, sum: number }> {
		return new Promise(resolve => {
			this.getData().then(data => {
				let returnData: { novo: number, refin: number, mc: number, sum: number } = {
					novo: 0,
					refin: 0,
					mc: 0,
					sum: 0
				}
				if (data && data.sum > 500)
					data.products.forEach(product => {
						if (product.type === "Margem Complementar")
							returnData.mc += product.value
						else if (product.type === "Novo")
							returnData.novo += product.value
						else if (product.type === "Refin")
							returnData.refin += product.value
						returnData.sum += product.value
					})
				resolve(returnData)
			})
		})
	}

	getData(): Promise<CreditData> {
		return new Promise(resolve => {
			this.storage.get('creditoFamiliarUser').then((user: IUser) => {
				if (user && user.credit_data)
					resolve(user.credit_data)
				else
					resolve(this.getFromBureau())
			})
		})
	}

	private getFromBureau(): Promise<CreditData> {
		return new Promise(resolve => {
			this.user.get().then((user: IUser) => {
				if (user ? user.cpf : user)
					this.http.get('' + (user.cpf).replace(/[^0-9]+/g, '')).toPromise().then((data: ProductsBureau) => { //url privada omitida
						let infos = new CreditData(data)
						// this.storage.set('value_available', this.calcMax(infos.products))
						this.user.update({ "credit_data": Object.assign({}, infos), "value_available": this.calcMax(infos.products) })
						resolve(infos)
					}).catch(err => {

						resolve(this.simulateCredit())
					})
				else resolve(this.simulateCredit())
			})
		})
	}

	private getCoefficient(): Promise<ICoefficient> {
		return new Promise(resolve => {
			this.storage.get('coefficient').then((result: ICoefficient) => {
				let date = new Date()
				if (result) {
					if ((date.getTime() - result.date.getTime()) < 8.64e+7) {
						resolve(result)
						return
					}
				}
				this.http.get('').subscribe({ //url privada omitida
					next: (value: ProductsBureau) => {
						const product = value.availableProducts.find(value => { return value.type == "Novo" })
						if (product)
							var coefficients = product.coefficients.filter(coefficient => { return coefficient.installments == 84 })
						if (coefficients)
							var coefficientValue = <number>Math.max.apply(Math, coefficients.map((o) => { return o.value }))
						if (coefficientValue)
							var coefficientObj = product.coefficients.find(Ocoefficient => { return Ocoefficient.value == coefficientValue })
						if (coefficientObj)
							var bank = coefficientObj.bankDescription
						const coefficient: ICoefficient = {
							value: coefficientValue,
							bank,
							date
						}
						this.storage.set('coefficient', coefficient).then(result => {
							resolve(result)
						})
					}
				})
			})
		})
	}

	private simulateCredit(): Promise<CreditData> {
		return new Promise((resolve, reject) => {
			this.user.get().then(user => {
				if (!user) {
					resolve()
					return
				}
				const simulation_infos = user.simulation_infos

				if (simulation_infos) {

					let discounts = 0
					simulation_infos.activeLoans.forEach(loan => {
						discounts += loan.number
					})
					let margin = simulation_infos.income * 0.3
					margin = margin - discounts
					this.getCoefficient().then(coefficient => {

						const valueAvailable = margin / coefficient.value || 0

						simulation_infos.valueAvailable = valueAvailable
						const product: ProductsBureau = {
							availableProducts: [
								{
									type: "Novo",
									coefficients: [
										{
											installmentValue: valueAvailable / 84,
											installments: 84,
											interest: 0,
											receivedValue: valueAvailable
										}
									]
								}
							]
						}
						const creditData = new CreditData(product)
						this.user.update({ simulation_infos, value_available: this.calcMax(creditData.products) })
						resolve(creditData)
					})
				}
				else {
					resolve()
				}
			}).catch(er => { reject(er) })
		})
	}

	private calcMax(products: Product[]): IValueAvailable {
		if (products) {
			var total = 0
			for (let i = 0; i < products.length; i++) {
				total += products[i].value
			}
		}
		return { valueFloat: total, valueText: this.currency(total) }
	}

	private currency(number: number): string {
		if (number)
			return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
		else
			return "R$ 0,00"
	}
}