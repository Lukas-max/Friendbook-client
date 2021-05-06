import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { UserResponseDto } from 'src/app/model/userResponseDto';
import { BytePackage } from 'src/app/model/bytePackage';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-head',
  templateUrl: './profile-head.component.html',
  styleUrls: ['./profile-head.component.scss']
})
export class ProfileHeadComponent implements OnInit, OnDestroy {
  @Input() user: UserResponseDto;
  lowQualityUrl: string;
  firstLetterOfName: string;
  compressedSubscription: Subscription;
  photo: File;

  constructor(
    private fileStorage: FileStorageService,
    private authenticationService: AuthenticationService,
    private compressService: CompressService,
    private router: Router,
    private zone: NgZone) { }

  ngOnInit(): void {
    this.fileStorage.getProfilePhotoLowQuality(this.user.userUUID).subscribe((data: BytePackage) => this.lowQualityUrl = data.bytes);
    this.compressedSubscription = this.compressService.compressedImageSubject.subscribe((file: File) => this.sendPhoto(file));
    this.firstLetterOfName = this._getFirstLetter();
  }

  selectFile(event: any): void {
    this.photo = event.target.files[0];
  }

  changeProfilePhoto(): void {
    if (!this.photo)
      return;
    this.compressService.compressImage(this.photo, 300, 0.5);
  }

  sendPhoto(file: File): void {
    const form = new FormData();
    form.append('photo', file);
    this.zone.run(() => {
      this.fileStorage.uplodProfilePhoto(form).subscribe(() => {
        this._reloadFolder();
      }, (err: any) => console.error(err));
    })
  }

  deletePhoto() {
    if (confirm('Chcesz usunąć zdjęcie profilowe?'))
      return this.fileStorage.deleteProfilePhoto().subscribe(() => {
        this._reloadFolder();
      }, (err: any) => console.error(err));
  }

  _getFirstLetter(): string {
    return this.user.username[0];
  }

  isOwnerUser(): boolean {
    return this.authenticationService.isTheSameId(this.user.userUUID);
  }

  _reloadFolder(): void {
    this.router.navigate(['/user', 'starter', 'dummy'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/user', 'starter', 'user-profile', '']));
  }

  ngOnDestroy(): void {
    this.compressedSubscription.unsubscribe();
  }
}
