
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ShoppingListTab: React.FC = () => {
  const { 
    items, 
    categories, 
    shoppingList, 
    addToShoppingList, 
    updateShoppingListItem, 
    removeFromShoppingList, 
    clearShoppingList 
  } = useAppContext();
  const { toast } = useToast();
  const [newListItem, setNewListItem] = useState({ itemId: '', quantity: 1, unitPrice: '' });

  const handleAddToList = () => {
    if (!newListItem.itemId) {
      toast({
        title: "Erro",
        description: "Selecione um item",
        variant: "destructive"
      });
      return;
    }
    
    const unitPrice = newListItem.unitPrice ? parseFloat(newListItem.unitPrice) : undefined;
    addToShoppingList(newListItem.itemId, newListItem.quantity, unitPrice);
    setNewListItem({ itemId: '', quantity: 1, unitPrice: '' });
    toast({
      title: "Sucesso",
      description: "Item adicionado à lista"
    });
  };

  const handleUpdateItem = (id: string, quantity: number, unitPrice?: number) => {
    updateShoppingListItem(id, quantity, unitPrice);
  };

  const handleClearList = () => {
    clearShoppingList();
    toast({
      title: "Lista limpa",
      description: "Todos os itens foram removidos da lista"
    });
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
      return total + calculateSubtotal(listItem.quantity, listItem.unitPrice);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={newListItem.itemId} onValueChange={(value) => setNewListItem({ ...newListItem, itemId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o item" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({getCategoryName(item.categoryId)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Quantidade"
              min="1"
              value={newListItem.quantity}
              onChange={(e) => setNewListItem({ ...newListItem, quantity: parseInt(e.target.value) || 1 })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Valor unitário (R$)"
              value={newListItem.unitPrice}
              onChange={(e) => setNewListItem({ ...newListItem, unitPrice: e.target.value })}
            />
            <Button 
              onClick={handleAddToList}
              className="checkmarket-orange checkmarket-hover-orange"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {shoppingList.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">Itens na Lista</CardTitle>
            <Button 
              onClick={handleClearList}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Reiniciar Lista
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shoppingList.map((listItem) => {
                const item = getItemById(listItem.itemId);
                const subtotal = calculateSubtotal(listItem.quantity, listItem.unitPrice);
                
                return (
                  <div key={listItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item?.name}</div>
                      <div className="text-sm text-gray-500">
                        {item && getCategoryName(item.categoryId)} {item?.unit && `• ${item.unit}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={listItem.quantity}
                        onChange={(e) => handleUpdateItem(listItem.id, parseInt(e.target.value) || 1, listItem.unitPrice)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">x</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="R$ 0,00"
                        value={listItem.unitPrice || ''}
                        onChange={(e) => handleUpdateItem(listItem.id, listItem.quantity, parseFloat(e.target.value) || undefined)}
                        className="w-24"
                      />
                      {listItem.unitPrice && (
                        <div className="text-success font-semibold w-20 text-right">
                          R$ {subtotal.toFixed(2)}
                        </div>
                      )}
                      <Button
                        onClick={() => removeFromShoppingList(listItem.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {calculateTotal() > 0 && (
              <div className="mt-6 p-4 bg-success/10 rounded-lg">
                <div className="text-right">
                  <div className="text-2xl font-bold text-success">
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
