import { Component, OnInit } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserResponseDto } from 'src/app/model/userResponseDto';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userUUID: string;
  user: UserResponseDto;
  folders: string[] = [];

  constructor(
    private fileStorageService: FileStorageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private router: Router) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.route.params.subscribe((param: Params) => {
      this.userUUID = param['uuid'];
      this.userUUID ? this.loadForeignUser() : this.loadLoggedUser();
      this.getFolders();
    });
  }

  loadForeignUser() {
    this.userService.getUserByUUID(this.userUUID).subscribe(data => this.user = data);
  }

  loadLoggedUser() {
    const uuid = this.authenticationService.getLoggedUserId();
    this.userUUID = uuid;
    this.userService.getUserByUUID(uuid).subscribe(data => this.user = data);
  }

  getFolders() {
    this.fileStorageService.getFolders(this.userUUID).subscribe(data => {
      this.folders = data.map(path => {
        return path.split('\\').reverse()[0];
      });
    });
  }

  onFolderClick(folder: string) {
    const uuidEncoded = btoa(this.userUUID);
    const folderEncoded = btoa(folder);
    this.router.navigate(['/user', 'starter', 'folder', uuidEncoded, folderEncoded]);
  }

  createFolder() {
    const folderName = window.prompt('Nazwa folderu: ');
    if (!folderName) return;

    this._investigateFolderName(folderName);
    this.fileStorageService.createFolder(folderName).subscribe(() => {
      this._reloadComponent();
    }, (err: any) => {
      console.error(err);
    });
  }

  deleteFolder(name: string) {
    if (confirm('Chcesz usunąć folder ' + name + ' wraz z całą jego zawartością?'))
      this.fileStorageService.deleteFolder(name).subscribe((data: boolean) => {
        if (data) {
          this._reloadComponent();
        }
        else
          console.log("Nie usuneło.")
      }, (error: any) => {
        console.error(error);
      });
  }

  _investigateFolderName(folderName: string) {
    if (folderName.includes('/') || folderName.includes('\\')) {
      throw new Error('Nazwa katologu nie może zawierać znaku / ani znaku \\');
    }
  }

  _reloadComponent() {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true }).then(() =>
      this.router.navigate(['/user', 'starter', 'user-profile', '']));
  }

  _isLoggedUser() {
    return this.authenticationService.isTheSameId(this.userUUID);
  }
}
