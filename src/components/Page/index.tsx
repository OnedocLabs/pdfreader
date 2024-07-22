import { usePDFPageContext, PDFPageContext } from "@/lib/pdf/page";
import { usePageViewport } from "@/lib/viewport";
import { HTMLProps, ReactNode, useRef } from "react";
import { Primitive } from "../Primitive";

export const Page = ({
  children,
  pageNumber = 1,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactNode;
  pageNumber?: number;
}) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { ready, context } = usePDFPageContext(pageNumber);

  usePageViewport({ pageContainerRef, pageNumber });

  return (
    <PDFPageContext.Provider value={context}>
      <Primitive.div
        ref={pageContainerRef}
        style={{
          display: ready ? "block" : "none",
        }}
      >
        {ready && (
          <div
            style={
              {
                ...style,
                "--scale-factor": 1,
                position: "relative",
                width: `${context.pdfPageProxy.view[2] - context.pdfPageProxy.view[0]}px`,
                height: `${context.pdfPageProxy.view[3] - context.pdfPageProxy.view[1]}px`,
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        )}
      </Primitive.div>
    </PDFPageContext.Provider>
  );
};
