"use client";

import { useSyncExternalStore } from "react";

export type Cart = Record<string, number>;

const storageKey = "dapur-abita-cart";
const changeEvent = "dapur-abita-cart-change";
const orderNoteStorageKey = "dapur-abita-order-note";
const orderNoteChangeEvent = "dapur-abita-order-note-change";

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

function getOrderNoteSnapshot() {
  return window.localStorage.getItem(orderNoteStorageKey) ?? "";
}

function subscribeToOrderNote(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(orderNoteChangeEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(orderNoteChangeEvent, onChange);
  };
}

export function useOrderNote() {
  return useSyncExternalStore(subscribeToOrderNote, getOrderNoteSnapshot, () => "");
}

export function saveOrderNote(note: string) {
  window.localStorage.setItem(orderNoteStorageKey, note);
  window.dispatchEvent(new Event(orderNoteChangeEvent));
}
