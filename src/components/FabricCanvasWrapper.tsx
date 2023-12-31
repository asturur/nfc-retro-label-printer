import { useRef, useEffect, startTransition } from 'react';
import { cardLikeOptions } from '../constants';
import { Canvas, FabricImage, util, Rect, FabricObject } from 'fabric';
type WrapperProp = {
  file: File;
  setFabricCanvas: (canvas: Canvas | null) => void;
};

export const FabricCanvasWrapper = ({ file, setFabricCanvas }: WrapperProp) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let fabricCanvas: Canvas;
    if (canvasRef.current) {
      FabricObject.ownDefaults.originX = 'center';
      FabricObject.ownDefaults.originY = 'center';
      fabricCanvas = new Canvas(canvasRef.current!, {
        width: cardLikeOptions.width,
        height: cardLikeOptions.height,
      });
      const cardBorder = new Rect(cardLikeOptions);
      cardBorder.canvas = fabricCanvas;
      fabricCanvas.clipPath = cardBorder;
      fabricCanvas.backgroundImage = cardBorder;
      fabricCanvas.centerObject(cardBorder);
      const imageUrl = URL.createObjectURL(file);
      if (file) {
        util.loadImage(imageUrl).then((image) => {
          const fabricImage = new FabricImage(image);
          const scale = util.findScaleToCover(fabricImage, fabricCanvas);
          fabricImage.scaleX = scale;
          fabricImage.scaleY = scale;
          fabricCanvas.add(fabricImage);
          fabricCanvas.centerObject(fabricImage);
          startTransition(() => {
            setFabricCanvas(fabricCanvas);
          });
        });
      }
    }
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [setFabricCanvas, file]);

  return <canvas ref={canvasRef} />;
};
