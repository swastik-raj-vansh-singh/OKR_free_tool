import { Screen2EditInvite } from "@/components/okr/screen-2-edit-invite"

export default function EditPage() {
  return (
    <main className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">OKR Autopilot</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Free AI-powered OKR tool that creates alignment and weekly accountability across your team with zero overhead.
          </p>
        </div>

        <Screen2EditInvite />
      </div>
    </main>
  )
}
