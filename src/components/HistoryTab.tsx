
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Copy, Package, DollarSign } from 'lucide-react';
import { MonthlyShoppingList, MonthlyShoppingListItem, Item } from '../types';
import CopyListDialog from './history/CopyListDialog';
import { supabase } from '@/integrations/supabase/client';

const HistoryTab: React.FC = () => {
  const { items } = useAppContext();
  const [monthlyLists, setMonthlyLists] = useState<MonthlyShoppingList[]>([]);
  const [monthlyItems, setMonthlyItems] = useState<{ [key: string]: MonthlyShoppingListItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<MonthlyShoppingList | null>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  useEffect(() => {
    loadMonthlyLists();
  }, []);

  const loadMonthlyLists = async () => {
    try {
      setLoading(true);
      const { data: lists, error } = await supabase
        .from('monthly_shopping_lists')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Erro ao carregar listas mensais:', error);
        return;
      }

      setMonthlyLists(lists || []);

      // Carregar itens para cada lista
      const itemsData: { [key: string]: MonthlyShoppingListItem[] } = {};
      for (const list of lists || []) {
        const { data: listItems, error: itemsError } = await supabase
          .from('monthly_shopping_list_items')
          .select('*')
          .eq('monthly_list_id', list.id);

        if (!itemsError) {
          itemsData[list.id] = listItems || [];
        }
      }
      setMonthlyItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar listas mensais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || 'Item não encontrado';
  };

  const handleCopyList = (list: MonthlyShoppingList) => {
    setSelectedList(list);
    setShowCopyDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Listas</h2>
      </div>

      {monthlyLists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma lista finalizada encontrada.</p>
            <p className="text-sm text-gray-500 mt-2">
              Use o botão "Finalizar Mês" na aba Lista de Compras para criar o primeiro histórico.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {monthlyLists.map((list) => {
            const listItems = monthlyItems[list.id] || [];
            const purchasedItems = listItems.filter(item => item.purchased);
            
            return (
              <Card key={list.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {getMonthName(list.month)} {list.year}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Finalizada em {list.finalized_at ? new Date(list.finalized_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {list.items_count || 0} itens
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(list.total_value)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyList(list)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar Lista
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                      <span>Itens da Lista</span>
                      <span>{purchasedItems.length} de {listItems.length} comprados</span>
                    </div>
                    
                    {listItems.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum item nesta lista.</p>
                    ) : (
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {listItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className={`flex-1 ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                              <span className="font-medium">{getItemName(item.item_id)}</span>
                              {item.brand && <span className="text-gray-600 ml-2">({item.brand})</span>}
                              <span className="text-gray-600 ml-2">x{item.quantity}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {formatCurrency(item.unit_price ? item.quantity * item.unit_price : 0)}
                              </div>
                              {item.purchase_date && (
                                <div className="text-xs text-gray-500">
                                  {new Date(item.purchase_date).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedList && (
        <CopyListDialog
          isOpen={showCopyDialog}
          onClose={() => {
            setShowCopyDialog(false);
            setSelectedList(null);
          }}
          monthlyList={selectedList}
          monthlyItems={monthlyItems[selectedList.id] || []}
        />
      )}
    </div>
  );
};

export default HistoryTab;
