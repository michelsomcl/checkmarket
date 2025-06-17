
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Filter, Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

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

  const handleAddToShoppingList = async (itemId: string, quantity: number, unitPrice?: number) => {
    // Permitir itens repetidos - remover verificação de item existente
    try {
      await addToShoppingList(itemId, quantity, unitPrice);
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
      throw error;
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Lista de Compras', 20, 20);
    
    // Data
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    let yPosition = 50;
    
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.text('Item', 20, yPosition);
    doc.text('Categoria', 80, yPosition);
    doc.text('Qtd', 130, yPosition);
    doc.text('Preço Un.', 150, yPosition);
    doc.text('Total', 180, yPosition);
    
    yPosition += 10;
    
    // Linha separadora
    doc.line(20, yPosition - 5, 200, yPosition - 5);
    
    let totalGeral = 0;
    
    filteredShoppingList.forEach((listItem) => {
      const item = getItemById(listItem.item_id);
      const categoryName = item ? getCategoryName(item.category_id) : '';
      const subtotal = calculateSubtotal(listItem.quantity, listItem.unit_price);
      totalGeral += subtotal;
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(item?.name || '', 20, yPosition);
      doc.text(categoryName, 80, yPosition);
      doc.text(listItem.quantity.toString(), 130, yPosition);
      doc.text(listItem.unit_price ? `R$ ${listItem.unit_price.toFixed(2)}` : '', 150, yPosition);
      doc.text(listItem.unit_price ? `R$ ${subtotal.toFixed(2)}` : '', 180, yPosition);
      
      if (listItem.purchased) {
        doc.text('✓', 10, yPosition);
      }
      
      yPosition += 8;
    });
    
    // Total geral
    yPosition += 10;
    doc.line(20, yPosition - 5, 200, yPosition - 5);
    doc.setFontSize(12);
    doc.text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, 130, yPosition + 5);
    
    doc.save('lista-de-compras.pdf');
    
    toast({
      title: "Sucesso",
      description: "PDF exportado com sucesso"
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

  const filteredShoppingList = shoppingList.filter(listItem => {
    const item = getItemById(listItem.item_id);
    
    // Filtro por categoria
    if (categoryFilter !== 'all' && item?.category_id !== categoryFilter) {
      return false;
    }
    
    // Filtro por status
    if (statusFilter === 'purchased' && !listItem.purchased) {
      return false;
    }
    if (statusFilter === 'pending' && listItem.purchased) {
      return false;
    }
    
    // Filtro por busca
    if (searchFilter && item?.name.toLowerCase().indexOf(searchFilter.toLowerCase()) === -1) {
      return false;
    }
    
    return true;
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
        onAddToList={handleAddToShoppingList}
        isSubmitting={isSubmitting}
      />

      {shoppingList.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-800">Itens na Lista</CardTitle>
            
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-4">
              {/* Filtros */}
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar item..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full md:w-32"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Categoria" />
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
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="purchased">Comprados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button 
                  onClick={exportToPDF}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  disabled={isSubmitting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                
                <Button 
                  onClick={handleClearList}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reiniciar Lista
                </Button>
              </div>
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
