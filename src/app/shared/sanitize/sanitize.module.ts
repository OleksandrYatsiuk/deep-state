import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from './sanitize.pipe';



@NgModule({
  declarations: [SanitizePipe],
  imports: [CommonModule],
  exports: [SanitizePipe]
})
export class SanitizeModule { }
