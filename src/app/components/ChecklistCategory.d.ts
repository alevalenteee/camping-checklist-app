import { Category } from '../types'

interface Props {
  category: Category
  onToggleItem: (categoryId: string, itemId: string) => void
  onEditCategory: (categoryId: string, newName: string) => void
  onDeleteCategory: (categoryId: string) => void
  onAddItem: (categoryId: string, text: string, capacity?: number) => void
  onEditItem: (categoryId: string, itemId: string, newText: string, capacity?: number) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
}

declare function ChecklistCategory(props: Props): JSX.Element

export default ChecklistCategory 