"use cache"

import type { ReactNode } from 'react'
import { getMenuItems } from '@/lib/data'
import { MenuList } from './menu-list'

/**
 * Server component that caches menu items across requests using the
 * `use cache` directive. It must not call `headers()`/`cookies()` or
 * otherwise access per-request data.
 */
export default async function MenuServerCached(): Promise<ReactNode> {
  const items = await getMenuItems()
  // Render the client `MenuList` with initialItems prop.
  return <MenuList initialItems={items} />
}
