import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from 'src/app/model/userDto';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-alien-profile',
  templateUrl: './alien-profile.component.html',
  styleUrls: ['./alien-profile.component.scss']
})
export class AlienProfileComponent implements OnInit {
  user: UserDto;
  folders: string[] = [];
  userUUID: string;

  constructor(
    private route: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.userUUID = this.route.snapshot.paramMap.get('uuid');
    this.getUser();
    this.getFolders(this.userUUID);
  }

  getUser(): void {
    this.userService.getUserByUUID(this.userUUID).subscribe(data => this.user = data);
  }

  getFolders(uuid: string) {
    this.fileStorageService.getFolders(uuid).subscribe(data => {
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
      this.router.navigate(['/user', 'starter', 'profile', this.userUUID]));
  }

}
