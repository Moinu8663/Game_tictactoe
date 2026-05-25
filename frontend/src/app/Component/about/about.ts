import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
}
