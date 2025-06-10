
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ItemsTab: React.FC = () => {
  const { categories, items, addItem, editItem, deleteItem } = useAppContext();
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ name: '', categoryId: '', unit: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState({ name: '', categoryId: '', unit: '' });

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.categoryId) {
      toast({
        title: "Erro",
        description: "Nome do item e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    addItem(newItem.name.trim(), newItem.categoryId, newItem.unit.trim() || undefined);
    setNewItem({ name: '', categoryId: '', unit: '' });
    toast({
      title: "Sucesso",
      description: "Item adicionado com sucesso"
    });
  };

  const handleEditItem = (id: string) => {
    if (!editingItem.name.trim() || !editingItem.categoryId) {
      toast({
        title: "Erro",
        description: "Nome do item e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    editItem(id, editingItem.name.trim(), editingItem.categoryId, editingItem.unit.trim() || undefined);
    setEditingId(null);
    setEditingItem({ name: '', categoryId: '', unit: '' });
    toast({
      title: "Sucesso",
      description: "Item editado com sucesso"
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
    toast({
      title: "Sucesso",
      description: "Item excluído com sucesso"
    });
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditingItem({ name: item.name, categoryId: item.categoryId, unit: item.unit || '' });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cadastro de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Nome do item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Select value={newItem.categoryId} onValueChange={(value) => setNewItem({ ...newItem, categoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Unidade (opcional)"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
            <Button 
              onClick={handleAddItem}
              className="checkmarket-orange checkmarket-hover-orange"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              {editingId === item.id ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                  <Select value={editingItem.categoryId} onValueChange={(value) => setEditingItem({ ...editingItem, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    placeholder="Unidade"
                  />
                  <Button
                    onClick={() => handleEditItem(item.id)}
                    size="sm"
                    className="checkmarket-green checkmarket-hover-green"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => startEditing(item)}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {getCategoryName(item.categoryId)} {item.unit && `• ${item.unit}`}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ItemsTab;
