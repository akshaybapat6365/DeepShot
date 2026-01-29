import { useMemo, useState } from "react";

import type { Protocol } from "@/hooks/useProtocols";

export function useProtocolLayers(protocols: Protocol[]) {
  const [hiddenProtocols, setHiddenProtocols] = useState<Record<string, boolean>>(
    {}
  );

  const protocolsClean = useMemo(
    () => protocols.filter((protocol) => !protocol.isTrashed),
    [protocols]
  );

  const trashedProtocols = useMemo(
    () => protocols.filter((protocol) => protocol.isTrashed),
    [protocols]
  );

  const visibleProtocols = useMemo(() => {
    const map: Record<string, boolean> = {};
    protocolsClean.forEach((protocol) => {
      map[protocol.id] = !hiddenProtocols[protocol.id];
    });
    return map;
  }, [protocolsClean, hiddenProtocols]);

  const orderedProtocols = useMemo(() => {
    const active = protocolsClean.filter((protocol) => protocol.isActive);
    const rest = protocolsClean
      .filter((protocol) => !protocol.isActive)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return [...active, ...rest];
  }, [protocolsClean]);

  const protocolLookup = useMemo(() => {
    const map = new Map<string, Protocol>();
    protocolsClean.forEach((protocol) => {
      map.set(protocol.id, protocol);
    });
    return map;
  }, [protocolsClean]);

  const activeProtocol = useMemo(
    () => orderedProtocols.find((protocol) => protocol.isActive) ?? null,
    [orderedProtocols]
  );

  const toggleProtocolVisibility = (protocolId: string) => {
    setHiddenProtocols((prev) => {
      const next = { ...prev };
      if (next[protocolId]) {
        delete next[protocolId];
      } else {
        next[protocolId] = true;
      }
      return next;
    });
  };

  return {
    protocolsClean,
    trashedProtocols,
    visibleProtocols,
    orderedProtocols,
    protocolLookup,
    activeProtocol,
    toggleProtocolVisibility,
  };
}
