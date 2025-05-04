"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Temporarily disable service worker registration to avoid console errors
    /* 
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("Service Worker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("Service Worker registration failed: ", err)
          },
        )
      })
    }
    */
    
    // Unregister existing service workers to clean up errors
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log("Service worker unregistered to prevent caching errors");
        }
      });
    }
  }, [])

  return null
}
