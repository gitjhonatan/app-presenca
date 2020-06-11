import { IUser } from './user';

/**
 * Interface of a POST request in AIRTABLE
 */
export interface IAirtable {
	records: Array<IFields>;
	typecast: true;
};

interface IFields {
	id?: string;
	fields: IUser;
};

export interface notification_airtable {
	createdTime: Date;
	id: string;
	fields: {
		titulo: string;
		corpo: string;
		imagem: string;
		clique_imagem: string;
	};
}