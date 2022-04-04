export interface Feature {
    type: string;
    geometry: {
        coordinates: number[] | number[][][];
        type: string;
    },
    properties: {
        name: string;
        fill: string;
    }
}
export interface GeoJSON {
    type: string;
    features: Feature[];
}


export interface GeoJSONVersion {
    date: Date;
    geoJSON: GeoJSON;
}
export interface MapVersion {
    id: number;
    description: null | string;
    datetime: Date;
}

