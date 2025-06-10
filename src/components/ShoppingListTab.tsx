import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newListItem, setNewListItem] = useState({ itemId: '', quantity: 1, unitPrice: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToList = async () => {
    if (!newListItem.itemId) {
      toast({
        title: "Erro",
        description: "Selecione um item",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const unitPrice = newListItem.unitPrice ? parseFloat(newListItem.unitPrice) : undefined;
      await addToShoppingList(newListItem.itemId, newListItem.quantity, unitPrice);
      setNewListItem({ itemId: '', quantity: 1, unitPrice: '' });
      toast({
        title: "Sucesso",
        description: "Item adicionado à lista"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar item à lista",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (id: string, quantity: number, unitPrice?: number) => {
    try {
      await updateShoppingListItem(id, quantity, unitPrice);
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

  const calculateTotal = () => {
    return shoppingList.reduce((total, listItem) => {
      return total + calculateSubtotal(listItem.quantity, listItem.unit_price);
    }, 0);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <Select value={newListItem.itemId} onValueChange={(value) => setNewListItem({ ...newListItem, itemId: value })} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({getCategoryName(item.category_id)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Input
                type="number"
                placeholder="Quantidade"
                min="1"
                value={newListItem.quantity}
                onChange={(e) => setNewListItem({ ...newListItem, quantity: parseInt(e.target.value) || 1 })}
                disabled={isSubmitting}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                type="number"
                step="0.01"
                placeholder="Valor unitário (R$)"
                value={newListItem.unitPrice}
                onChange={(e) => setNewListItem({ ...newListItem, unitPrice: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="md:col-span-1">
              <Button 
                onClick={handleAddToList}
                className="checkmarket-orange checkmarket-hover-orange w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {shoppingList.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-800">Itens na Lista</CardTitle>
            <Button 
              onClick={handleClearList}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reiniciar Lista
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shoppingList.map((listItem) => {
                const item = getItemById(listItem.item_id);
                const subtotal = calculateSubtotal(listItem.quantity, listItem.unit_price);
                
                return (
                  <div key={listItem.id} className="flex flex-col space-y-3 p-4 border rounded-lg md:flex-row md:items-center md:space-y-0 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm md:text-base truncate">{item?.name}</div>
                      <div className="text-xs md:text-sm text-gray-500">
                        {item && getCategoryName(item.category_id)} {item?.unit && `• ${item.unit}`}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
                      <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={listItem.quantity}
                          onChange={(e) => handleUpdateItem(listItem.id, parseInt(e.target.value) || 1, listItem.unit_price)}
                          className="w-full md:w-20 text-sm"
                        />
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-xs md:text-sm text-gray-500">x</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="R$ 0,00"
                            value={listItem.unit_price || ''}
                            onChange={(e) => handleUpdateItem(listItem.id, listItem.quantity, parseFloat(e.target.value) || undefined)}
                            className="w-full md:w-24 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-start md:gap-2">
                        {listItem.unit_price && (
                          <div className="text-success font-semibold text-sm md:text-base md:w-20 md:text-right">
                            R$ {subtotal.toFixed(2)}
                          </div>
                        )}
                        <Button
                          onClick={() => handleRemoveItem(listItem.id)}
                          variant="destructive"
                          size="sm"
                          disabled={isSubmitting}
                          className="ml-auto md:ml-0"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {calculateTotal() > 0 && (
              <div className="mt-6 p-4 bg-success/10 rounded-lg">
                <div className="text-center md:text-right">
                  <div className="text-xl md:text-2xl font-bold text-success">
                    Valor Total: R$ {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingListTab;
