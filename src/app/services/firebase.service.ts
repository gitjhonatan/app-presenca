import * as firebase from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'

import { Injectable } from '@angular/core'
import { AngularFireStorageReference } from '@angular/fire/storage/ref'
import { AngularFireStorage } from '@angular/fire/storage'
import { Storage } from '@ionic/storage'

let auth: firebase.auth.Auth = null
let db: firebase.firestore.Firestore = null
let ref: AngularFireStorageReference = null

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {

	currentUser: firebase.User

	constructor(
		private fireAuth: AngularFireAuth,
		private fireStore: AngularFirestore,
		private fireStorage: AngularFireStorage,
		private storage: Storage
	) {
		auth = this.fireAuth.auth
		db = this.fireStore.firestore
		try {
			ref = this.fireStorage.ref('/')
		} catch (er) { }
		this.saveCurrentUser()
	}

	private saveCurrentUser() {
		auth.onAuthStateChanged(user => {
			this.currentUser = user
		})
	}

	signOut() {
		auth.signOut()
	}

	setAuthLanguage() {
		auth.useDeviceLanguage()
	}

	signInWithPopup(provider: firebase.auth.AuthProvider): Promise<firebase.auth.UserCredential> {
		return new Promise((resolve, reject) => {
			auth.signInWithPopup(provider).then(result => {
				resolve(result)
			}).catch(er => {
				reject(er)
			})
		})
	}

	sendSignInLinkToEmail(email: string, actionCodeSettings: firebase.auth.ActionCodeSettings): Promise<void> {
		return new Promise((resolve, reject) => {
			auth.sendSignInLinkToEmail(email, actionCodeSettings).then(result => {
				resolve(result)
			}).catch(er => {
				reject(er)
			})
		})
	}

	signInWithEmailLink(email: string): Promise<firebase.auth.UserCredential> {
		return new Promise((resolve, reject) => {
			auth.signInWithEmailLink(email).then(result => {
				resolve(result)
			}).catch(er => {
				reject(er)
			})
		})
	}

	existPath(collection: string, doc: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			db.collection(collection).doc(doc).get().then(response => {
				resolve(response.exists)
			}).catch(er => {
				reject(er)
			})
		})
	}

	sendFile(file: File, folder: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const fileName = `${this.currentUser ? this.currentUser.uid + ' - ' : ''}${file.name}`
			let path: AngularFireStorageReference = ref.child(folder + '/' + fileName)

			path.put(file).then(snapshot => {
				snapshot.ref.getDownloadURL().then(url => {
					resolve(url)
				}).catch(er => {
					reject(er)
				})
			})
		})
	}

	saveDataInFirebase(data: any, collection: string, doc?: string): Promise<null> {
		return new Promise((resolve, reject) => {
			const database = db.collection(collection)
			let document: firebase.firestore.DocumentReference
			if (doc)
				document = database.doc(doc)
			else
				document = database.doc()
			document.set(Object.assign({}, data), {
				merge: true
			}).then(() => {
				resolve()
			}).catch(er => {
				reject(er)
			})
		})
	}

	getDataFromFirebase(collection: string, doc: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const database = db.collection(collection)
			let document: firebase.firestore.DocumentReference
			document = database.doc(doc)
			document.get().then(snapshot => {
				const data = snapshot.data()
				this.storage.set('creditoFamiliarUser', data)
				resolve(data)
			}).catch(er => { reject(er) })
		})
	}
}
