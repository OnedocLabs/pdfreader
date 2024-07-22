import { usePDFDocument } from "@/lib/pdf/document";
import { cloneElement, ReactElement } from "react";

export const Pages = ({ children }: { children: ReactElement }) => {
  const { pdfDocumentProxy } = usePDFDocument();

  return (
    <>
      {Array.from({ length: pdfDocumentProxy.numPages }).map((_, index) =>
        cloneElement(children, { key: index, pageNumber: index + 1 }),
      )}
    </>
  );
};
