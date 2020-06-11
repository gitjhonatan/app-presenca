export interface Contract {
	number: string;
	saleDate: Date;
	statusDate: Date;
	firstDueDate?: any;
	status: string;
	statusDescription: string;
	bankDescription: string;
	benefitNumber: string;
	total: number;
	receivedValue: number;
	parcelQuantity: number;
	parcelValue: number;
	productType: string;
	interestRate: number;
	collapsed?: boolean;
}
