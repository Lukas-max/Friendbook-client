import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FileStorageService } from 'src/app/services/file-storage.service';

@Component({
  selector: 'app-file-display',
  templateUrl: './file-display.component.html',
  styleUrls: ['./file-display.component.scss']
})
export class FileDisplayComponent implements OnInit {
  @Output() reload: EventEmitter<void> = new EventEmitter<void>();
  @Input() fileData: FileDataDto[];
  @Input() userUUIDEncoded: string;
  @Input() folderEncoded: string;
  @Input() showDeleteButton: boolean;
  selectedFile: FileDataDto;
  index: number = 0;

  constructor(private authenticationService: AuthenticationService, private fileStorageService: FileStorageService) { }

  ngOnInit(): void {
  }

  deleteFile(fileName: string): void {
    if (!confirm(`Chcesz usunąć plik ${fileName}?`))
      return;

    const folder = atob(this.folderEncoded);
    if (!folder) return;

    this.fileStorageService.deleteFile(folder, fileName).subscribe(() => {
      this.reload.emit();
    }, (error: any) => {
      console.error(error);
    });
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

  _isLoggedUser() {
    const uuid = atob(this.userUUIDEncoded);
    return this.authenticationService.isTheSameId(uuid);
  }
}
