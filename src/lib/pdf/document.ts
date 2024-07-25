import {
  getDocument,
  GlobalWorkerOptions,
  OnProgressParameters,
  PDFDocumentProxy,
} from "pdfjs-dist";
// @ts-expect-error Vite Worker
import PDFWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url&inline";
import { RefProxy } from "pdfjs-dist/types/src/display/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * General setup for pdf.js
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
GlobalWorkerOptions.workerSrc = PDFWorker;

/**
 * Load a document
 */
export interface usePDFDocumentParams {
  /**
   * The URL of the PDF file to load.
   */
  fileURL: string;
}

export const usePDFDocumentContext = ({ fileURL }: usePDFDocumentParams) => {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const pdfDocumentProxy = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    setReady(false);
    setProgress(0);

    const loadingTask = getDocument(fileURL);

    loadingTask.onProgress = (progressEvent: OnProgressParameters) => {
      // Added to dedupe state updates when the file is fully loaded
      if (progressEvent.loaded === progressEvent.total) {
        return;
      }

      setProgress(progressEvent.loaded / progressEvent.total);
    };

    loadingTask.promise.then(
      (proxy) => {
        pdfDocumentProxy.current = proxy;
        setProgress(1);
        setReady(true);
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error("Error loading PDF document", error);
      },
    );

    return () => {
      void loadingTask.destroy();
    };
  }, [fileURL]);

  const getDocumentProxy = useCallback(() => {
    if (!pdfDocumentProxy.current) {
      throw new Error("PDF document not loaded");
    }

    return pdfDocumentProxy.current;
  }, [pdfDocumentProxy.current]);

  return {
    context: {
      get pdfDocumentProxy() {
        return getDocumentProxy();
      },
      async getDestinationPage(dest: string | unknown[] | Promise<unknown[]>) {
        let explicitDest: unknown[] | null;

        if (typeof dest === "string") {
          explicitDest = await getDocumentProxy().getDestination(dest);
        } else if (Array.isArray(dest)) {
          explicitDest = dest;
        } else {
          explicitDest = await dest;
        }

        if (!explicitDest) {
          return;
        }

        const explicitRef = explicitDest[0] as RefProxy;

        const page = await getDocumentProxy().getPageIndex(explicitRef);

        return page;
      },
      ready,
    } satisfies PDFDocumentContextType,
    ready,
    progress,
    pdfDocumentProxy: pdfDocumentProxy.current,
  };
};

export interface PDFDocumentContextType {
  pdfDocumentProxy: PDFDocumentProxy;
  getDestinationPage: (
    dest: string | unknown[] | Promise<unknown[]>,
  ) => Promise<number | undefined>;
  ready: boolean;
}

export const defaultPDFDocumentContext: PDFDocumentContextType = {
  get pdfDocumentProxy(): PDFDocumentProxy {
    throw new Error("PDF document not loaded");
  },
  getDestinationPage: async () => {
    throw new Error("PDF document not loaded");
  },
  ready: false,
} satisfies PDFDocumentContextType;

export const PDFDocumentContext = createContext(defaultPDFDocumentContext);

export const usePDFDocument = () => {
  return useContext(PDFDocumentContext);
};
