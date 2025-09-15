import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const get = () => (typeof window !== "undefined" ? window.innerWidth <= breakpoint : false);
  const [isMobile, setIsMobile] = useState(get());
  
  useEffect(() => {
    const onResize = () => setIsMobile(get());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [breakpoint]);
  
  return isMobile;
}
