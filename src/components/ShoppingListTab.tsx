
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash, Plus, Loader2, Filter } from 'lucide-react';
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
  const [newListItem, setNewListItem] = useState({ itemId: '', quantity: '', unitPrice: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleAddToList = async () => {
    if (!newListItem.itemId) {
      toast({
        title: "Erro",
        description: "Selecione um item",
        variant: "destructive"
      });
      return;
    }
    
    const quantity = parseInt(newListItem.quantity) || 1;
    if (quantity < 1) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const unitPrice = newListItem.unitPrice ? parseFloat(newListItem.unitPrice) : undefined;
      await addToShoppingList(newListItem.itemId, quantity, unitPrice);
      setNewListItem({ itemId: '', quantity: '', unitPrice: '' });
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
                onChange={(e) => setNewListItem({ ...newListItem, quantity: e.target.value })}
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
                const subtotal = calculateSubtotal(listItem.quantity, listItem.unit_price);
                
                return (
                  <div key={listItem.id} className="flex flex-col space-y-3 p-4 border rounded-lg md:flex-row md:items-center md:space-y-0 md:gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={listItem.purchased || false}
                        onCheckedChange={(checked) => handleUpdateItem(listItem.id, listItem.quantity, listItem.unit_price, !!checked)}
                      />
                      <div className={`flex-1 ${listItem.purchased ? 'opacity-60 line-through' : ''}`}>
                        <div className="font-medium text-sm md:text-base truncate">{item?.name}</div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {item && getCategoryName(item.category_id)} {item?.unit && `• ${item.unit}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
                      <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2">
                        <Input
                          type="text"
                          value={listItem.quantity.toString()}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permite apenas números e string vazia
                            if (value === '' || /^\d+$/.test(value)) {
                              const numericValue = value === '' ? 1 : parseInt(value);
                              if (numericValue >= 1) {
                                handleUpdateItem(listItem.id, numericValue, listItem.unit_price, listItem.purchased);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === '' || parseInt(value) < 1) {
                              handleUpdateItem(listItem.id, 1, listItem.unit_price, listItem.purchased);
                            }
                          }}
                          className="w-full md:w-20 text-sm"
                        />
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-xs md:text-sm text-gray-500">x</span>
                          <Input
                            type="text"
                            placeholder="R$ 0,00"
                            value={listItem.unit_price ? listItem.unit_price.toString() : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Permite apenas números, ponto decimal e string vazia
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                const numericValue = value === '' ? undefined : parseFloat(value) || undefined;
                                handleUpdateItem(listItem.id, listItem.quantity, numericValue, listItem.purchased);
                              }
                            }}
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
            
            {totalListValue > 0 && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-center md:text-right">
                    <div className="text-lg md:text-xl font-bold text-gray-700">
                      Soma da Lista: R$ {totalListValue.toFixed(2)}
                    </div>
                  </div>
                </div>
                {totalPurchasedValue > 0 && (
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="text-center md:text-right">
                      <div className="text-xl md:text-2xl font-bold text-success">
                        Soma de Itens Comprados: R$ {totalPurchasedValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingListTab;
