import {
  useCallback,
  useRef,
  useState,
  type RefObject,
  type TouchEvent,
} from "react";

type PullToRefreshOptions = {
  enabled: boolean;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
};

export function usePullToRefresh(
  containerRef: RefObject<HTMLElement | null>,
  { enabled, onRefresh, threshold = 80, maxPull = 140 }: PullToRefreshOptions
) {
  const startY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (!enabled || refreshing) return;
      const container = containerRef.current;
      if (container && container.scrollTop > 0) return;
      const touch = event.touches[0];
      if (!touch) return;
      startY.current = touch.clientY;
    },
    [containerRef, enabled, refreshing]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (!enabled || refreshing) return;
      const start = startY.current;
      if (start === null) return;
      const touch = event.touches[0];
      if (!touch) return;
      const delta = touch.clientY - start;
      if (delta <= 0) return;
      setPullDistance(Math.min(delta, maxPull));
    },
    [enabled, refreshing, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || refreshing) {
      setPullDistance(0);
      startY.current = null;
      return;
    }
    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
    startY.current = null;
  }, [enabled, refreshing, pullDistance, threshold, onRefresh]);

  return {
    pullDistance,
    refreshing,
    bind: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
