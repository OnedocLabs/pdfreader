import { usePDFDocument } from "@/lib/pdf/document";
import {
  cloneElement,
  HTMLProps,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Primitive } from "../Primitive";
import { useThumbnail } from "@/lib/pdf/thumbnail";
import { useViewport } from "@/lib/viewport";

export const Thumbnail = ({
  pageNumber = 1,
  ...props
}: HTMLProps<HTMLCanvasElement> & { pageNumber?: number }) => {
  const { canvasRef } = useThumbnail(pageNumber);
  const { goToPage } = useViewport();

  useEffect(() => {});

  return (
    <Primitive.canvas
      {...props}
      role="button"
      tabIndex={0}
      onClick={(e: any) => {
        if (props.onClick) {
          props.onClick(e);
        }

        goToPage(pageNumber, { smooth: false });
      }}
      onKeyDown={(e: any) => {
        if (props.onKeyDown) {
          props.onKeyDown(e);
        }

        if (e.key === "Enter") {
          goToPage(pageNumber, { smooth: false });
        }
      }}
      ref={canvasRef}
    />
  );
};

export const Thumbnails = ({
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactElement<typeof Thumbnail>;
}) => {
  const { pdfDocumentProxy } = usePDFDocument();
  const [pageCount, setPageCount] = useState<number>(0);

  useEffect(() => {
    if (!pdfDocumentProxy) {
      return;
    }

    setPageCount(pdfDocumentProxy.numPages);
  }, [pdfDocumentProxy]);

  return (
    <Primitive.div {...props}>
      {Array.from({
        length: pageCount,
      }).map((_, index) => {
        return cloneElement(children, { key: index, pageNumber: index + 1 });
      })}
    </Primitive.div>
  );
};
