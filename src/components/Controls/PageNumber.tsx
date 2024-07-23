import { useViewport } from "@/lib/viewport";
import { HTMLProps, useEffect, useRef, useState } from "react";

export const NextPage = () => {};
export const PreviousPage = () => {};
export const CurrentPage = ({ ...props }: HTMLProps<HTMLInputElement>) => {
  const { currentPage, pages, goToPage } = useViewport();
  const [pageNumber, setPageNumber] = useState<string | number>(currentPage);
  const isSelected = useRef<boolean>(false);

  useEffect(() => {
    if (isSelected.current) {
      return;
    }
    setPageNumber(currentPage);
  }, [currentPage, isSelected.current]);

  return (
    <input
      type="number"
      {...props}
      style={{
        ...props.style,
        appearance: "textfield",
        MozAppearance: "textfield",
        WebkitAppearance: "none",
      }}
      value={pageNumber}
      onChange={(e) => {
        setPageNumber(e.target.value);
      }}
      onClick={() => (isSelected.current = true)}
      onBlur={(e) => {
        if (currentPage !== Number(e.target.value)) {
          goToPage(Number(e.target.value), {
            smooth: false,
          });
        }

        isSelected.current = false;
      }}
      onKeyDown={(e) => {
        e.key === "Enter" && e.currentTarget.blur();
      }}
      min={1}
      max={pages.size}
    />
  );
};

export const TotalPages = ({ ...props }: HTMLProps<HTMLDivElement>) => {
  const { pages } = useViewport();

  return <div {...props}>{pages.size}</div>;
};
