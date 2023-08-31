import { ReactNode } from "react";

export function ScrollIntoView({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ scrollMarginBottom: 150 }}
      ref={(node) => {
        if (!node) return;
        node.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      }}
    >
      {children}
    </div>
  );
}
