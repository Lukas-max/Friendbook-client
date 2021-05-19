import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileDataDto } from 'src/app/model/files/fileDataDto';

@Component({
  selector: 'app-lightbox-viewer',
  templateUrl: './lightbox-viewer.component.html',
  styleUrls: ['./lightbox-viewer.component.scss']
})
export class LightboxViewerComponent implements OnInit {
  @Input() selectedFile: FileDataDto;
  @Output() closeLightbox = new EventEmitter<void>();
  @Output() previousFile = new EventEmitter<void>();
  @Output() nextFile = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' || event.code === 'Enter' || event.code === 'KeyW') {
        this.closeLightbox.emit();
      }

      if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
        this.previousFile.emit();
      }

      if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        this.nextFile.emit();
      }
    });
  }

  onClose() {
    this.closeLightbox.emit();
  }

  onArrowLeft() {
    this.previousFile.emit();
  }

  onArrowRight() {
    this.nextFile.emit();
  }

}
