import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationsPageModule } from './pages/notifications/notifications.module';
import { NotificationInfoPageModule } from './pages/notification-info/notification-info.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrMaskerModule } from 'br-mask';
import { HttpClientModule } from '@angular/common/http';

// FIREBASE
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { PopoverDetailsComponent } from './component/popover-details/popover-details.component';
import { InformCPFComponent } from './component/inform-cpf/inform-cpf.component';
import { FormsModule } from '@angular/forms';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

export const firebaseConfig = {
	apiKey: "AIzaSyD7-ajEWfw3hpsB0aTF4V6p7duJuBRsy4E",
	authDomain: "app-credito-familiar.firebaseapp.com",
	databaseURL: "https://app-credito-familiar.firebaseio.com",
	projectId: "app-credito-familiar",
	storageBucket: "app-credito-familiar.appspot.com",
	messagingSenderId: "133495277331",
	appId: "1:133495277331:web:c37bd204f9c25bed"
};

@NgModule({
	declarations: [AppComponent, PopoverDetailsComponent, InformCPFComponent],
	entryComponents: [PopoverDetailsComponent, InformCPFComponent],
	imports: [
		HttpClientModule,
		BrowserModule.withServerTransition({ appId: 'app-presenca' }),
		IonicModule.forRoot(),
		IonicStorageModule,
		IonicStorageModule.forRoot(),
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
		NotificationInfoPageModule,
		NotificationsPageModule,
		BrMaskerModule, AngularFirestoreModule, AngularFirestoreModule, AngularFireStorageModule,
		AngularFireModule.initializeApp(firebaseConfig),
		AngularFireAuthModule,
		FormsModule
	],
	providers: [
		HttpClientModule,
		{
			provide: RouteReuseStrategy,
			useClass: IonicRouteStrategy
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
