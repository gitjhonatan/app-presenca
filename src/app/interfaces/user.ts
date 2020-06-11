import { CreditData } from './margin-api'
import { Contract } from './contracts'

export interface IUser {
	name?: string
	cpf?: string
	email?: string
	phoneNumber?: string
	token_push?: string
	source?: string
	indicator?: string[]
	installed?: boolean
	firebase_uid?: string
	platform?: Array<string>
	credit_data?: CreditData
	contract_data?: Contract[]
	consultor?: string
	value_available?: IValueAvailable
	user_did_chat?: boolean
	simulation_infos?: ISimulationInfos
	timeUpdated?: Date
	requestCounter?: number
}

export interface IValueAvailable {
	valueFloat: number
	valueText: string
}

export class ISimulationInfos {
	profile: 'Aposentado'
		| 'Pensionista'
		| 'Forças armadas'
		| 'Servidor público'
		| 'Funcionário CLT/Estagiário'
		| 'Empresário ou autônomo' = null
	category: string = null
	sub_category: string = null
	money_needed: number = 500
	income: number = 500
	birth: string = null
	hasLoans: boolean
	activeLoans: Array<{ number: number, text: string }> = []
	valueAvailable: number = 0

	constructor() { }
}

export class IDebitInfos {
	name: string = null
	cpf: string = null
	firebase_uid: string = null
	dateRequest: Date = new Date()
	files: IFiles
	datecheck: Date

	constructor(user?: IUser) {
		if (user) {
			this.name = user.name
			this.cpf = user.cpf
			this.firebase_uid = user.firebase_uid
		}
	}
}

interface IFiles {
	statement1: File
	statemen2: File
	extract1: File
	extract2: File
}

interface File {
	file?: File
	sended: boolean
	url?: string
}