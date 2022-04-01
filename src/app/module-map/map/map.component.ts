import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MapService } from 'src/app/core/services/map.service';
import * as L from 'leaflet';
import 'leaflet-editable';
import { TerritoryService } from 'src/app/core/services/territory.service';
import { Territory } from 'src/app/core/interfaces/territory.interface';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  constructor(
    private _mapService: MapService,
    private _territoryService: TerritoryService,
    private _cd: ChangeDetectorRef,
    private _domSanitizer: DomSanitizer,
    private _formBuilder: FormBuilder
  ) { }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.map.editTools.stopDrawing();
    this.selectedPolygon = null;
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    this._territoryService.queryTerritories().subscribe(territories => {
      this.map = this._mapService.initMap('map');
      this._initTerritories(territories);
      this._cd.detectChanges();
    });
  }

  onStartPolygon(): void {

    const polygon = this.map.editTools.startPolygon();

    polygon.addTo(this.map);

    polygon.on('editable:drawing:cancel', (e) => {
    })

    polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
      const pol: L.Polygon = target;
      const coords = pol.toGeoJSON().geometry.coordinates[0];

      pol.setStyle({ color: 'green' });
      pol.enableEdit();

      this._initForm(coords as any);
      this.polygonForEdit = polygon;
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
        this._cd.detectChanges();

      })
      polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
        const pol: L.Polygon = target;

        const coords = pol.toGeoJSON().geometry.coordinates;

        this.selectedPolygon = t;
        this._initForm(coords as any);
        this._cd.detectChanges();

      })
    })
  }

  safe(code: string): SafeHtml {
    const url = this._domSanitizer.bypassSecurityTrustResourceUrl(`https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/${code}&tabs=timeline&height=500&width=400px&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&hide_cta=true`);
    return url;
  }

  transform(url: string): SafeHtml {
    return this._domSanitizer.bypassSecurityTrustResourceUrl(url)
  }

  onSavePolygon(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this._territoryService.queryCreateTerritory(this.form.value)
        .subscribe();
    }
  }

  private _initForm(coords: number[][]): void {

    this.form = this._formBuilder.group({
      name: ['', []],
      coords: [coords, []],
      styles: [{}, []]
    })
  }

}
