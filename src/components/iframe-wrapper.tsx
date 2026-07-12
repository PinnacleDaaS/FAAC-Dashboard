"use client"

import { useEffect, useRef, type ReactNode } from "react"

export default function IframeWrapper({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function sendHeight() {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight
        window.parent.postMessage({ iframeHeight: height }, "*")
      }
    }

    sendHeight()
    const observer = new ResizeObserver(sendHeight)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  return <div ref={containerRef}>{children}</div>
}
