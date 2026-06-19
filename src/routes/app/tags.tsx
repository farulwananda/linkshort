import { createFileRoute } from '@tanstack/react-router'
import { TagsView } from '#/components/tags/TagsView'

export const Route = createFileRoute('/app/tags')({ component: TagsPage })

function TagsPage() {
  return <TagsView />
}
