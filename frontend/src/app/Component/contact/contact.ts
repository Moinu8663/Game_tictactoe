import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'contact',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
}
