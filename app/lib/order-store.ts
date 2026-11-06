"use client";

import { useSyncExternalStore } from "react";
import type { CustomerOrder } from "@/app/lib/demo-data";

const storageKey = "dapur-abita-demo-orders";
const changeEvent = "dapur-abita-demo-orders-change";

function getSnapshot() {
  return window.localStorage.getItem(storageKey) ?? "[]";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function useLocalOrders() {
  const serializedOrders = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "[]",
  );
  return JSON.parse(serializedOrders) as CustomerOrder[];
}

export function addLocalOrder(order: CustomerOrder) {
  const currentOrders = JSON.parse(
    window.localStorage.getItem(storageKey) ?? "[]",
  ) as CustomerOrder[];
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([order, ...currentOrders]),
  );
  window.dispatchEvent(new Event(changeEvent));
}
