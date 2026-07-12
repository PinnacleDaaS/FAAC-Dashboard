import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "FAAC & IGR Dashboard — Nigeria State Allocation",
  description:
    "Interactive dashboard for Federation Account Allocation Committee (FAAC) disbursements and Internally Generated Revenue (IGR) across Nigerian states.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TooltipProvider delay={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
