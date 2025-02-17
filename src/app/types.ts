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
