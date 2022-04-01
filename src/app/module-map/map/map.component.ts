import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { MapService } from 'src/app/core/services/map.service';
import * as L from 'leaflet';
import 'leaflet-editable';
import { TerritoryService } from 'src/app/core/services/territory.service';
import { Territory } from 'src/app/core/interfaces/territory.interface';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

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

  fBGroups = ['GeneralStaff.ua', 'EastOC', 'pressOKzahid', 'kommander.nord', 'okPivden']
  groups: SafeResourceUrl[];

  constructor(
    private _mapService: MapService,
    private _territoryService: TerritoryService,
    private _cd: ChangeDetectorRef,
    private _domSanitizer: DomSanitizer
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
      // console.log(polygon.toGeoJSON().geometry.coordinates);
    })



    polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
      const pol: L.Polygon = target;
      pol.enableEdit();
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

      })
      polygon.on('dblclick', ({ target }: L.LeafletMouseEvent) => {
        const pol: L.Polygon = target;

        this.selectedPolygon = t;
        this._cd.detectChanges();

      })
    })
  }

  safe(code: string): SafeHtml {
    const url = this._domSanitizer.bypassSecurityTrustResourceUrl(`https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/${code}&tabs=timeline&height=500&width=400px&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&hide_cta=true`);
    return url;
  }

}
