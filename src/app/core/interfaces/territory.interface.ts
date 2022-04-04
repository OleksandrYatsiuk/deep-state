export interface TerritoryVersion {
    name: string;
    coords: number[][];
    styles: { [x: string]: string },
}

export interface Territory {
    id: string;
    details: TerritoryVersion;
    updatedAt: Date;
    createdAt: Date;
}

export interface CreateTerritory extends Omit<TerritoryVersion, 'id'> { }
export interface UpdateTerritory extends CreateTerritory { }