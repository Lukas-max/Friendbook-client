import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileDataDto } from 'src/app/model/fileDataDto';

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
