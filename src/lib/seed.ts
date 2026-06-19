import type { ShortLink, Settings } from './types'

const BASE_TIME = Date.UTC(2026, 4, 1)

function iso(daysAgo: number, hoursAgo = 0): string {
  return new Date(BASE_TIME - daysAgo * 86400000 - hoursAgo * 3600000).toISOString()
}

export const SEED_LINKS: ShortLink[] = [
  {
    id: 'seed-1',
    title: 'Portfolio site',
    slug: 'home',
    destinationUrl: 'https://farul.example.com',
    tags: ['personal', 'web'],
    status: 'active',
    totalClicks: 1284,
    lastClickedAt: iso(0, 3),
    createdAt: iso(28),
    updatedAt: iso(2),
  },
  {
    id: 'seed-2',
    title: 'Launch announcement',
    slug: 'launch',
    destinationUrl: 'https://blog.example.com/introducing-linkshort',
    tags: ['marketing', 'launch'],
    status: 'active',
    totalClicks: 642,
    lastClickedAt: iso(1),
    createdAt: iso(14),
    updatedAt: iso(1),
  },
  {
    id: 'seed-3',
    title: 'Resume PDF',
    slug: 'cv',
    destinationUrl: 'https://drive.example.com/resume.pdf',
    tags: ['personal'],
    status: 'inactive',
    totalClicks: 88,
    lastClickedAt: iso(9),
    createdAt: iso(40),
    updatedAt: iso(9),
  },
  {
    id: 'seed-4',
    title: 'Old promo page',
    slug: 'promo-q1',
    destinationUrl: 'https://example.com/promo-q1',
    tags: ['marketing', 'promo'],
    status: 'archived',
    totalClicks: 312,
    lastClickedAt: iso(60),
    createdAt: iso(90),
    updatedAt: iso(60),
  },
  {
    id: 'seed-5',
    title: 'Newsletter signup',
    slug: 'newsletter',
    destinationUrl: 'https://example.com/subscribe',
    tags: ['marketing', 'email'],
    status: 'active',
    totalClicks: 205,
    lastClickedAt: iso(0, 6),
    createdAt: iso(7),
    updatedAt: iso(0, 6),
  },
]

export const DEFAULT_SETTINGS: Settings = {
  domain: 'yourdomain.com',
  theme: 'light',
}
