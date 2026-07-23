import { useState, useEffect } from "react";

export function useAnimatedMount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}
