import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileDataDto } from 'src/app/model/files/fileDataDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-file-display',
  templateUrl: './file-display.component.html',
  styleUrls: ['./file-display.component.scss']
})
export class FileDisplayComponent implements OnInit {
  @Output() reload: EventEmitter<void> = new EventEmitter<void>();
  @Input() fileData: FileDataDto[];
  @Input() userUUID: string;
  @Input() folder: string;
  @Input() showDeleteButton: boolean;
  @Input() length: number;
  selectedFile: FileDataDto;
  index: number = 0;

  constructor(
    private authenticationService: AuthenticationService,
    private fileStorageService: FileStorageService,
    private toast: ToastService) { }

  ngOnInit(): void {
  }

  deleteFile(fileName: string): void {
    if (!confirm(`Chcesz usunąć plik ${fileName}?`))
      return;

    if (!this.folder) return;

    this.fileStorageService.deleteFile(this.folder, fileName).subscribe(() => {
      this.reload.emit();
    }, (error: any) => this.toast.onError(error.error.message));
  }

  clickFile(idx: number): void {
    this.index = idx;
    this.selectedFile = this.fileData[this.index];
  }

  closeLightbox(): void {
    this.selectedFile = undefined;
  }

  previous(): void {
    if (this.index === 0) return;

    this.index--;
    this.selectedFile = this.fileData[this.index];
  }

  next(): void {
    if (this.index === this.fileData.length - 1) return;

    this.index++;
    this.selectedFile = this.fileData[this.index];
  }

  _isLoggedUser(): boolean {
    return this.authenticationService.isTheSameId(this.userUUID);
  }
}
