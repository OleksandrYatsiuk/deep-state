export interface Territory {
    id: string;
    name: string;
    coords: number[][];
    styles: { [x: string]: string },
    updatedAt: Date;
    createdAt: Date;
}

export interface CreateTerritory extends Omit<Territory, 'id'> { }
export interface UpdateTerritory extends CreateTerritory { }