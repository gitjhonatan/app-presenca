// IMPORTS
import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { IAirtable } from '../interfaces/airtable'
import { IUser, ISimulationInfos, IDebitInfos } from '../interfaces/user'
import { Storage } from '@ionic/storage'
import { Platform } from '@ionic/angular'

// FIREBASE CONTROLLER
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/messaging'
import { FirebaseService } from './firebase.service'

@Injectable({
	providedIn: 'root'
})
export class ManageUser {

	// Declarando a key do Airtable
	public airtableAuth: string = ""
	private variablesAirtable: Array<string> = [
		'name',
		'cpf',
		'phone',
		'firebase_uid',
		'installed',
		'user_did_chat',
		'token_push',
		'source',
		'requestCounter',
		'indicator'
	]

	constructor(
		private http: HttpClient,
		private storage: Storage,
		private platform: Platform,
		private fire: FirebaseService
	) { }

	/** Função para atualizar os dados do usuário */
	update(newData: IUser, options: { firebase?: boolean, force?: boolean, airtable?: boolean } = {}): Promise<any> {
		// update(newData: IUser, force: boolean = false): Promise<IUser> {

		return new Promise((resolve, reject) => {

			if (newData.name)
				newData.name = this.sanitizeName(newData.name)

			// Getting old data from storage
			this.storage.get('creditoFamiliarUser').then(async (oldData: IUser) => {

				let data: IUser = {}

				if (oldData) {
					Object.assign(data, oldData)

				}

				// Saving firebase uid
				if (this.fire.currentUser)
					data.firebase_uid = this.fire.currentUser.uid

				data.platform = this.platform.platforms()


				Object.assign(data, newData)

				for (const key in data) {
					if (!data[key])
						delete data[key]
				}


				// Safe not-update for equals infos
				if (oldData && options.force != true)
					if (JSON.stringify(oldData) == JSON.stringify(data)) {
						resolve(newData)
						return
					}

				// Saving data to Firebase
				if (data && oldData) {

					if (data.name && data.name != oldData.name)
						try {
							firebase.auth().currentUser.updateProfile({ displayName: data.name })
						} catch{ }

					if (data.email && data.email != oldData.email)
						try {
							firebase.auth().currentUser.updateEmail(data.email)
						} catch{ }

				}

				/** Função para remover as variáveis fixas do Airtable */
				const clean = (obj: IUser) => {
					const result: IUser = {}
					if (obj)
						for (const key of this.variablesAirtable) {
							result[key] = obj[key]
						}
					return result
				}

				// Saving data in airtable
				if (options.airtable != false && (JSON.stringify(clean(data)) != JSON.stringify(clean(oldData))))
					this.storage.get("record_id").then(record_id => {

						if (data.requestCounter)
							data.requestCounter++
						else
							data.requestCounter = 1

						this.sendAirtable(clean(data), record_id).then(dataAirtable => {
							if (dataAirtable && dataAirtable.consultant && (data.consultor != dataAirtable.consultant))
								this.update({ consultor: dataAirtable.consultant })
						})

						resolve(this.saveDataInStorage(data, options))
					})
				else
					resolve(this.saveDataInStorage(data, options))
			})
		})
	}

	saveDataInStorage(data: IUser, options): Promise<IUser> {

		// Saving data in storage
		return new Promise((resolve, reject) => {
			this.storage.set('creditoFamiliarUser', data).then((a) => {
				if (options.firebase != false) {

					this.fire.saveDataInFirebase(data, 'users', data.firebase_uid).then(() => {
						resolve(data)
					}).catch(er => {
						reject(er)
					})
				}
				else
					resolve(data)
			}).catch(er => {
				reject(er)
			})
		})
	}

	sanitizeName(name: string): string {
		name = name.trim()
		var words = name.toLowerCase().split(" ")
		for (var a = 0; a < words.length; a++) {
			var w = words[a]
			words[a] = w[0].toUpperCase() + w.slice(1)
		}
		return words.join(" ")
	}

	get(): Promise<IUser> {
		return new Promise(resolve => {
			this.storage.get('creditoFamiliarUser').then(user => {
				if (user)
					resolve(user)
				else
					firebase.auth().onAuthStateChanged(user => {
						if (user)
							resolve(this.fire.getDataFromFirebase('users', user.uid))
					})
			})
		})
	}

	deleteInfos(): Promise<boolean> {
		return new Promise(resolve => {
			this.storage.remove('creditoFamiliarUser').then(user => {
				resolve(true)
			}).catch(_error => {
				throw new Error("Error trying to delete user infos")
			})
		})
	}

	private sendAirtable(user: IUser, record_id?: string): Promise<any> {

		return new Promise(resolve => {
			var headers = new HttpHeaders
			headers = headers.append('orization', this.airtableAuth)
			headers = headers.append('Content-Type', 'application/json')

			let sendData: IAirtable = {
				records: [
					{
						fields: user
					}
				],
				typecast: true
			}

			if (record_id) {
				sendData.records[0].id = record_id
				this.http.patch("", sendData, { headers }).toPromise().then(data => { //url privada omitida
					let dataSanitized: any = data
					resolve(dataSanitized.records[0].fields)
				}).catch(err => {
					if (err.error.error.type == "ROW_DOES_NOT_EXIST")
						resolve(this.sendAirtable(user))
				})
			}
			else
				this.http.post("", sendData, { headers }).toPromise().then(data => { //url privada omitida
					let dataSanitized: any = data
					this.storage.set("record_id", dataSanitized.records[0].id)
					resolve(dataSanitized.records[0].fields)
				}).catch(err => { })
		})
	}

	saveSimulation(simulation_infos: ISimulationInfos): Promise<null> {
		return new Promise(resolve => {
			this.update({ simulation_infos }).then(() => {
			}).catch(() => { resolve() })
		})
	}

	saveDebitInfos(debit_infos: IDebitInfos) {
		this.storage.set('debit_infos', debit_infos)
		this.fire.saveDataInFirebase(debit_infos, 'debit_requests')
	}

	getSimulation(): Promise<ISimulationInfos> {
		return new Promise(resolve => {
			this.get().then(user => {
				resolve(user.simulation_infos)
			})
			// this.storage.get('simulation_infos').then(result => {
			// 	resolve(result)
			// })
		})
	}
}
