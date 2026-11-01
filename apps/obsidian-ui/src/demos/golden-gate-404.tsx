import { GoldenGate404 } from "@/blocks/golden-gate-404"

export function GoldenGate404Demo() {
  return (
    <div className="h-full w-full pt-10">
      <GoldenGate404 href="#top" linkLabel="Back to top" message="This page drifted out past the Golden Gate." />
    </div>
  )
}
