export class CreditData {

	products: Product[];
	sum: number;

	constructor(clientData: ProductsBureau) {
		this.products = this.getproducts(clientData);
		this.sum = this.getSum(this.products);
	}

	private getproducts(clientData: ProductsBureau): Product[] {
		let products: Product[] = [];
		clientData.availableProducts.forEach(product => {
			const coefficient = this.getCoefficient(product.coefficients)
			products.push({
				type: product.type,
				value: coefficient.receivedValue,
				installments: coefficient.installments,
				installmentValue: coefficient.installmentValue,
				interest: coefficient.interest
			})
		});
		return products;
	}

	private getSum(products: Product[]): number {
		let sum: number = 0;
		products.forEach(product => {
			sum += product.value;
		});
		if (sum < 500)
			return 0;
		else
			return sum;
	}

	private getCoefficient(coefficients: Coefficient[]): Coefficient {
		coefficients = coefficients.filter(c => { return (c.installments == 84) })
		let result = coefficients[0]
		if (result)
			return result
		else
			return {
				installments:0,
				interest:0,
				receivedValue:0,
				installmentValue:0
			}
	}
}

export interface ICoefficient {
	value: number,
	bank: string,
	date: Date
}

export interface Product {
	type: 'Margem Complementar' | 'Refin' | 'Novo';
	value: number;
	installments: number;
	interest: number;
	installmentValue: number;
}

export interface ProductsBureau {
	name?: string;
	birthDate?: Date;
	cpf?: string;
	zipCode?: string;
	street?: string;
	number?: string;
	district?: string;
	city?: string;
	state?: string;
	complement?: string;
	age?: number;
	availableProducts: AvailableProduct[];
}

interface Coefficient {
	plan?: string;
	productType?: string;
	installments: number;
	interest: number;
	value?: number;
	bankDescription?: string;
	bankCode?: string;
	receivedValue: number;
	totalValue?: number;
	installmentValue: number;
}

interface AvailableProduct {
	benefit?: string;
	benefitValue?: number;
	benefitType?: string;
	benefitTypeDescription?: string;
	firstPayment?: string;
	contractNumber?: string;
	contractInterestRate?: number;
	contractBalanceDue?: number;
	contractInstallments?: number;
	contractPaidInstallments?: number;
	type: 'Margem Complementar' | 'Refin' | 'Novo';
	coefficients: Coefficient[];
}