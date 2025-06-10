
import React, { createContext, useContext, useState } from 'react';
import { AppContextType, Category, Item, ShoppingListItem } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Alimentos' },
    { id: '2', name: 'Bebidas' },
    { id: '3', name: 'Limpeza' }
  ]);
  
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Arroz', categoryId: '1', unit: 'kg' },
    { id: '2', name: 'Feijão', categoryId: '1', unit: 'kg' },
    { id: '3', name: 'Água', categoryId: '2', unit: 'L' },
    { id: '4', name: 'Detergente', categoryId: '3', unit: 'ml' }
  ]);
  
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const editCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setItems(prev => prev.filter(item => item.categoryId !== id));
  };

  const addItem = (name: string, categoryId: string, unit?: string) => {
    const newItem: Item = {
      id: Date.now().toString(),
      name,
      categoryId,
      unit
    };
    setItems(prev => [...prev, newItem]);
  };

  const editItem = (id: string, name: string, categoryId: string, unit?: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, name, categoryId, unit } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setShoppingList(prev => prev.filter(listItem => listItem.itemId !== id));
  };

  const addToShoppingList = (itemId: string, quantity: number, unitPrice?: number) => {
    const existingItem = shoppingList.find(item => item.itemId === itemId);
    if (existingItem) {
      updateShoppingListItem(existingItem.id, quantity, unitPrice);
    } else {
      const newShoppingListItem: ShoppingListItem = {
        id: Date.now().toString(),
        itemId,
        quantity,
        unitPrice
      };
      setShoppingList(prev => [...prev, newShoppingListItem]);
    }
  };

  const updateShoppingListItem = (id: string, quantity: number, unitPrice?: number) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, quantity, unitPrice } : item
    ));
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const value: AppContextType = {
    categories,
    items,
    shoppingList,
    addCategory,
    editCategory,
    deleteCategory,
    addItem,
    editItem,
    deleteItem,
    addToShoppingList,
    updateShoppingListItem,
    removeFromShoppingList,
    clearShoppingList
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
