
export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  unit?: string;
}

export interface ShoppingListItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice?: number;
}

export interface AppContextType {
  categories: Category[];
  items: Item[];
  shoppingList: ShoppingListItem[];
  addCategory: (name: string) => void;
  editCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addItem: (name: string, categoryId: string, unit?: string) => void;
  editItem: (id: string, name: string, categoryId: string, unit?: string) => void;
  deleteItem: (id: string) => void;
  addToShoppingList: (itemId: string, quantity: number, unitPrice?: number) => void;
  updateShoppingListItem: (id: string, quantity: number, unitPrice?: number) => void;
  removeFromShoppingList: (id: string) => void;
  clearShoppingList: () => void;
}
