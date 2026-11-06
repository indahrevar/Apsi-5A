"use client";

import { useSyncExternalStore } from "react";

export type Cart = Record<string, number>;

const storageKey = "dapur-abita-cart";
const changeEvent = "dapur-abita-cart-change";

function getSnapshot() {
  return window.localStorage.getItem(storageKey) ?? "{}";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}

export function useCart() {
  const serializedCart = useSyncExternalStore(subscribe, getSnapshot, () => "{}");
  return JSON.parse(serializedCart) as Cart;
}

export function saveCart(cart: Cart) {
  window.localStorage.setItem(storageKey, JSON.stringify(cart));
  window.dispatchEvent(new Event(changeEvent));
}
