import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTerritoryDialogComponent } from './edit-territory-dialog.component';

describe('EditTerritoryDialogComponent', () => {
  let component: EditTerritoryDialogComponent;
  let fixture: ComponentFixture<EditTerritoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTerritoryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTerritoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
