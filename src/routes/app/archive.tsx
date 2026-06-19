import { createFileRoute } from '@tanstack/react-router'
import { LinkListView } from '#/components/links/LinkListView'
import { useSettings } from '#/hooks/useSettings'

export const Route = createFileRoute('/app/archive')({ component: ArchivePage })

function ArchivePage() {
  const { settings } = useSettings()
  return <LinkListView domain={settings.domain} lockToArchived />
}
