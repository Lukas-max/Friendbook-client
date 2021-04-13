import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { FileDataDto } from 'src/app/model/fileDataDto';
import { Location } from '@angular/common';

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
    private location: Location) { }

  ngOnInit(): void {
    this.init();
    this.getFileData();
  }

  init() {
    this.activatedRoute.params.subscribe((param: Params) => {
      this.userUUIDEncoded = param['uuid'];
      this.folderEncoded = param['dir'];
    });
  }

  getFileData() {
    this.fileStorageService.getFileData(this.userUUIDEncoded, this.folderEncoded).subscribe(data => {
      console.log(data);
      this.fileData = data;
    });
  }

  onClick() {
    this.location.back();
  }
}
