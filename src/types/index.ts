
export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id: string;
  name: string;
  category_id: string;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingListItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_price?: number;
  purchased?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AppContextType {
  categories: Category[];
  items: Item[];
  shoppingList: ShoppingListItem[];
  loading: boolean;
  addCategory: (name: string) => Promise<void>;
  editCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addItem: (name: string, categoryId: string, unit?: string) => Promise<void>;
  editItem: (id: string, name: string, categoryId: string, unit?: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addToShoppingList: (itemId: string, quantity: number, unitPrice?: number) => Promise<void>;
  updateShoppingListItem: (id: string, quantity: number, unitPrice?: number, purchased?: boolean) => Promise<void>;
  removeFromShoppingList: (id: string) => Promise<void>;
  clearShoppingList: () => Promise<void>;
}
