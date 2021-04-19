import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { AuthorizationInterceptor } from './interceptors/authorization.interceptor';
import { UserSearchComponent } from './users-main/user-search/user-search.component';
import { AlienProfileComponent } from './users-main/alien-profile/alien-profile.component';
import { FolderComponent } from './users-main/folder/folder.component';
import { FileUploadComponent } from './utils/file-upload/file-upload.component';
import { LightboxViewerComponent } from './utils/lightbox-viewer/lightbox-viewer.component';
import { DummyComponent } from './utils/dummy/dummy.component';
import { PublicChatComponent } from './users-main/public-chat/public-chat.component';
import { ChatWindowComponent } from './users-main/chat-window/chat-window.component';


const routes: Routes = [
  {
    path: 'user/starter', component: UsersMainComponent, children: [
      { path: 'main-feed', component: MainFeedComponent },
      { path: 'user-profile/:uuid', component: UserProfileComponent },
      { path: 'options', component: OptionsComponent },
      { path: 'user-search', component: UserSearchComponent },
      // { path: 'profile/:uuid', component: AlienProfileComponent },
      { path: 'folder/:uuid/:dir', component: FolderComponent },
      { path: 'dummy', component: DummyComponent },
      { path: 'chat', component: PublicChatComponent },
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
    LoginComponent,
    UserSearchComponent,
    AlienProfileComponent,
    FolderComponent,
    FileUploadComponent,
    LightboxViewerComponent,
    DummyComponent,
    PublicChatComponent,
    ChatWindowComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
