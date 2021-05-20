import { Component, OnInit } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserResponseDto } from 'src/app/model/account/userResponseDto';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userUUID: string;
  user: UserResponseDto;
  folders: string[] = [];
  storage: number;
  isLoading = true;

  constructor(
    private fileStorageService: FileStorageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.route.params.subscribe((param: Params) => {
      this.userUUID = param['uuid'];
      this.userUUID ? this.loadForeignUser() : this.loadLoggedUser();
      this.getFolders();
    });
  }

  loadForeignUser(): void {
    this.userService.getUserByUUID(this.userUUID).subscribe(data => {
      this.user = data;
      this.isLoading = false;
    });
  }

  loadLoggedUser(): void {
    const uuid = this.authenticationService.getLoggedUserId();
    this.userUUID = uuid;
    this.userService.getUserByUUID(uuid).subscribe(data => {
      this.user = data;
      this.isLoading = false;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  getFolders(): void {
    this.fileStorageService.getFolders(this.userUUID).subscribe(data => {
      this.folders = data.map(path => {
        return path.split(environment.folderNameSplitter).reverse()[0];
      });
    }, (error: any) => this.toast.onError(error.error.message));
  }

  onFolderClick(folder: string): void {
    this.router.navigate(['/user', 'starter', 'folder', this.userUUID, folder]);
  }

  createFolder(): void {
    const folderName = window.prompt('Nazwa folderu: ');
    if (!folderName) return;

    this._investigateFolderName(folderName);
    this.fileStorageService.createFolder(folderName).subscribe(() => {
      this._reloadComponent();
    }, (error: any) => this.toast.onError(error.error.message));
  }

  deleteFolder(name: string): void {
    if (confirm('Chcesz usunąć folder ' + name + ' wraz z całą jego zawartością?'))
      this.fileStorageService.deleteFolder(name).subscribe((data: boolean) => {
        this._reloadComponent();
      }, (error: any) => this.toast.onError(error.error.message));
  }

  _investigateFolderName(folderName: string): void {
    if (folderName.includes('/') || folderName.includes('\\')) {
      throw new Error('Nazwa katologu nie może zawierać znaku / ani znaku \\');
    }
  }

  _reloadComponent(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true }).then(() =>
      this.router.navigate(['/user', 'starter', 'user-profile', '']));
  }

  _isLoggedUser(): boolean {
    return this.authenticationService.isTheSameId(this.userUUID);
  }
}
