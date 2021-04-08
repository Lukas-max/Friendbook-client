import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { StarterPageComponent } from './starter-page/starter-page.component';
import { UsersMainComponent } from './users-main/users-main.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './users-main/user-profile/user-profile.component';
import { MainFeedComponent } from './users-main/main-feed/main-feed.component';
import { OptionsComponent } from './users-main/options/options.component';
import { NavbarComponent } from './core/navbar/navbar.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ConfirmRegistrationComponent } from './components/auth/confirm-registration/confirm-registration.component';
import { LoginComponent } from './components/auth/login/login.component';


const routes: Routes = [
  {
    path: 'user/starter', component: UsersMainComponent, children: [
      { path: 'main-feed', component: MainFeedComponent },
      { path: 'user-profile', component: UserProfileComponent },
      { path: 'options', component: OptionsComponent },
    ]
  },
  { path: '', component: StarterPageComponent },
  { path: 'register-verify', component: ConfirmRegistrationComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    StarterPageComponent,
    UsersMainComponent,
    UserProfileComponent,
    MainFeedComponent,
    OptionsComponent,
    NavbarComponent,
    RegisterComponent,
    ConfirmRegistrationComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
