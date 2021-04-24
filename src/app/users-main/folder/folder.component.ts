import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  userUUIDEncoded: string;
  folderEncoded: string;
  fileData: FileDataDto[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private router: Router,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.init();
    this.getFileData();
  }

  init(): void {
    this.activatedRoute.params.subscribe((param: Params) => {
      this.userUUIDEncoded = param['uuid'];
      this.folderEncoded = param['dir'];
    });
  }

  getFileData(): void {
    this.fileStorageService.getFileData(this.userUUIDEncoded, this.folderEncoded).subscribe(data => {
      this.fileData = data;
    });
  }

  return(): void {
    const uuid = atob(this.userUUIDEncoded);
    const isLoggedUser = this.authenticationService.isTheSameId(uuid);
    if (isLoggedUser)
      this.router.navigate(['/user', 'starter', 'user-profile', '']);
    else
      this.router.navigate(['/user', 'starter', 'user-profile', uuid]);
  }

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.userUUIDEncoded, this.folderEncoded]));
  }

  _isLoggedUser() {
    const uuid = atob(this.userUUIDEncoded);
    return this.authenticationService.isTheSameId(uuid);
  }
}
