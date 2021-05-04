import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Chunk } from 'src/app/model/chunk';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit, AfterViewInit {
  @ViewChild('observed', { read: ElementRef }) element: ElementRef;
  userUUID: string;
  folder: string;
  fileData: FileDataDto[] = [];
  limit = 10;
  offset = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private intersector: IntersectionObserverService) { }

  ngOnInit(): void {
    this.getUserParams();
  }

  ngAfterViewInit(): void {
    this.getFileData();
  }

  getUserParams(): void {
    this.activatedRoute.params.subscribe((param: Params) => {
      this.userUUID = param['uuid'];
      this.folder = param['dir'];
    });
  }

  getFileData(): void {
    this.intersector.createAndObserve(this.element).pipe(
      filter((isIntersecting: boolean) => isIntersecting),
      switchMap(() => this.fileStorageService.getFileData(this.userUUID, this.folder, this.limit.toString(), this.offset.toString()))
    ).subscribe((chunk: Chunk<FileDataDto>) => {
      chunk.content.forEach((file: FileDataDto) => this.fileData.push(file));
      this.offset = this.fileData.length;
    });
  }

  return(): void {
    const isLoggedUser = this.authenticationService.isTheSameId(this.userUUID);
    if (isLoggedUser)
      this.router.navigate(['/user', 'starter', 'user-profile', '']);
    else
      this.router.navigate(['/user', 'starter', 'user-profile', this.userUUID]);
  }

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'folder', this.userUUID, this.folder]));
  }

  _isLoggedUser() {
    return this.authenticationService.isTheSameId(this.userUUID);
  }
}
