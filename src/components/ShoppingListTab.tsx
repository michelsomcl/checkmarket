
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddToListForm from './shopping-list/AddToListForm';
import ShoppingListItem from './shopping-list/ShoppingListItem';
import ShoppingListSummary from './shopping-list/ShoppingListSummary';

const ShoppingListTab: React.FC = () => {
  const { 
    items, 
    categories, 
    shoppingList, 
    addToShoppingList, 
    updateShoppingListItem, 
    removeFromShoppingList, 
    clearShoppingList,
    loading 
  } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleUpdateItem = async (id: string, quantity: number, unitPrice?: number, purchased?: boolean) => {
    try {
      await updateShoppingListItem(id, quantity, unitPrice, purchased);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      setIsSubmitting(true);
      await removeFromShoppingList(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearList = async () => {
    try {
      setIsSubmitting(true);
      await clearShoppingList();
      toast({
        title: "Lista limpa",
        description: "Todos os itens foram removidos da lista"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar lista",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  const calculateSubtotal = (quantity: number, unitPrice?: number) => {
    return unitPrice ? quantity * unitPrice : 0;
  };

  const filteredShoppingList = shoppingList.filter(listItem => {
    if (categoryFilter === 'all') return true;
    const item = getItemById(listItem.item_id);
    return item?.category_id === categoryFilter;
  });

  const calculateTotal = (includeOnlyPurchased = false) => {
    return filteredShoppingList.reduce((total, listItem) => {
      if (includeOnlyPurchased && !listItem.purchased) return total;
      return total + calculateSubtotal(listItem.quantity, listItem.unit_price);
    }, 0);
  };

  const totalListValue = calculateTotal();
  const totalPurchasedValue = calculateTotal(true);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <AddToListForm
        items={items}
        categories={categories}
        onAddToList={addToShoppingList}
        isSubmitting={isSubmitting}
      />

      {shoppingList.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-800">Itens na Lista</CardTitle>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleClearList}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Reiniciar Lista
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredShoppingList.map((listItem) => {
                const item = getItemById(listItem.item_id);
                const categoryName = item ? getCategoryName(item.category_id) : '';
                
                return (
                  <ShoppingListItem
                    key={listItem.id}
                    listItem={listItem}
                    item={item}
                    categoryName={categoryName}
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                    isSubmitting={isSubmitting}
                  />
                );
              })}
            </div>
            
            <ShoppingListSummary
              totalListValue={totalListValue}
              totalPurchasedValue={totalPurchasedValue}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingListTab;
