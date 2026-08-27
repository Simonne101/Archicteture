import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], offset = 140) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY + offset) {
          current = id;
        }
      }
      setActiveId(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offset]);

  return activeId;
}
