import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAdsService {
  private scriptLoading?: Promise<void>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  get enabled(): boolean {
    return environment.googleAds.enabled
      && !environment.googleAds.client.includes('REPLACE')
      && isPlatformBrowser(this.platformId);
  }

  load(): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve();
    }

    if (this.scriptLoading) {
      return this.scriptLoading;
    }

    this.scriptLoading = new Promise((resolve, reject) => {
      const existingScript = this.document.querySelector<HTMLScriptElement>(
        'script[data-google-adsense="true"]'
      );

      if (existingScript) {
        resolve();
        return;
      }

      const script = this.document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset['googleAdsense'] = 'true';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${environment.googleAds.client}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google AdSense script failed to load.'));

      this.document.head.appendChild(script);
    });

    return this.scriptLoading;
  }

  async renderAd(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await this.load();
    const ads = (globalThis as { adsbygoogle?: unknown[] }).adsbygoogle ?? [];
    ads.push({});
    (globalThis as { adsbygoogle?: unknown[] }).adsbygoogle = ads;
  }
}
