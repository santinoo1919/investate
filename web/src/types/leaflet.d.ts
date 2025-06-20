declare module "leaflet" {
  export * from "@types/leaflet";
}

declare module "react-leaflet" {
  import { Map as LeafletMap, LatLngTuple, Icon } from "leaflet";
  import { ComponentType, ReactNode } from "react";

  export interface MapContainerProps {
    center: LatLngTuple;
    zoom: number;
    scrollWheelZoom?: boolean;
    className?: string;
    children?: ReactNode;
    whenCreated?: (map: LeafletMap) => void;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  export interface MarkerProps {
    position: LatLngTuple;
    icon?: Icon;
    children?: ReactNode;
  }

  export interface PopupProps {
    children?: ReactNode;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Popup: ComponentType<PopupProps>;
}
