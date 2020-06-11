import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CheckOnboarding } from './services/check-onboarding.service';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/onboarding',
		pathMatch: 'full'
	},
	{
		path: 'onboarding',
		loadChildren: () => import('./pages/onboarding/onboarding.module').then(m => m.OnboardingModule),
		canLoad: [CheckOnboarding]
	},
	{ path: 'notification/:pushId', loadChildren: './pages/notifications/notifications.module#NotificationsPageModule' },
	{ path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
	{ path: 'chat', loadChildren: './pages/chat/chat.module#ChatPageModule' },
	{ path: 'soupresenca', loadChildren: './pages/soupresenca/soupresenca.module#SoupresencaPageModule' },
	{ path: 'update_user_infos', loadChildren: './pages/update-user-infos/update-user-infos.module#UpdateUserInfosPageModule' },
	{ path: 'notification-info', loadChildren: './pages/notification-info/notification-info.module#NotificationInfoPageModule' },
	{ path: 'credit-details', loadChildren: './pages/credit-details/credit-details.module#CreditDetailsPageModule' },
	{ path: 'contract-status', loadChildren: './pages/contract-status/contract-status.module#ContractStatusPageModule' },
	{ path: 'simulator', loadChildren: './pages/simulator/simulator.module#SimulatorPageModule' },
	{ path: 'cameras-ao-vivo', loadChildren: './pages/cameras-ao-vivo/cameras-ao-vivo.module#CamerasAoVivoPageModule' },
	{ path: 'attendance', loadChildren: './pages/chat/attendance/attendance.module#AttendancePageModule' },
	{
		path: 'debito',
		loadChildren: () => import('./pages/debito/debito.module').then(m => m.DebitoPageModule)
	},
	{
		path: 'public-server',
		loadChildren: () => import('./pages/public-server/public-server.module').then(m => m.PublicServerPageModule)
	},  {
    path: 'error',
    loadChildren: () => import('./pages/error/error.module').then( m => m.ErrorPageModule)
  }






];
@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
