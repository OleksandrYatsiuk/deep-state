import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './containers/map/map.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PostComponent } from './components/post/post.component';
import { SanitizeModule } from '../shared/sanitize/sanitize.module';
import { EditTerritoryDialogComponent } from './components/edit-territory-dialog/edit-territory-dialog.component';
import { InputTextModule } from 'primeng/inputtext'
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AddPostDialogComponent } from './components/add-post-dialog/add-post-dialog.component';
import { DialogModule } from 'primeng/dialog';

const routes: Routes = [
  { path: '', component: MapComponent }
]

@NgModule({
  declarations: [
    MapComponent,
    PostComponent,
    EditTerritoryDialogComponent,
    AddPostDialogComponent
  ],
  imports: [
    CommonModule,
    SanitizeModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    AutoCompleteModule,
    DialogModule,
    RouterModule.forChild(routes)
  ]
})
export class MapModule { }
