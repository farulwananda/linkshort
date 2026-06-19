import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsView } from '#/components/analytics/AnalyticsView'
import { useSettings } from '#/hooks/useSettings'

export const Route = createFileRoute('/app/analytics')({ component: AnalyticsPage })

function AnalyticsPage() {
  const { settings } = useSettings()
  return <AnalyticsView domain={settings.domain} />
}
