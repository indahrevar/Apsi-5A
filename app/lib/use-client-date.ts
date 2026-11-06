"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getServerSnapshot = () => "";

function getSnapshot() {
  return new Date().toISOString().slice(0, 10);
}

export function useClientDate() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
