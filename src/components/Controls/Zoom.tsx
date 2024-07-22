import { HTMLProps } from "react";
import { Primitive } from "../Primitive";
import { useViewport } from "@/lib/viewport";

export const ZoomIn = ({ ...props }: HTMLProps<HTMLButtonElement>) => {
  const { setZoom } = useViewport();

  return (
    <Primitive.button
      {...props}
      onClick={(e: any) => {
        props.onClick && props.onClick(e);
        setZoom((zoom) => Number((zoom + 0.1).toFixed(1)));
      }}
    />
  );
};

export const ZoomOut = ({ ...props }: HTMLProps<HTMLButtonElement>) => {
  const { setZoom } = useViewport();

  return (
    <Primitive.button
      {...props}
      onClick={(e: any) => {
        props.onClick && props.onClick(e);
        setZoom((zoom) => Number((zoom - 0.1).toFixed(1)));
      }}
    />
  );
};

export const Zoom = ({ ...props }: HTMLProps<HTMLDivElement>) => {
  const { zoom } = useViewport();

  return <Primitive.div {...props}>{(zoom * 100).toFixed(0)}%</Primitive.div>;
};
