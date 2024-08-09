import { type SerializedGroupProps } from 'fabric';
import type { Authors } from './templateAuthors';

export type templateLayer = {
  url: string;
  /* how large the overlay is */
  layerWidth: number;
  layerHeight: number;
  /* parse the layer as a group rather than raster */
  isSvg: boolean;
  parsed?: Promise<SerializedGroupProps | HTMLImageElement>;
};

export type templateOverlay = templateLayer & {
  /* percentage width where the overlaye transparent area begins */
  x: number;
  /* percentage height where the overlaye transparent area begins */
  y: number;
  /* percentage width that is transparent */
  width: number;
  /* percentage height that is transparent */
  height: number;
};

export enum EditType {
  image = 'image',
  color = 'color',
}

export type ResourceArray = {
  label: string;
  value: string;
}

export type EditResource = {
  type: EditType;
  data: ResourceArray[];
}

export type layoutOrientation = 'horizontal' | 'vertical';

export type TemplateEdit = {
  /* id of the svg Rect placeholder that represent the area of the edit */
  id: string;
  /* one of the valid edit types */
  resource: EditResource;
}

export type templateType = {
  layout: layoutOrientation;
  overlay?: templateOverlay;
  background?: templateLayer;
  label: string;
  /* box-shadow like property for the main image, 3 numbers + color */
  shadow?: string;
  /* if noMargin is true the image you load will cover the full card and bleed outside */
  noMargin?: boolean;
  /* a reference to the author data */
  author: Authors;
  /**
   * if true it means a button to edit the tempalte is shown on screen
   * More data in the template is needed to make that happen.
   * */ 
  canEdit?: boolean;

  edits?: TemplateEdit[];
};