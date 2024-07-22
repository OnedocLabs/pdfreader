import {
  AnnotationLayerParams,
  useAnnotationLayer,
} from "@/lib/pdf/layers/annotation";
import { useCanvasLayer } from "@/lib/pdf/layers/canvas";
import { useTextLayer } from "@/lib/pdf/layers/text";
import clsx from "clsx";
import { HTMLProps } from "react";

export const TextLayer = ({
  className,
  style,
  ...props
}: HTMLProps<HTMLDivElement>) => {
  const { textContainerRef } = useTextLayer();

  return (
    <div
      className={clsx("textLayer", className)}
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
      }}
      {...props}
      ref={textContainerRef}
    />
  );
};

export const AnnotationLayer = ({
  renderForms = true,
  className,
  style,
  ...props
}: AnnotationLayerParams & HTMLProps<HTMLDivElement>) => {
  const { annotationLayerRef } = useAnnotationLayer({
    renderForms,
  });

  return (
    <div
      className={clsx("annotationLayer", className)}
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
      }}
      {...props}
      ref={annotationLayerRef}
    />
  );
};

export const CanvasLayer = ({
  style,
  ...props
}: HTMLProps<HTMLCanvasElement>) => {
  const { canvasRef } = useCanvasLayer();

  return (
    <canvas
      style={{
        ...style,
        position: "absolute",
        top: 0,
        left: 0,
      }}
      {...props}
      ref={canvasRef}
    />
  );
};
