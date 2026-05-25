import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GoogleAd } from './Component/google-ad/google-ad';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GoogleAd, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
}
