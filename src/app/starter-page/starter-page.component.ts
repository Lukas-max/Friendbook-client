import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-starter-page',
  templateUrl: './starter-page.component.html',
  styleUrls: ['./starter-page.component.scss']
})
export class StarterPageComponent implements OnInit {
  @ViewChild('loginForm') form: NgForm;
  registerAttempt: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }


  register() {
    this.registerAttempt = true;
  }

  closeRegisterWindow() {
    this.registerAttempt = false;
  }
}
