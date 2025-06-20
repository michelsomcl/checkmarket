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

  const updateShoppingListItem = async (id: string, quantity: number, unitPrice?: number, purchased?: boolean, brand?: string, purchaseDate?: string) => {
    const updateData: any = { 
      quantity, 
      unit_price: unitPrice, 
      updated_at: new Date().toISOString() 
    };
    
    if (purchased !== undefined) {
      updateData.purchased = purchased;
    }
    if (brand !== undefined) {
      updateData.brand = brand;
    }
    if (purchaseDate !== undefined) {
      updateData.purchase_date = purchaseDate;
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

  const finalizeMonth = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      // Verificar se já existe uma lista para este mês/ano
      const { data: existingList } = await supabase
        .from('monthly_shopping_lists')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .single();

      let monthlyListId = existingList?.id;

      // Se não existir, criar uma nova lista mensal
      if (!existingList) {
        const { data: newMonthlyList, error: monthlyError } = await supabase
          .from('monthly_shopping_lists')
          .insert([{
            month,
            year,
            items_count: shoppingList.length,
            total_value: shoppingList.reduce((total, item) => 
              total + (item.unit_price ? item.quantity * item.unit_price : 0), 0
            )
          }])
          .select()
          .single();

        if (monthlyError) {
          console.error('Erro ao criar lista mensal:', monthlyError);
          throw monthlyError;
        }

        monthlyListId = newMonthlyList.id;
      }

      // Copiar todos os itens da lista atual para o histórico mensal
      const itemsToMove = shoppingList.map(item => ({
        monthly_list_id: monthlyListId,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        brand: item.brand,
        purchase_date: item.purchase_date,
        purchased: item.purchased
      }));

      const { error: itemsError } = await supabase
        .from('monthly_shopping_list_items')
        .insert(itemsToMove);

      if (itemsError) {
        console.error('Erro ao mover itens para histórico:', itemsError);
        throw itemsError;
      }

      // Finalizar a lista mensal se ainda não foi finalizada
      if (!existingList || !existingList.finalized_at) {
        const { error: finalizeError } = await supabase
          .from('monthly_shopping_lists')
          .update({ finalized_at: new Date().toISOString() })
          .eq('id', monthlyListId);

        if (finalizeError) {
          console.error('Erro ao finalizar lista mensal:', finalizeError);
          throw finalizeError;
        }
      }

      // Limpar a lista atual
      await clearShoppingList();

    } catch (error) {
      console.error('Erro ao finalizar mês:', error);
      throw error;
    }
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
    clearShoppingList,
    finalizeMonth
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
