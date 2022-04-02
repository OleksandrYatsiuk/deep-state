import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

type SanitizeContent = 'html' | 'resource';

@Pipe({
  name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) { }

  transform(value: string, type: SanitizeContent): any {
    switch (type) {
      case 'html':
        return this._sanitizer.bypassSecurityTrustHtml(value);
      case 'resource':
        return this._sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        return '';
    }

  }

}
