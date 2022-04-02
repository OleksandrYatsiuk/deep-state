import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MapService } from 'src/app/core/services/map.service';
import * as L from 'leaflet';
import 'leaflet-editable';
import { TerritoryService } from 'src/app/core/services/territory.service';
import { Territory } from 'src/app/core/interfaces/territory.interface';
import { SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTerritoryDialogComponent } from '../../components/edit-territory-dialog/edit-territory-dialog.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  map: L.Map;
  territories: Territory[];

  selectedPolygon: Territory;
  polygonForEdit: any;

  fBGroups = ['GeneralStaff.ua', 'EastOC', 'pressOKzahid', 'kommander.nord', 'okPivden']
  groups: SafeResourceUrl[];
  form: FormGroup;
  ref: DynamicDialogRef;

  constructor(
    private _mapService: MapService,
    private _territoryService: TerritoryService,
    private _cd: ChangeDetectorRef,
    private _dialogService: DialogService
  ) { }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.map.editTools.stopDrawing();
    this.selectedPolygon = null;
    this._cd.detectChanges();
  }

  ngOnInit(): void {
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

    polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
      const pol: L.Polygon = target;
      pol.enableEdit();

      this._onEditTerritory(pol);
      this._cd.detectChanges();
    })
  }

  private _initTerritories(territories: Territory[]): void {
    territories.forEach(t => {
      t.coords = t.coords.map(c => c.reverse());


      const polygon = L.polygon(t.coords as any);
      polygon.setStyle(t.styles);

      polygon.addTo(this.map);

      polygon.on('click', ({ target }: L.LeafletMouseEvent) => {
        const pol: L.Polygon = target;
        pol.editEnabled();
        this.selectedPolygon = t;
        this._cd.detectChanges();

      })
      polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
        const pol: L.Polygon = target;
        this._onEditTerritory(pol, t);
        this._cd.detectChanges();
      })
    })
  }

  private _onEditTerritory(polygon: L.Polygon, territory?: Territory): void {
    this.ref = this._dialogService.open(EditTerritoryDialogComponent, {
      header: territory ? 'Редагувати територію' : 'Додати територію',
      closeOnEscape: false,
      width: '350px',
      data: { polygon, territory }
    })
    this.ref.onClose.pipe(filter(result => result)).subscribe();
  }
}
