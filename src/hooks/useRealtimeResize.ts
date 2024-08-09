import { type MutableRefObject, useEffect } from 'react';
import { cardLikeOptions } from '../constants';
import { type layoutOrientation } from '../resourcesTypedef';
import { util } from 'fabric';
import { throttle } from '../utils';
import type { Canvas, StaticCanvas } from 'fabric';

const resizeFunction = (
  fabricCanvas: StaticCanvas | Canvas,
  orientation: layoutOrientation,
  bbox: DOMRectReadOnly,
) => {
  if (fabricCanvas.disposed) {
    console.warn(
      'canvas disposed quickly you should not see this in production',
    );
    return;
  }

  const template = orientation === 'horizontal' ? cardLikeOptions :  {
    width: cardLikeOptions.height,
    height: cardLikeOptions.width,
  };

  const scale = util.findScaleToFit(template, bbox);
  fabricCanvas.setDimensions({
    width: template.width * scale,
    height: template.height * scale,
  });
  fabricCanvas.setZoom(scale);
};

const resizerFunctionCreator = (
  fabricCanvas: StaticCanvas,
  orientation: layoutOrientation,
  throttleMs = 33,
): ResizeObserverCallback =>
  throttle<ResizeObserverCallback>((entries) => {
    const bbox = entries[0].contentRect;
    resizeFunction(fabricCanvas, orientation, bbox);
  }, throttleMs);

type useRealTimeResizeParams = {
  fabricCanvas: StaticCanvas | null | Canvas;
  padderRef: MutableRefObject<HTMLDivElement | null>;
  ready: boolean;
  layout: 'vertical' | 'horizontal';
  throttleMs: number;
};

export const useRealTimeResize = ({
  padderRef,
  fabricCanvas,
  ready,
  layout,
  throttleMs,
}: useRealTimeResizeParams) => {
  useEffect(() => {
    const divRef = padderRef.current;
    // only start observing after mounting is complete.
    if (fabricCanvas && divRef && ready) {
      const callback = resizerFunctionCreator(fabricCanvas, layout, throttleMs);
      const resizeObserver = new ResizeObserver(callback);
      resizeObserver.observe(divRef);
      return () => {
        resizeObserver.unobserve(divRef);
      };
    }
  }, [fabricCanvas, ready, padderRef, layout, throttleMs]);
};
