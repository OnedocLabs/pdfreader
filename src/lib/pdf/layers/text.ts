import { TextLayer } from "pdfjs-dist";
import { useEffect, useRef } from "react";

import { usePDFPage } from "../page";

export const useTextLayer = () => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const { pdfPageProxy } = usePDFPage();

  useEffect(() => {
    if (!textContainerRef.current) {
      return;
    }

    const textLayer = new TextLayer({
      textContentSource: pdfPageProxy.streamTextContent(),
      container: textContainerRef.current,
      viewport: pdfPageProxy.getViewport({ scale: 1 }),
    });

    void textLayer.render();

    return () => {
      textLayer.cancel();
    };
  }, [pdfPageProxy, textContainerRef.current]);

  return {
    textContainerRef,
  };
};
