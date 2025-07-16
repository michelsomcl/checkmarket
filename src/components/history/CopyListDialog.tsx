
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useAppContext } from '../../context/AppContext';
import { MonthlyShoppingList, MonthlyShoppingListItem } from '../../types';
import { useToast } from '@/hooks/use-toast';

interface CopyListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyList: MonthlyShoppingList;
  monthlyItems: MonthlyShoppingListItem[];
}

const CopyListDialog: React.FC<CopyListDialogProps> = ({
  isOpen,
  onClose,
  monthlyList,
  monthlyItems
}) => {
  const { items, addToShoppingList } = useAppContext();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [copying, setCopying] = useState(false);

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || 'Item não encontrado';
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSelectAll = () => {
    const allSelected = monthlyItems.every(item => selectedItems[item.id]);
    const newSelection: { [key: string]: boolean } = {};
    
    monthlyItems.forEach(item => {
      newSelection[item.id] = !allSelected;
    });
    
    setSelectedItems(newSelection);
  };

  const handleCopyItems = async () => {
    const itemsToCopy = monthlyItems.filter(item => selectedItems[item.id]);
    
    if (itemsToCopy.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos um item para copiar.",
        variant: "destructive"
      });
      return;
    }

    setCopying(true);
    
    try {
      for (const item of itemsToCopy) {
        await addToShoppingList(item.item_id, item.quantity, item.unit_price);
      }
      
      toast({
        title: "Itens copiados com sucesso!",
        description: `${itemsToCopy.length} itens foram adicionados à sua lista atual.`
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao copiar itens:', error);
      toast({
        title: "Erro ao copiar itens",
        description: "Ocorreu um erro ao copiar os itens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Copiar Lista de {getMonthName(monthlyList.month)} {monthlyList.year}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Selecione os itens que deseja copiar para a lista atual:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {monthlyItems.every(item => selectedItems[item.id]) ? 'Desmarcar Todos' : 'Marcar Todos'}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg">
            {monthlyItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Esta lista não possui itens.
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {monthlyItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={selectedItems[item.id] || false}
                      onCheckedChange={(checked) => handleItemToggle(item.id, !!checked)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{getItemName(item.item_id)}</div>
                      <div className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                        {item.brand && ` • Marca: ${item.brand}`}
                        {item.unit_price && ` • Preço: R$ ${item.unit_price.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-600">
              {selectedCount} de {monthlyItems.length} itens selecionados
            </span>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose} disabled={copying}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCopyItems} 
                disabled={copying || selectedCount === 0}
              >
                {copying ? 'Copiando...' : `Copiar ${selectedCount} itens`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyListDialog;
