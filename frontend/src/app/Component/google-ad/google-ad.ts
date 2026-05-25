import { AfterViewInit, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { GoogleAdsService } from '../../services/google-ads.service';

@Component({
  selector: 'google-ad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-ad.html',
  styleUrl: './google-ad.css'
})
export class GoogleAd implements AfterViewInit {
  @Input() adSlot = environment.googleAds.slots.banner;
  @Input() label = 'Advertisement';

  readonly adClient = environment.googleAds.client;

  constructor(public googleAds: GoogleAdsService) {}

  ngAfterViewInit(): void {
    void this.googleAds.renderAd();
  }
}
