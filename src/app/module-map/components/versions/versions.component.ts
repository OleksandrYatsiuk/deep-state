import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MapVersion } from 'src/app/core/interfaces/geojson.interface';
import { TerritoryService } from 'src/app/core/services/territory.service';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss']
})
export class VersionsComponent implements OnInit {
  versions$: Observable<MapVersion[]>;
  selectedVersion: MapVersion;
  @Output() selectVersion = new EventEmitter<MapVersion>();
  constructor(private _territoryServices: TerritoryService) { }

  ngOnInit(): void {
    this.versions$ = this._territoryServices.queryGeoJsonVersions().pipe(
      tap((versions) => {
        this.selectedVersion = versions[0];
      }));
  }

  onSelectVersion(version: MapVersion): void {
    this.selectedVersion = version;
    this.selectVersion.emit(version);

  }
}
