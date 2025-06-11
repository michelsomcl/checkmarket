
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Category, Item, ShoppingListItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadItems(),
        loadShoppingList()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao carregar categorias:', error);
      return;
    }

    setCategories(data || []);
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao carregar itens:', error);
      return;
    }

    setItems(data || []);
  };

  const loadShoppingList = async () => {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Erro ao carregar lista de compras:', error);
      return;
    }

    setShoppingList(data || []);
  };

  const addCategory = async (name: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }

    setCategories(prev => [...prev, data]);
  };

  const editCategory = async (id: string, name: string) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao editar categoria:', error);
      throw error;
    }

    setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }

    setCategories(prev => prev.filter(cat => cat.id !== id));
    setItems(prev => prev.filter(item => item.category_id !== id));
  };

  const addItem = async (name: string, categoryId: string, unit?: string) => {
    const { data, error } = await supabase
      .from('items')
      .insert([{ name, category_id: categoryId, unit }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }

    setItems(prev => [...prev, data]);
  };

  const editItem = async (id: string, name: string, categoryId: string, unit?: string) => {
    const { data, error } = await supabase
      .from('items')
      .update({ name, category_id: categoryId, unit, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao editar item:', error);
      throw error;
    }

    setItems(prev => prev.map(item => item.id === id ? data : item));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir item:', error);
      throw error;
    }

    setItems(prev => prev.filter(item => item.id !== id));
    setShoppingList(prev => prev.filter(listItem => listItem.item_id !== id));
  };

  const addToShoppingList = async (itemId: string, quantity: number, unitPrice?: number) => {
    // Verificar se o item já existe na lista
    const existingItem = shoppingList.find(item => item.item_id === itemId);
    
    if (existingItem) {
      await updateShoppingListItem(existingItem.id, quantity, unitPrice, existingItem.purchased);
      return;
    }

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert([{ item_id: itemId, quantity, unit_price: unitPrice, purchased: false }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar à lista de compras:', error);
      throw error;
    }

    setShoppingList(prev => [...prev, data]);
  };

  const updateShoppingListItem = async (id: string, quantity: number, unitPrice?: number, purchased?: boolean) => {
    const updateData: any = { quantity, unit_price: unitPrice, updated_at: new Date().toISOString() };
    if (purchased !== undefined) {
      updateData.purchased = purchased;
    }

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar item da lista:', error);
      throw error;
    }

    setShoppingList(prev => prev.map(item => item.id === id ? data : item));
  };

  const removeFromShoppingList = async (id: string) => {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover da lista:', error);
      throw error;
    }

    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearShoppingList = async () => {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Erro ao limpar lista:', error);
      throw error;
    }

    setShoppingList([]);
  };

  const value: AppContextType = {
    categories,
    items,
    shoppingList,
    loading,
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
