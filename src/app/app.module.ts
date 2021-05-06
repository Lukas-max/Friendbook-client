import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './components/auth/register/register.component';
import { ConfirmRegistrationComponent } from './components/auth/confirm-registration/confirm-registration.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthorizationInterceptor } from './interceptors/authorization.interceptor';
import { FileUploadComponent } from './utils/file-upload/file-upload.component';
import { LightboxViewerComponent } from './utils/lightbox-viewer/lightbox-viewer.component';
import { DummyComponent } from './utils/dummy/dummy.component';
import { FileDisplayComponent } from './utils/file-display/file-display.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersMainComponent } from './components/users-main/users-main.component';
import { MainFeedComponent } from './components/users-main/main-feed/main-feed.component';
import { UserProfileComponent } from './components/users-main/user-profile/user-profile.component';
import { OptionsComponent } from './components/users-main/options/options.component';
import { UserSearchComponent } from './components/users-main/user-search/user-search.component';
import { FolderComponent } from './components/users-main/folder/folder.component';
import { PublicChatComponent } from './components/users-main/public-chat/public-chat.component';
import { StarterPageComponent } from './components/starter-page/starter-page.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ChatWindowComponent } from './components/users-main/chat-window/chat-window.component';
import { OnlineUsersComponent } from './components/users-main/online-users/online-users.component';
import { FeedComponent } from './components/users-main/main-feed/feed/feed.component';
import { CommentsComponent } from './components/users-main/main-feed/feed/comments/comments.component';
import { ProfileHeadComponent } from './components/users-main/user-profile/profile-head/profile-head.component';


const routes: Routes = [
  {
    path: 'user/starter', component: UsersMainComponent, children: [
      { path: 'main-feed', component: MainFeedComponent },
      { path: 'user-profile/:uuid', component: UserProfileComponent },
      { path: 'options', component: OptionsComponent },
      { path: 'user-search', component: UserSearchComponent },
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
    FolderComponent,
    FileUploadComponent,
    LightboxViewerComponent,
    DummyComponent,
    PublicChatComponent,
    ChatWindowComponent,
    OnlineUsersComponent,
    FeedComponent,
    FileDisplayComponent,
    CommentsComponent,
    ProfileHeadComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
