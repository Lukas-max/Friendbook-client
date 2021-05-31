import { Component, OnInit, Input, OnDestroy, NgZone, AfterViewInit, OnChanges } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { UserResponseDto } from 'src/app/model/account/userResponseDto';
import { BytePackage } from 'src/app/model/data/bytePackage';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CompressService } from 'src/app/services/compress.Service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { CompressType } from 'src/app/model/files/compressType';

@Component({
  selector: 'app-profile-head',
  templateUrl: './profile-head.component.html',
  styleUrls: ['./profile-head.component.scss']
})
export class ProfileHeadComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: UserResponseDto;
  lowQualityUrl: string;
  firstLetterOfName: string;
  compressedImageIconSubscription: Subscription;
  photo: File;

  constructor(
    private fileStorage: FileStorageService,
    private authenticationService: AuthenticationService,
    private compressService: CompressService,
    private router: Router,
    private zone: NgZone,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.subscribeToImageIconCompressor();
    this.firstLetterOfName = this._getFirstLetter();
  }

  ngOnChanges(): void {
    this.loadProfilePhoto();
  }

  loadProfilePhoto(): void {
    this.fileStorage.getProfilePhotoLowQuality(this.user.userUUID).subscribe((data: BytePackage) => this.lowQualityUrl = data.bytes,
      (error: any) => this.toast.onError(error.error.message));
  }

  subscribeToImageIconCompressor(): void {
    this.compressedImageIconSubscription = this.compressService.compressedImageIconSubject.subscribe((file: File) => this.sendPhoto(file),
      (error: any) => this.toast.onError(error.error.message));
  }

  selectFile(event: any): void {
    this.photo = event.target.files[0];
  }

  changeProfilePhoto(): void {
    if (!this.photo)
      return;
    this.compressService.compressImage(this.photo, 300, 0.5, CompressType.IMAGE_ICON);
  }

  sendPhoto(file: File): void {
    const form = new FormData();
    form.append('photo', file);
    this.zone.run(() => {
      this.fileStorage.uplodProfilePhoto(form).subscribe(() => {
        this._reloadFolder();
      }, (error: any) => this.toast.onError(error.error.message));
    })
  }

  deletePhoto(): void {
    if (confirm('Chcesz usunąć zdjęcie profilowe?'))
      this.fileStorage.deleteProfilePhoto().subscribe(() => {
        this._reloadFolder();
      }, (error: any) => this.toast.onError(error.error.message));
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
    this.compressedImageIconSubscription.unsubscribe();
  }
}
