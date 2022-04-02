import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Polygon } from 'leaflet';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { EPost } from 'src/app/core/enums/post.enum';
import { CreateTerritory, Territory, UpdateTerritory } from 'src/app/core/interfaces/territory.interface';
import { TerritoryService } from 'src/app/core/services/territory.service';

@Component({
  selector: 'app-edit-territory-dialog',
  templateUrl: './edit-territory-dialog.component.html',
  styleUrls: ['./edit-territory-dialog.component.scss']
})
export class EditTerritoryDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _territoryService: TerritoryService,
    private _ref: DynamicDialogRef,
    private _config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this._initForm(this.territory);
  }

  private _initForm(territory?: Territory): void {
    this.form = this._formBuilder.group({
      id: territory?.id,
      name: [territory?.name || '', [Validators.required]],
      coords: [this._getCoordinates(this.polygon), []],
      styles: [territory?.styles || {}, []]
    });

  }

  onSaveTerritory(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this._queryManageTerritory(this.form.value)
        .subscribe(() => this._ref.close(true));
    }
  }

  get territory(): Territory {
    return this._config.data?.territory;
  }

  get polygon(): Polygon {
    return this._config.data?.polygon;
  }

  private _getCoordinates(polygon: Polygon): number[][] {
    const coords = polygon.toGeoJSON().geometry.coordinates[0] as number[][];
    return coords.map(c => c.sort());
  }

  private _queryManageTerritory(data: CreateTerritory | UpdateTerritory): Observable<Territory> {
    if (this.territory) {
      return this._territoryService.queryUpdateTerritory(this.territory.id, data)
    }
    return this._territoryService.queryCreateTerritory(data);
  }

}
