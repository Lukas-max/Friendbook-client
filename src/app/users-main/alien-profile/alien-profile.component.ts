import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from 'src/app/model/userDto';
import { map } from 'rxjs/operators';
import { FileStorageService } from 'src/app/services/file-storage.service';

@Component({
  selector: 'app-alien-profile',
  templateUrl: './alien-profile.component.html',
  styleUrls: ['./alien-profile.component.scss']
})
export class AlienProfileComponent implements OnInit {
  user: UserDto;
  folders: string[] = [];
  userUUID: string;

  constructor(
    private route: ActivatedRoute,
    private fileStorageService: FileStorageService,
    private router: Router) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.route.paramMap.pipe(map(() => window.history.state.user))
      .subscribe(data => {
        this.user = data;
      });

    this.userUUID = this.route.snapshot.paramMap.get('uuid');
    this.getFolders(this.userUUID);
  }

  getFolders(uuid: string) {
    this.fileStorageService.getFolders(uuid).subscribe(data => {
      this.folders = data.map(path => {
        return path.split('\\').reverse()[0];
      });
    });
  }

  onFolderClick(folder: string) {
    const uuidEncoded = btoa(this.userUUID);
    const folderEncoded = btoa(folder);
    this.router.navigate(['/user', 'starter', 'folder', uuidEncoded, folderEncoded]);
  }

}
