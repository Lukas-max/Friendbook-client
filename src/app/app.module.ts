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
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { UserOptionsComponent } from './components/auth/user-options/user-options.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FooterComponent } from './footer/footer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { TimePipe } from './utils/time.pipe';
import { ForeignUserGuard } from './utils/guards/foreignUser.guard';
import { DummyComponent } from './utils/components/dummy/dummy.component';
import { LoggedUserGuard } from './utils/guards/loggedUser.guard';
import { FileUploadComponent } from './utils/components/file-upload/file-upload.component';
import { LightboxViewerComponent } from './utils/components/lightbox-viewer/lightbox-viewer.component';
import { FileDisplayComponent } from './utils/components/file-display/file-display.component';
import { SpinnerComponent } from './utils/components/spinner/spinner.component';
import { AuthorizationInterceptor } from './utils/interceptors/authorization.interceptor';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { YouTubePlayerModule } from "@angular/youtube-player";
import { PublicChatCommentComponent } from './components/users-main/public-chat/public-chat-comment/public-chat-comment.component';
import { PrivateChatCommentComponent } from './components/users-main/chat-window/private-chat-comment/private-chat-comment.component';

const routes: Routes = [
  {
    path: 'user/starter', component: UsersMainComponent, canActivate: [ForeignUserGuard], children: [
      { path: 'main-feed', component: MainFeedComponent },
      { path: 'user-profile/:uuid', component: UserProfileComponent },
      { path: 'options', component: OptionsComponent },
      { path: 'user-search', component: UserSearchComponent },
      { path: 'folder/:uuid/:dir', component: FolderComponent },
      { path: 'dummy', component: DummyComponent },
      { path: 'chat', component: PublicChatComponent },
      { path: 'login/:value', component: LoginComponent },
      { path: 'change', component: UserOptionsComponent }
    ]
  },
  { path: '', component: StarterPageComponent, canActivate: [LoggedUserGuard] },
  { path: 'register-verify', component: ConfirmRegistrationComponent },
  { path: 'reset', component: ResetPasswordComponent, canActivate: [LoggedUserGuard] },
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
    ProfileHeadComponent,
    ResetPasswordComponent,
    UserOptionsComponent,
    SpinnerComponent,
    FooterComponent,
    TimePipe,
    PublicChatCommentComponent,
    PrivateChatCommentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    YouTubePlayerModule,
    NgxLinkifyjsModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
