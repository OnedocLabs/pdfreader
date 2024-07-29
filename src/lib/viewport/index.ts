import { useGesture } from "@use-gesture/react";
import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export const useDPR = () => {
  const [dpr, setDPR] = useState(
    !window ? 1 : Math.min(window.devicePixelRatio, 2),
  );

  useEffect(() => {
    if (!window) {
      return;
    }

    const handleDPRChange = () => {
      setDPR(window.devicePixelRatio);
    };

    const windowMatch = window.matchMedia(
      `screen and (min-resolution: ${dpr}dppx)`,
    );

    windowMatch.addEventListener("change", handleDPRChange);

    return () => {
      windowMatch.removeEventListener("change", handleDPRChange);
    };
  }, []);

  return dpr;
};

export const useVisibility = ({
  elementRef,
}: {
  elementRef: RefObject<HTMLElement>;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef.current]);

  return { visible };
};

export interface ViewportContextType {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  translateX: number;
  setTranslateX: (
    translateX: number | ((prevTranslateX: number) => number),
  ) => void;
  translateY: number;
  setTranslateY: (
    translateY: number | ((prevTranslateY: number) => number),
  ) => void;
  pages: Map<number, { containerRef: RefObject<HTMLDivElement> }>;
  visiblePages: Map<number, number>;
  setPageRef: (
    pageNumber: number,
    containerRef: RefObject<HTMLDivElement>,
  ) => void;
  setPageVisible: (pageNumber: number, percentageVisible: number) => void;
  currentPage: number;
  goToPage: (
    pageNumber: number,
    options?: {
      smooth?: boolean;
    },
  ) => boolean;
  setViewportRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const defaultViewportContext = {
  zoom: 1,
  minZoom: 0.5,
  maxZoom: 10,
  setZoom: () => {
    throw new Error("Viewport context not initialized");
  },
  translateX: 0,
  setTranslateX: () => {
    throw new Error("Viewport context not initialized");
  },
  translateY: 0,
  setTranslateY: () => {
    throw new Error("Viewport context not initialized");
  },
  pages: new Map(),
  visiblePages: new Map(),
  currentPage: 1,
  setPageRef() {
    throw new Error("Viewport context not initialized");
  },
  setPageVisible() {
    throw new Error("Viewport context not initialized");
  },
  goToPage() {
    throw new Error("Viewport context not initialized");
  },
  setViewportRef() {
    throw new Error("Viewport context not initialized");
  },
} satisfies ViewportContextType;

export const ViewportContext = createContext<ViewportContextType>(
  defaultViewportContext,
);

interface ViewportProps {
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const useViewportContext = ({
  minZoom = 0.5,
  maxZoom = 5,
  defaultZoom = 1,
}: ViewportProps) => {
  const [zoom, setZoom] = useState(defaultZoom);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const pages = useRef(
    new Map<number, { containerRef: RefObject<HTMLDivElement> }>(),
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [visiblePages, setVisiblePages] = useState(new Map<number, number>());

  const [currentPage, setCurrentPage] = useState(1);

  return {
    zoom,
    minZoom,
    maxZoom,
    setZoom: (zoom) => {
      setZoom((prevZoom) => {
        if (typeof zoom === "function") {
          return clamp(zoom(prevZoom), minZoom, maxZoom);
        }
        return clamp(zoom, minZoom, maxZoom);
      });
    },
    translateX,
    setTranslateX,
    translateY,
    setTranslateY,
    pages: pages.current,
    visiblePages: visiblePages,
    setPageRef: (pageNumber, containerRef) => {
      pages.current.set(pageNumber, { containerRef });
    },
    setPageVisible: (pageNumber, percentageVisible) => {
      setVisiblePages((prevVisiblePages) => {
        const newVisiblePages = new Map(prevVisiblePages);
        newVisiblePages.set(pageNumber, percentageVisible);

        const newCurrentPage = Math.min(
          ...[...newVisiblePages]
            .filter(([, visibility]) => visibility > 0)
            .map(([pageNumber]) => pageNumber),
        );

        setCurrentPage(newCurrentPage);

        return newVisiblePages;
      });
    },
    currentPage,
    goToPage: (
      pageNumber: number,
      { smooth } = {
        smooth: true,
      },
    ) => {
      const pageRef = pages.current.get(pageNumber);

      if (pageRef && viewportRef.current) {
        const viewportRefRect = viewportRef.current.getBoundingClientRect();
        const pageRefRect =
          pageRef.containerRef.current!.getBoundingClientRect();

        // TODO: use scroll properties
        /* pageRef.containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        }); */

        viewportRef.current.scrollTo({
          top: Math.ceil(
            viewportRef.current.scrollTop +
              pageRefRect.top -
              viewportRefRect.top,
          ),
          left: Math.ceil(
            viewportRef.current.scrollLeft +
              pageRefRect.left -
              viewportRefRect.left,
          ),
          behavior: smooth ? "smooth" : "auto",
        });

        return true;
      }

      return false;
    },
    setViewportRef: (ref) => {
      viewportRef.current = ref.current;
    },
  } satisfies ViewportContextType;
};

export const useViewport = () => {
  return useContext(ViewportContext);
};

export const useSize = () => {
  const [, setReady] = useState(false);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const ref = useRef<HTMLDivElement>(null);

  const updateSize = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { width, height } = ref.current.getBoundingClientRect();

    setSize({ width, height });
    setReady(true);
  }, [ref.current, setSize, setReady]);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(updateSize);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return {
    ref,
    size,
  };
};

const firstMemo = <T>(
  first: boolean,
  memo: unknown,
  initializer: () => T,
): T => {
  if (!first && !memo) {
    throw new Error(
      "Missing memo initialization. You likely forgot to return the result of `firstMemo` in the event function",
    );
  }

  if (first) {
    return initializer();
  }

  return memo! as T;
};

export const useViewportContainer = ({
  containerRef,
  elementWrapperRef,
  elementRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
  elementWrapperRef: RefObject<HTMLDivElement>;
  elementRef: RefObject<HTMLDivElement>;
}) => {
  const [origin, setOrigin] = useState<[number, number]>([0, 0]);

  const { minZoom, maxZoom, setZoom, setViewportRef, zoom } = useViewport();

  useEffect(() => {
    setViewportRef(containerRef);
  }, [containerRef.current]);

  const transformations = useRef<{
    translateX: number;
    translateY: number;
    zoom: number;
  }>({
    translateX: 0,
    translateY: 0,
    zoom: 1,
  });

  const updateTransform = useCallback(() => {
    if (
      !elementRef.current ||
      !containerRef.current ||
      !elementWrapperRef.current
    ) {
      return;
    }

    const { zoom, translateX, translateY } = transformations.current;

    elementRef.current.style.transform = `scale3d(${zoom}, ${zoom}, 1)`;

    const elementBoundingBox = elementRef.current.getBoundingClientRect();

    elementWrapperRef.current.style.width = `${elementBoundingBox.width}px`;
    elementWrapperRef.current.style.height = `${elementBoundingBox.height}px`;

    containerRef.current.scrollTop = translateY;
    containerRef.current.scrollLeft = translateX;

    setZoom(() => transformations.current.zoom);
  }, [containerRef.current, elementRef.current, setZoom, zoom]);

  useEffect(() => {
    if (transformations.current.zoom === zoom || !containerRef.current) {
      return;
    }

    const dZoom = zoom / transformations.current.zoom;

    transformations.current = {
      translateX: containerRef.current.scrollLeft * dZoom,
      translateY: containerRef.current.scrollTop * dZoom,
      zoom,
    };

    updateTransform();
  }, [zoom]);

  useEffect(() => {
    if (!elementRef.current || !elementWrapperRef.current) {
      return;
    }

    const callback = (entries: ResizeObserverEntry[]) => {
      if (!elementRef.current || !elementWrapperRef.current) {
        return;
      }

      const elementBoundingBox = entries[0];

      elementWrapperRef.current.style.width = `${elementBoundingBox.contentRect.width}px`;
      elementWrapperRef.current.style.height = `${elementBoundingBox.contentRect.height}px`;
    };

    const resizeObserver = new ResizeObserver(callback);

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef.current, elementWrapperRef.current]);

  useEffect(() => {
    updateTransform();
  }, []);

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => e.preventDefault();

    // @ts-expect-error Could be null
    document.addEventListener("gesturestart", preventDefault);
    // @ts-expect-error Could be null
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      // @ts-expect-error Could be null
      document.removeEventListener("gesturestart", preventDefault);
      // @ts-expect-error Could be null
      document.removeEventListener("gesturechange", preventDefault);
    };
  });

  useGesture(
    {
      onPinch: ({ origin, first, movement: [ms], memo }) => {
        const newMemo = firstMemo(first, memo, () => {
          const elementRect = elementRef.current!.getBoundingClientRect();
          const containerRect = containerRef.current!.getBoundingClientRect();

          const contentPosition: [number, number] = [
            origin[0] - elementRect.left,
            origin[1] - elementRect.top,
          ];

          const containerPosition: [number, number] = [
            origin[0] - containerRect.left,
            origin[1] - containerRect.top,
          ];

          setOrigin([
            contentPosition[0] / transformations.current.zoom,
            contentPosition[1] / transformations.current.zoom,
          ]);

          return {
            contentPosition,
            containerPosition,
            originZoom: transformations.current.zoom,
            originTranslate: transformations.current.translateY,
          };
        });

        const newZoom = clamp(ms * newMemo.originZoom, minZoom, maxZoom);

        const realMs = newZoom / newMemo.originZoom;

        const newTranslateX =
          newMemo.contentPosition[0] * realMs - newMemo.containerPosition[0];
        const newTranslateY =
          newMemo.contentPosition[1] * realMs - newMemo.containerPosition[1];

        transformations.current = {
          zoom: newZoom,
          translateX: newTranslateX,
          translateY: newTranslateY,
        };

        updateTransform();

        return newMemo;
      },
    },
    {
      target: containerRef,
    },
  );

  return {
    origin,
  };
};

export const usePageViewport = ({
  pageContainerRef,
  pageNumber,
}: {
  pageContainerRef: RefObject<HTMLDivElement>;
  pageNumber: number;
}) => {
  const { visible } = useVisibility({ elementRef: pageContainerRef });

  const { setPageRef, setPageVisible } = useViewport();

  useEffect(() => {
    setPageVisible(pageNumber, visible ? 1 : 0);
  }, [visible, pageNumber]);

  useEffect(() => {
    setPageRef(pageNumber, pageContainerRef);
  }, [pageNumber, pageContainerRef.current]);
};
