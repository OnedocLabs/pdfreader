import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePDFDocument } from "./document";
import { cancellable } from "./utils";

export const usePDFPageContext = (pageNumber: number) => {
  const { pdfDocumentProxy } = usePDFDocument();
  const [ready, setReady] = useState(false);
  const page = useRef<PDFPageProxy | null>(null);

  useEffect(() => {
    setReady(false);

    if (!pdfDocumentProxy) {
      return;
    }

    const { promise: loadingTask, cancel } = cancellable(
      pdfDocumentProxy.getPage(pageNumber),
    );

    loadingTask.then(
      (pageProxy) => {
        page.current = pageProxy;
        setReady(true);
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error("Error loading PDF page", error);
      },
    );

    return () => {
      cancel();
    };
  }, [pdfDocumentProxy]);

  const getPDFPageProxy = useCallback(() => {
    if (!page.current) {
      throw new Error("PDF page not loaded");
    }

    return page.current;
  }, [page.current]);

  return {
    context: {
      get pdfPageProxy() {
        return getPDFPageProxy();
      },
    },
    ready,
    pdfPageProxy: page.current,
  };
};

export interface PDFPageContextType {
  pdfPageProxy: PDFPageProxy;
}

export const defaultPDFPageContext: PDFPageContextType = {
  get pdfPageProxy(): PDFPageProxy {
    throw new Error("PDF page not loaded");
  },
} satisfies PDFPageContextType;

export const PDFPageContext = createContext(defaultPDFPageContext);

export const usePDFPage = () => {
  return useContext(PDFPageContext);
};
