import Image, { type ImageProps } from "next/image"
import React, { useCallback, useEffect, useRef, useState } from "react"
import IconAngleLeft from "../../icons/IconAngleLeft"
import IconAngleRight from "../../icons/IconAngleRight"

type CarouselProps = {
  images: {
    src: ImageProps["src"],
    alt: string,
  }[],
  auto?: number | null,
};

const Carousel: React.FC<CarouselProps> = ({ images, auto = 2000 }) => {
  // Allow the user to scroll to the next/previous image
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<{ from: number, to: number } | null>(null);
  const move = useCallback((direction: "left" | "right") => {
    const { current } = ref;
    if (!current || !current.children[0]) return;

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // Determine the new scroll offset
    let offset = Math.round(current.scrollLeft + (width * (direction === "left" ? -1 : 1)));

    // If we're at the start, scroll to the end
    if (offset < 0) offset = Math.round(current.scrollWidth - current.clientWidth);
    // If we're at the end, scroll back to the start
    else if (offset > current.scrollWidth - current.clientWidth) offset = 0;

    // Bind a scroll listener, so we know when we've reached the new offset
    const listener = () => {
      if (Math.round(current.scrollLeft) === offset) {
        current.removeEventListener("scroll", listener);
        last.current = { from: current.scrollLeft, to: current.scrollLeft };
      }
    };
    current.addEventListener("scroll", listener);

    // Scroll to the new offset
    last.current = { from: Math.min(current.scrollLeft, offset), to: Math.max(current.scrollLeft, offset) }
    current.scrollBy({
      left: offset - current.scrollLeft,
      behavior: "smooth",
    });
  }, []);

  // If the user interacts, we want to pause the auto-scroll for a bit
  const [ paused, setPaused ] = useState(false);
  const pausedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacted = useCallback(() => {
    if (auto) {
      setPaused(true);
      if (pausedTimeout.current) clearTimeout(pausedTimeout.current);
      pausedTimeout.current = setTimeout(() => setPaused(false), auto * 2);
    }
  }, [ auto ]);

  // When we've scrolled, track if we've hit the start or end (and pause auto-scroll if it was the user)
  const [ state, setState ] = useState<"start" | "scrolling" | "end">("start");
  const scrolled = useCallback(() => {
    const { current } = ref;
    if (!current || !current.children[0]) return;

    // Get the width of the first child
    const { width } = current.children[0].getBoundingClientRect();

    // If we've moved the half a width to the left of the last from/to, we've scrolled
    if (last.current && current.scrollLeft < last.current.from - width / 2) interacted();
    if (last.current && current.scrollLeft > last.current.to + width / 2) interacted();

    // Check if we're at the start or end of the scroll
    if (current.scrollLeft === 0) setState("start");
    else if (current.scrollLeft + current.clientWidth === current.scrollWidth) setState("end");
    else setState("scrolling");
  }, [ interacted ]);

  // Run the auto scroll if requested, and not paused
  useEffect(() => {
    if (!auto || paused) return;

    const interval = setInterval(() => {
      if (!ref.current) return;
      move("right");
    }, auto);
    return () => clearInterval(interval);
  }, [ auto, paused, move ]);

  return (
    <div className="flex flex-nowrap">
      <button
        className="flex-shrink-0 p-1 group cursor-pointer disabled:cursor-default"
        type="button"
        onClick={() => { interacted(); move("left"); }}
        disabled={state === "start"}
      >
        <span className="sr-only">Previous</span>
        <IconAngleLeft className="group-disabled:opacity-20 transition-opacity" size={24} />
      </button>

      <div
        className="flex flex-nowrap flex-grow overflow-x-auto snap-mandatory snap-x scrollbar-none"
        ref={ref}
        onScroll={scrolled}
      >
        {images.map((image, index) => (
          <div key={index} className="basis-full md:basis-1/3 flex-shrink-0 p-8 snap-center">
            <Image
              src={image.src}
              alt={image.alt}
              className="w-full h-auto max-w-[10rem] mx-auto"
            />
          </div>
        ))}
      </div>

      <button
        className="flex-shrink-0 p-1 group cursor-pointer disabled:cursor-default"
        type="button"
        onClick={() => { interacted(); move("right"); }}
        disabled={state === "end"}
      >
        <span className="sr-only">Next</span>
        <IconAngleRight className="group-disabled:opacity-20 transition-opacity" size={24} />
      </button>
    </div>
  );
};

export default Carousel;
