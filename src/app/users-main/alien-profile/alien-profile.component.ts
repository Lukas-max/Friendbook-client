import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDto } from 'src/app/model/userDto';
import { map } from 'rxjs/operators';
import { FileStorageService } from 'src/app/services/file-storage.service';

@Component({
  selector: 'app-alien-profile',
  templateUrl: './alien-profile.component.html',
  styleUrls: ['./alien-profile.component.scss']
})
export class AlienProfileComponent implements OnInit {
  isUuid: boolean = false;
  user: UserDto;
  folders: string[] = [];

  constructor(private route: ActivatedRoute, private fileStorageService: FileStorageService) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.route.paramMap.pipe(map(() => window.history.state.user))
      .subscribe(data => {
        this.user = data;
      });
    this.isUuid = this.route.snapshot.paramMap.has('uuid');
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.getFolders(uuid);
  }

  getFolders(uuid: string) {
    this.fileStorageService.getFolders(uuid).subscribe(data => {
      this.folders = data.map(path => {
        return path.split('\\').reverse()[0];
      });
    });
  }

}
