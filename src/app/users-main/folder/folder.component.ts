import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { Location } from '@angular/common';
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
  selectedFile: FileDataDto;
  index: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private location: Location,
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

  deleteFile(fileName: string): void {
    if (!confirm(`Chcesz usunąć plik ${fileName}?`))
      return;

    const folder = atob(this.folderEncoded);
    if (!folder) return;

    this.fileStorageService.deleteFile(folder, fileName).subscribe(() => {
      this._reloadFolder();
    }, (error: any) => {
      console.error(error);
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

  clickFile(idx: number): void {
    this.index = idx;
    this.selectedFile = this.fileData[this.index];
  }

  closeLightbox() {
    this.selectedFile = undefined;
  }

  previous() {
    if (this.index === 0) return;

    this.index--;
    this.selectedFile = this.fileData[this.index];
  }

  next() {
    if (this.index === this.fileData.length - 1) return;

    this.index++;
    this.selectedFile = this.fileData[this.index];
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
