import { OKRProvider } from "@/lib/okr-context"
import { OKRWizard } from "@/components/okr/okr-wizard"

export default function Home() {
  return (
    <OKRProvider>
      <OKRWizard />
    </OKRProvider>
  )
}
