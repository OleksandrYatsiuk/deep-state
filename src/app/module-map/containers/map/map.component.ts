import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MapService } from 'src/app/core/services/map.service';
import * as L from 'leaflet';
import 'leaflet-editable';
import { TerritoryService } from 'src/app/core/services/territory.service';
import { Territory } from 'src/app/core/interfaces/territory.interface';
import { SafeResourceUrl, Title } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTerritoryDialogComponent } from '../../components/edit-territory-dialog/edit-territory-dialog.component';
import { filter, Observable } from 'rxjs';
import { NominatimService } from 'src/app/core/services/nominatim.service';
import { MessageService } from 'primeng/api';
import { MapVersion } from 'src/app/core/interfaces/geojson.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class MapComponent implements OnInit {
  map: L.Map;
  territories: Territory[];
  display = false;
  displayPosts = false;
  displayInfo = false;
  openVersions = false;

  selectedPolygon: L.Polygon;
  selectedTerritory: Territory
  polygonForEdit: any;

  groups: SafeResourceUrl[];
  form: FormGroup;
  ref: DynamicDialogRef;
  results$: Observable<any[]>;

  constructor(
    private _mapService: MapService,
    private _territoryService: TerritoryService,
    private _cd: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _nominatimService: NominatimService,
    private _title: Title,
    private _messageService: MessageService,
    private _datePipe: DatePipe
  ) { }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.cancelDrawing();
    this._unSelect();
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    this._title.setTitle('DeepStateMAP | Мапа війни в Україні');
    this.map = this._mapService.initMap('map');
    this._initTerritoriesFromGeoJson(1649005166);
  }

  onStartPolygon(): void {

    const polygon = this.map.editTools.startPolygon();

    polygon.addTo(this.map);

    polygon.on('click', ({ target }: { target: L.Polygon }) => {
      const pol: L.Polygon = target;
      this.display = true;
      this.displayPosts = false;
      this.selectedPolygon = pol;
      this.selectedTerritory = null;
      this._cd.detectChanges();
    })
    polygon.on('editable:drawing:end', () => {
      const coordinates = polygon.toGeoJSON().geometry.coordinates[0];

      if (coordinates.length > 2) {
        this.selectedPolygon = polygon;
        this.onEditTerritory(polygon);
      } else {
        polygon.remove();
      }

      this._cd.detectChanges();
    });
  }


  onEditTerritory(polygon: L.Polygon, territory?: Territory): void {
    this.ref = this._dialogService.open(EditTerritoryDialogComponent, {
      header: territory ? 'Редагувати територію' : 'Додати територію',
      closeOnEscape: false,
      width: '350px',
      data: { polygon, territory }
    })
    this.ref.onClose.pipe(filter(result => result)).subscribe((territory: Territory) => {
      polygon.disableEdit();
      polygon.setStyle(territory.styles);
      polygon.bindTooltip(territory.name);

      this._messageService.add({ severity: 'success', detail: 'Оновлення території було успішним!' })
      this._unSelect();
      this._cd.detectChanges();
    });
  }

  search({ query }: { query: string }): void {
    this.results$ = this._nominatimService.querySearch({ q: query });
  }

  onSelectCity({ lat, lon }: { lat: string, lon: string }): void {
    this.map.setView(new L.LatLng(+lat, +lon), this.map.getZoom(), { animate: true });
  }

  onEditPolygon(polygon: L.Polygon): void {
    polygon.enableEdit();
  }

  showPosts(): void {
    this.displayPosts = !this.displayPosts;
    this.display = false;
  }

  showAllPosts(): void {
    this._unSelect();
    this.showPosts();
  }

  showVersions(): void {
    this.openVersions = !this.openVersions;
  }

  showInfo(): void {
    this.displayInfo = !this.displayInfo;
  }

  removeTerritory(): void {
    if (this.selectedTerritory) {
      this._territoryService.queryTerritoryDelete(this.selectedTerritory.id)
        .subscribe(() => {
          this.selectedPolygon.remove();
          this._unSelect();
          this.display = false;
          this._messageService.add({ severity: 'success', detail: 'Видалення території було успішним!' })
          this._cd.detectChanges();
        });
    }
  }

  cancelDrawing(): void {
    this.map.editTools.stopDrawing();
  }

  onChangeVersion(version: MapVersion): void {
    this.openVersions = false;
    this._removePolygons();
    this._initTerritoriesFromGeoJson(version.id);
    this._messageService.add({
      severity: 'success',
      summary: `Версія від ${this._datePipe.transform(version.datetime, 'short')} активована!`,
      detail: version.description || ''
    })
  }

  private _unSelect(): void {
    this.selectedPolygon = null;
    this.selectedTerritory = null;
  }

  private _initTerritoriesFromGeoJson(version = 1): void {
    this._territoryService.queryGeoJsonVersion(version).subscribe((data: any) => {
      data.geoJSON = data.geoJSON.features.filter(g => g.geometry.type === 'Polygon' || g.geometry.type === 'GeometryCollection');
      const geojson = L.geoJSON<L.Polygon>(data.geoJSON).addTo(this.map);

      geojson.eachLayer((polygon: L.Polygon) => {
        const properties = polygon.feature.properties;
        const fill = properties.fill;
        const name = properties.name;
        polygon.setStyle({ color: fill })
        polygon.bindTooltip(name);

        polygon.on('click', ({ target }: { target: L.Polygon }) => {
          const pol: L.Polygon = target;
          this.display = true;
          this.displayPosts = false;
          this.selectedPolygon = pol;
          this.selectedTerritory = null;
          this._cd.detectChanges();
        })

      })

    })
  }

  private _removePolygons(): void {
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        layer.remove();
      }
    })
  }

  private _initTerritoriesFromDataBase(): void {
    this._territoryService.queryTerritories().subscribe(territories => {
      this._initTerritories(territories);
      this._cd.detectChanges();
    });
  }

  private _initTerritories(territories: Territory[]): void {
    territories.forEach(t => {
      t.coords = t.coords.map(c => c.reverse());
      const polygon = L.polygon(t.coords as any);
      if (Object.keys(t.styles).length) {
        polygon.setStyle(t.styles);
      }

      polygon.bindTooltip(t.name);

      polygon.addTo(this.map);

      polygon.on('click', ({ target }: { target: L.Polygon }) => {
        const pol: L.Polygon = target;
        this.display = true;
        this.displayPosts = false;
        this.selectedTerritory = t;
        this.selectedPolygon = pol;
        this._cd.detectChanges();

      })

      polygon.on('mouseover', ({ target }: { target: L.Polygon }) => {
        this._cd.detectChanges();
      })

    })
  }
}
