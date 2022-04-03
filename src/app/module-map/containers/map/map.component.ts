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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  map: L.Map;
  territories: Territory[];
  display = false;
  displayPosts = false;
  displayInfo = false;

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
    private _messageService: MessageService
  ) { }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.cancelDrawing();
    this._unSelect();
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    this._title.setTitle('DeepStateMAP | Мапа війни в Україні');
    this._territoryService.queryTerritories()
      .subscribe(territories => {
        this.map = this._mapService.initMap('map');
        this._initTerritories(territories);
        this._cd.detectChanges();
      });
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

  private _unSelect(): void {
    this.selectedPolygon = null;
    this.selectedTerritory = null;
  }
}
