import { useViewportContainer } from "@/lib/viewport";
import { HTMLProps, useRef } from "react";
import { Primitive } from "../Primitive";

export const Viewport = ({ children, ...props }: HTMLProps<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementWrapperRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useViewportContainer({
    elementRef: elementRef,
    elementWrapperRef: elementWrapperRef,
    containerRef: containerRef,
  });

  return (
    <Primitive.div
      ref={containerRef}
      {...props}
      style={{
        display: "flex",
        justifyContent: "center",
        touchAction: "none",
        ...props.style,
        position: "relative",
        overflow: "auto",
      }}
    >
      <div
        ref={elementWrapperRef}
        style={{
          width: "max-content",
        }}
      >
        <div
          ref={elementRef}
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            transformOrigin: "0 0",
            width: "max-content",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </div>
    </Primitive.div>
  );
};
