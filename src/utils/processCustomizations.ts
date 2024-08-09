import {
  type FabricObject,
  type Group,
  FabricImage,
  util,
  type StaticCanvas,
  type Canvas,
} from 'fabric';
import type { TemplateEdit } from '../resourcesTypedef';


export const findById = (objects: (FabricObject | Group)[], id: string): FabricObject | undefined => {
  let foundObject: FabricObject | undefined;
  for (const object of objects) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((object as any).id === id) {
      foundObject = object;
    }
    if ((object as Group).getObjects) {
      foundObject = findById((object as Group).getObjects(), id);
    }
    if (foundObject) {
      return foundObject;
    }
  }
}

export const processCustomizations = async (canvas: StaticCanvas | Canvas, edits: TemplateEdit[], url?: string): Promise<FabricObject | undefined> => {
  const objects: (FabricObject | Group)[] = ([...canvas.getObjects(), canvas.overlayImage, canvas.backgroundImage] as  (FabricObject | Group)[]).filter((a) => !!a);
  let lastInsertedObject;
  for (const { id, resource } of edits) {
    const fabricObject = findById(objects, id);
    if (fabricObject) {
      if (resource.type === 'image') {
        // load first value
        const image = await FabricImage.fromURL(url || resource.data[0].value);
        const insertTarget = fabricObject.parent || canvas;
        const insertObjects =  insertTarget.getObjects();
        const index = insertObjects.indexOf(fabricObject);
        insertTarget.insertAt(index + 1, image);
        const scale = util.findScaleToFit(image, fabricObject);
        const center = fabricObject.getRelativeCenterPoint();
        image.scale(scale);
        image.setPositionByOrigin(center, 'center', 'center');
        // @ts-expect-error not sure what to do here
        image.resourceFor = id;
        image.canvas = canvas as Canvas;
        insertTarget.set('dirty', true);
        lastInsertedObject = image;
        canvas.requestRenderAll();
      }
    }
  }
  return lastInsertedObject;
}