import { useViewportContainer } from "@/lib/viewport";
import { HTMLProps, useRef } from "react";

export const ViewportContainer = ({
  children,
  ...props
}: HTMLProps<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementWrapperRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { origin } = useViewportContainer({
    elementRef: elementRef,
    elementWrapperRef: elementWrapperRef,
    containerRef: containerRef,
  });

  return (
    <div
      ref={containerRef}
      {...props}
      style={{
        display: "flex",
        justifyContent: "center",
        touchAction: "none",
        ...props.style,
        position: "relative",
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
          <div
            className="hidden w-2 h-2 bg-red-400 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: origin[1],
              left: origin[0],
            }}
          ></div>
          {children}
        </div>
      </div>
    </div>
  );
};
