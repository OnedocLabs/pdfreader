import { cloneElement, ReactElement, ReactNode, useRef } from "react";
import {
  PDFDocumentContext,
  usePDFDocument,
  usePDFDocumentContext,
  type usePDFDocumentParams,
} from "@/lib/pdf/document";
import { PDFPageContext, usePDFPageContext } from "@/lib/pdf/page";
import { useCanvasLayer } from "@/lib/pdf/layers/canvas";
import { useTextLayer } from "@/lib/pdf/layers/text";

import "pdfjs-dist/web/pdf_viewer.css";
import { useAnnotationLayer } from "@/lib/pdf/layers/annotation";
import { ViewportContainer } from "./Viewport";
import {
  usePageViewport,
  useViewport,
  useViewportContext,
  ViewportContext,
} from "@/lib/viewport";
import {
  PDFLinkServiceContext,
  useCreatePDFLinkService,
  usePDFOutline,
} from "@/lib/pdf/links";

const Root = ({
  children,
  fileURL,
}: { children: ReactNode } & usePDFDocumentParams) => {
  const { ready, context, pdfDocumentProxy } = usePDFDocumentContext({
    fileURL,
  });
  const viewportContext = useViewportContext({});
  const linkService = useCreatePDFLinkService(
    pdfDocumentProxy,
    viewportContext,
  );

  return (
    <div className="border">
      {ready ? (
        <PDFDocumentContext.Provider value={context}>
          <ViewportContext.Provider value={viewportContext}>
            <PDFLinkServiceContext.Provider value={linkService}>
              {children}
            </PDFLinkServiceContext.Provider>
          </ViewportContext.Provider>
        </PDFDocumentContext.Provider>
      ) : (
        "Loading..."
      )}
    </div>
  );
};

const Controls = () => {
  return <div>Controls</div>;
};

const OutlineItem = ({
  level = 0,
  item,
}: {
  level?: number;
  item: NonNullable<ReturnType<typeof usePDFOutline>>[number];
}) => {
  const { getDestinationPage } = usePDFDocument();
  const { goToPage } = useViewport();

  return (
    <>
      <a
        onClick={async () => {
          if (!item.dest) {
            return;
          }

          const page = await getDestinationPage(item.dest);

          if (!page) {
            return;
          }

          goToPage(page + 1);
        }}
      >
        {item.title}
      </a>
      {item.items && item.items.length > 0 && (
        <div>
          {item.items.map((item) => (
            <OutlineItem level={level + 1} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

const Outline = () => {
  const outline = usePDFOutline();

  return (
    <div>
      {outline &&
        outline.map((item) => <OutlineItem key={item.title} item={item} />)}
    </div>
  );
};

const Debug = () => {
  const { zoom, translateX, translateY, currentPage } = useViewport();

  return (
    <div className="flex">
      <div>zoom: {zoom}</div>
      <div>translateX: {translateX}</div>
      <div>translateY: {translateY}</div>
      <div>Current page: {currentPage}</div>
    </div>
  );
};

const Viewport = ({ children }: { children: ReactNode }) => {
  return (
    <ViewportContainer className="bg-gray-100 h-[700px] overflow-auto">
      {children}
    </ViewportContainer>
  );
};

const Page = ({
  children,
  pageNumber = 1,
}: {
  children: ReactNode;
  pageNumber?: number;
}) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { ready, context } = usePDFPageContext(pageNumber);

  usePageViewport({ pageContainerRef, pageNumber });

  return (
    <PDFPageContext.Provider value={context}>
      <div
        ref={pageContainerRef}
        style={{
          display: ready ? "block" : "none",
        }}
      >
        {ready && (
          <div
            className="shadow-lg rounded-sm m-4 overflow-hidden outline outline-black/5"
            style={
              {
                "--scale-factor": 1,
                position: "relative",
                width: `${context.pdfPageProxy.view[2] - context.pdfPageProxy.view[0]}px`,
                height: `${context.pdfPageProxy.view[3] - context.pdfPageProxy.view[1]}px`,
              } as React.CSSProperties
            }
          >
            {children}
          </div>
        )}
      </div>
    </PDFPageContext.Provider>
  );
};

const Pages = ({ children }: { children: ReactElement }) => {
  const { pdfDocumentProxy } = usePDFDocument();

  return (
    <>
      {Array.from({ length: pdfDocumentProxy.numPages }).map((_, index) =>
        cloneElement(children, { key: index, pageNumber: index + 1 }),
      )}
    </>
  );
};

const TextLayer = () => {
  const { textContainerRef } = useTextLayer();

  return (
    <div
      className="textLayer"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
      ref={textContainerRef}
    />
  );
};

const AnnotationLayer = () => {
  const { annotationLayerRef } = useAnnotationLayer();

  return (
    <div
      className="annotationLayer"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
      ref={annotationLayerRef}
    />
  );
};

const CanvasLayer = () => {
  const { canvasRef } = useCanvasLayer();

  return (
    <canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
      ref={canvasRef}
    />
  );
};

export const Example = ({ fileURL }: { fileURL: string }) => {
  return (
    <Root fileURL={fileURL}>
      <Controls />
      <Debug />
      <Outline />
      <Viewport>
        <Pages>
          <Page>
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  );
};
