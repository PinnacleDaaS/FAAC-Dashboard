interface DashboardFooterProps {
  dateLabel: string
}

export default function DashboardFooter({ dateLabel }: DashboardFooterProps) {
  return (
    <footer className="border-t border-border py-6 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-[11px] italic text-muted-foreground/70">
          NB: IGR data is available up to 2024; allocation figures are current as of {dateLabel}.
        </p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground text-center">
          <span>Data Updated: {dateLabel}</span>
          <span className="text-border">|</span>
          <span>Sources: NBS, FAAC, OAGF</span>
          <span className="text-border">|</span>
          <span>Dashboard by <span className="font-medium text-foreground">Joshua Akintayo</span></span>
        </div>
      </div>
    </footer>
  )
}
