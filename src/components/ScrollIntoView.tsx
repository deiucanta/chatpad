import { ReactNode, useRef, useEffect } from "react";

export function ScrollIntoView({ children }: { children: ReactNode }) {

  // Scroll into view as soon as we appear
  const myRef = useRef(null);
  useEffect(() => {
    myRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div ref={myRef}>
      {children}
    </div>
  );
}
