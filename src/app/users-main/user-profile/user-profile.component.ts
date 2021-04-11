import { Component, OnInit } from '@angular/core';
import { FileStorageService } from 'src/app/services/file-storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(private fileStorageService: FileStorageService) { }

  ngOnInit(): void {
    this.fileStorageService.getFolders().subscribe(data => console.log(data));
  }

}
