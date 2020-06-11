import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// FIREBASE
// import * as firebase from 'firebase/app';
// import { firebaseConfig } from './app/app.module';
// import 'firebase/auth';
// import 'firebase/messaging';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
// .catch(err => c.onsole.log(err));

// firebase.initializeApp(firebaseConfig);
// firebase.auth().onAuthStateChanged(user => {
//   if (user) {
//   }
//   else {
//     firebase.auth().signInAnonymously();
//   }
// });