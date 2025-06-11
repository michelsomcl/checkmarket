
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Item, Category } from '../../types';

interface AddToListFormProps {
  items: Item[];
  categories: Category[];
  onAddToList: (itemId: string, quantity: number, unitPrice?: number) => Promise<void>;
  isSubmitting: boolean;
}

const AddToListForm: React.FC<AddToListFormProps> = ({
  items,
  categories,
  onAddToList,
  isSubmitting
}) => {
  const { toast } = useToast();
  const [newListItem, setNewListItem] = useState({ itemId: '', quantity: '', unitPrice: '' });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

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
      const unitPrice = newListItem.unitPrice ? parseFloat(newListItem.unitPrice) : undefined;
      await onAddToList(newListItem.itemId, quantity, unitPrice);
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
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">Lista de Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <Select 
              value={newListItem.itemId} 
              onValueChange={(value) => setNewListItem({ ...newListItem, itemId: value })} 
              disabled={isSubmitting}
            >
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
  );
};

export default AddToListForm;
