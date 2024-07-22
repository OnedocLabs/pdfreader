import "pdfjs-dist/web/pdf_viewer.css";
import { Viewport } from "./Viewport";
import { useViewport } from "@/lib/viewport";
import { Root } from "./Root";
import { Page } from "./Page";
import { AnnotationLayer, CanvasLayer, TextLayer } from "./Layers";
import { Outline, OutlineChildItems, OutlineItem } from "./Outline";
import { Pages } from "./Pages";
import { CurrentPage } from "./Controls/PageNumber";
import { useState } from "react";

export const Debug = () => {
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

export const Example = ({ fileURL }: { fileURL: string }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Root fileURL={fileURL} className="m-4 border rounded-xl overflow-hidden">
      <div className="border-b p-3">
        <CurrentPage />
      </div>
      <div className="grid grid-cols-[24rem,1fr] h-[500px] overflow-hidden">
        <Outline className="border-r overflow-auto p-3">
          <OutlineItem className="block">
            <OutlineChildItems className="pl-4" />
          </OutlineItem>
        </Outline>
        <Viewport className="bg-gray-100 py-4">
          <Pages>
            <Page className="shadow-xl m-8 my-4 first:mt-8 outline outline-black/5 rounded-md overflow-hidden">
              <CanvasLayer />
              <TextLayer />
              <AnnotationLayer />
            </Page>
          </Pages>
        </Viewport>
      </div>
    </Root>
  );
};
