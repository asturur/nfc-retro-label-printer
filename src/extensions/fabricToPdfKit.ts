/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FabricImage,
  type FabricObject,
  Group,
  ImageProps,
  Path,
  StaticCanvas,
  util,
  Color,
  Rect,
  TFiller,
  Gradient,
  TMat2D,
  iMatrix
} from 'fabric';

export const createDownloadStream = async (pdfDoc: any): Promise<Blob> => {
  // @ts-expect-error yeah no definitions
  const { default: BlobStream } = await import('blob-stream/blob-stream.js');
  const stream = pdfDoc.pipe(new BlobStream());
  return new Promise((resolve) => {
    stream.on('finish', () => {
      resolve(stream.toBlob('application/pdf'));
    });
  });
};

type box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// const testGradient = (pdfDoc: any) => {
//   const grad = pdfDoc.linearGradient(0, 0, 100, 100);
//   grad.transform = [0.5, 0, 0, 0.5, 30, 10];
//   grad.stop(0, 'red');
//   grad.stop(1, 'green');
//   pdfDoc.rect(0, 0, 100, 100);
//   pdfDoc.fill(grad);
// }

const toPdfColor = (color: string | TFiller, pdfDoc: any, object: FabricObject): any => {
  if (!pdfDoc) {
    return;
  }
  if (
    (color as Gradient<'linear'>).colorStops &&
    (color as Gradient<'linear'>).type === 'linear'
  ) {
    const fabricGrad = color as Gradient<'linear'>;
    const { coords, gradientTransform, offsetX, offsetY, colorStops } = fabricGrad;
    const { x1, y1, x2, y2 } = coords;
    const sortedStops = [...colorStops].sort((a, b) => a.offset - b.offset);
    const grad = pdfDoc.linearGradient(x1, y1, x2, y2);
    const matOffset = [1, 0, 0, 1, offsetX - object.width / 2, offsetY - object.height / 2] as TMat2D;
    grad.transform = util.multiplyTransformMatrixArray([matOffset, gradientTransform ?? iMatrix]);
    sortedStops.forEach(({ color, offset }) => {
      const col = new Color(color as unknown as string);
      grad.stop(offset, col.getSource().slice(0, 3));
    });
    return grad;
  } else {
    const fill = new Color(color as unknown as string);
    return fill.getSource().slice(0, 3);
  }
};

const addRectToPdf = (
  rect: Rect,
  pdfDoc: any,
) => {
  pdfDoc.save();

  transformPdf(rect, pdfDoc);

  const paintStroke = () => {
    if (rect.stroke && rect.stroke !== 'transparent') {
      const stroke = toPdfColor(rect.stroke, pdfDoc, rect);
      pdfDoc.lineWidth(rect.strokeWidth);
      pdfDoc.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
      // pdfDoc.strokeOpacity(this.opacity);
      if (
        rect.strokeDashArray &&
        rect.strokeDashArray[0] !== 0 &&
        rect.strokeDashArray[1] !== 0
      ) {
        pdfDoc.dash(rect.strokeDashArray[0] / rect.scaleX, {
          space: rect.strokeDashArray[1] * rect.strokeWidth,
        });
      }
      pdfDoc.stroke(stroke);
    }
  };

  const paintFill = () => {
    if (rect.fill && rect.fill !== 'transparent') {
      const fill = toPdfColor(rect.fill, pdfDoc, rect);
      // pdfDoc.fillOpacity(this.opacity);
      pdfDoc.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
      pdfDoc.fill(fill);
    }
  };

  if (rect.paintFirst === 'stroke') {
    paintStroke();
    paintFill();
  } else {
    paintFill();
    paintStroke();
  }
  pdfDoc.restore();
};

const addPathToPdf = (
  path: Path,
  pdfDoc: any,
) => {
  pdfDoc.save();
  transformPdf(path, pdfDoc);

  const pathString = util
   .transformPath(path.path, iMatrix, path.pathOffset).map((c) => c.join(' '))
   .join(' ');

  // const pathString = path.path.map((c) => c.join(' ')).join(' ');
    

  if (path.stroke && path.stroke !== 'transparent') {
    const stroke = new Color(path.stroke as string);
    pdfDoc.lineWidth(path.strokeWidth);
    pdfDoc.path(pathString);
    if (
      path.strokeDashArray &&
      path.strokeDashArray[0] !== 0 &&
      path.strokeDashArray[1] !== 0
    ) {
      pdfDoc.dash(path.strokeDashArray[0] * path.strokeWidth, {
        space: path.strokeDashArray[1] * path.strokeWidth,
      });
    }
    pdfDoc.stroke(stroke.getSource().slice(0, 3));
  }
  if (path.fill && path.fill !== 'transparent') {
    const pdfColor = toPdfColor(path.fill, pdfDoc, path);
    pdfDoc.path(pathString);
    pdfDoc.fill(pdfColor);
  }
  pdfDoc.restore();
};

const transformPdf = (fabricObject: FabricObject, pdfDoc: any) => {
  const matrix = fabricObject.calcOwnMatrix();
  pdfDoc.transform(...matrix);
};

const addImageToPdf = async (
  fabricImage: FabricImage<ImageProps>,
  pdfDoc: any,
) => {
  pdfDoc.save();
  transformPdf(fabricImage, pdfDoc);
  const originalSize = fabricImage.getOriginalSize();
  // @ts-expect-error this isn't typed
  const originalFile = fabricImage.originalFile;
  if ((originalFile as File) instanceof File) {
    // @ts-expect-error this isn't typed
    const arrayBuffer = await (fabricImage.originalFile as File).arrayBuffer();
    pdfDoc.image(arrayBuffer, -fabricImage.width / 2, -fabricImage.height / 2, {
      width: originalSize.width,
      height: originalSize.height,
    });
  } else if (originalFile) {
    const imageFetch = await (await fetch(originalFile.src)).arrayBuffer();
    pdfDoc.image(imageFetch, -fabricImage.width / 2, -fabricImage.height / 2, {
      width: originalSize.width,
      height: originalSize.height,
    });
  } else {
    // todo fix
    // images part of the template will likely be duplicated.
    const imageFetch = await (await fetch(fabricImage.getSrc())).arrayBuffer();
    pdfDoc.image(imageFetch, -fabricImage.width / 2, -fabricImage.height / 2, {
      width: originalSize.width,
      height: originalSize.height,
    });
  }
  pdfDoc.restore();
};

const addGroupToPdf = async (
  group: Group,
  pdfDoc: any,
) => {
  pdfDoc.save();
  transformPdf(group, pdfDoc);
  const objs = group.getObjects();
  for ( const object of objs) {
    if (object instanceof Path) {
      addPathToPdf(object, pdfDoc);
    }
    if (object instanceof Rect) {
      addRectToPdf(object, pdfDoc);
    }
    if (object instanceof FabricImage) {
      await addImageToPdf(object, pdfDoc);
    }
  }
  pdfDoc.restore();
};

export const addCanvasToPdfPage = async (
  canvas: StaticCanvas,
  pdfDoc: any,
  box: box,
  needsRotation: boolean,
) => {
  // translate to position.
  // skip background color, but draw the clip region

  pdfDoc.roundedRect(box.x, box.y, box.width, box.height, 8);
  pdfDoc.lineWidth(0.2);
  pdfDoc.stroke('black');

  pdfDoc.save();
  pdfDoc.roundedRect(box.x, box.y, box.width, box.height, 8).clip();
  // 0.24 is a scale factor between px and points to keep the 300dpi
  pdfDoc.transform(0.24, 0, 0, 0.24, box.x, box.y);
  if (needsRotation) {
    pdfDoc.transform(1, 0, 0, 1, box.width / 2 / 0.24, box.height / 2 / 0.24);
    pdfDoc.rotate(90);
    pdfDoc.transform(1, 0, 0, 1, -box.height / 2 / 0.24, -box.width / 2 / 0.24);
  }

  if (canvas.backgroundImage instanceof Group) {
    await addGroupToPdf(canvas.backgroundImage, pdfDoc);
  } else {
    // add it as an image.
  }

  const mainImage = canvas.getObjects('image')[0] as FabricImage;
  await addImageToPdf(mainImage, pdfDoc);

  if (canvas.overlayImage instanceof Group) {
    await addGroupToPdf(canvas.overlayImage, pdfDoc);
  } else {
    // add it as an image.
  }

  pdfDoc.restore();
};
