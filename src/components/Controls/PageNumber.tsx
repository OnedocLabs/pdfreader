import { useViewport } from "@/lib/viewport";
import { useEffect, useState } from "react";

export const NextPage = () => {};
export const PreviousPage = () => {};
export const CurrentPage = () => {
  const { currentPage, pages, goToPage } = useViewport();
  const [pageNumber, setPageNumber] = useState<string | number>(currentPage);

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  return (
    <input
      type="number"
      style={{
        appearance: "textfield",
        MozAppearance: "textfield",
        WebkitAppearance: "none",
      }}
      value={pageNumber}
      onChange={(e) => {
        if (Number(e.target.value)) {
          goToPage(Number(e.target.value));
        }
      }}
      min={1}
      max={pages.size}
    />
  );
};
