export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  capacity?: number
}

export interface Category {
  id: string
  name: string
  items: ChecklistItem[]
}

export interface SavedChecklist {
  id: string
  name: string
  categories: Category[]
  updatedAt: string
}

// Type guard for ChecklistItem
export function isChecklistItem(item: unknown): item is ChecklistItem {
  if (!item || typeof item !== 'object') return false
  const i = item as Record<string, unknown>
  return (
    typeof i.id === 'string' &&
    typeof i.text === 'string' &&
    typeof i.checked === 'boolean' &&
    (i.capacity === undefined || typeof i.capacity === 'number')
  )
}

// Type guard for Category
export function isCategory(category: unknown): category is Category {
  if (!category || typeof category !== 'object') return false
  const c = category as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    Array.isArray(c.items) &&
    c.items.every((item: unknown) => isChecklistItem(item))
  )
}

// Type guard for SavedChecklist
export function isSavedChecklist(checklist: unknown): checklist is SavedChecklist {
  if (!checklist || typeof checklist !== 'object') return false
  const c = checklist as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    Array.isArray(c.categories) &&
    c.categories.every((category: unknown) => isCategory(category)) &&
    typeof c.updatedAt === 'string'
  )
} 