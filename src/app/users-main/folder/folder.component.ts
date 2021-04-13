import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { Location } from '@angular/common';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {
  userUUID: string;
  folder: string;
  fileData: FileDataDto[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private location: Location) { }

  ngOnInit(): void {
    this.init();
    this.getFileData();
  }

  init() {
    this.userUUID = this.activatedRoute.snapshot.paramMap.get('uuid');
    this.folder = this.activatedRoute.snapshot.paramMap.get('dir');
  }

  getFileData() {
    this.fileStorageService.getFileData(this.userUUID, this.folder).subscribe(data => {
      console.log(data);
      this.fileData = data;
    });
  }

  onClick() {
    this.location.back();
  }
}
