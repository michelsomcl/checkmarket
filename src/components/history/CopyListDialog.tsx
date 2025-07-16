
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { useAppContext } from '../../context/AppContext';
import { MonthlyShoppingList, MonthlyShoppingListItem } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrar e ordenar itens alfabeticamente
  const filteredAndSortedItems = useMemo(() => {
    return monthlyItems
      .filter(item => {
        const itemName = getItemName(item.item_id).toLowerCase();
        return itemName.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = getItemName(a.item_id).toLowerCase();
        const nameB = getItemName(b.item_id).toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [monthlyItems, searchTerm, items]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSelectAll = () => {
    const allSelected = filteredAndSortedItems.every(item => selectedItems[item.id]);
    const newSelection: { [key: string]: boolean } = {};
    
    filteredAndSortedItems.forEach(item => {
      newSelection[item.id] = !allSelected;
    });
    
    setSelectedItems(prev => ({
      ...prev,
      ...newSelection
    }));
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
  const filteredSelectedCount = filteredAndSortedItems.filter(item => selectedItems[item.id]).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Copiar Lista de {getMonthName(monthlyList.month)} {monthlyList.year}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Selecione os itens que deseja copiar para a lista atual:
            </p>
            
            {/* Campo de busca */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Botão selecionar todos */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {filteredAndSortedItems.length} itens encontrados
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
                disabled={filteredAndSortedItems.length === 0}
              >
                {filteredAndSortedItems.every(item => selectedItems[item.id]) ? 'Desmarcar Todos' : 'Marcar Todos'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg">
            {filteredAndSortedItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Nenhum item encontrado para a busca.' : 'Esta lista não possui itens.'}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredAndSortedItems.map((item) => (
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
