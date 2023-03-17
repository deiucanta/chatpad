import { ReactNode } from "react";

export function ScrollIntoView({ children }: { children: ReactNode }) {
  return (
    <div
      ref={(node) => {
        if (!node) return;
        node.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {children}
    </div>
  );
}
