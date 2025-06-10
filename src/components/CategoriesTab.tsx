
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CategoriesTab: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory } = useAppContext();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    toast({
      title: "Sucesso",
      description: "Categoria adicionada com sucesso"
    });
  };

  const handleEditCategory = (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    editCategory(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
    toast({
      title: "Sucesso",
      description: "Categoria editada com sucesso"
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso"
    });
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cadastro de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1"
            />
            <Button 
              onClick={handleAddCategory}
              className="checkmarket-orange checkmarket-hover-orange"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {editingId === category.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category.id)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleEditCategory(category.id)}
                      size="sm"
                      className="checkmarket-green checkmarket-hover-green"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="text-lg font-medium cursor-pointer hover:text-primary"
                      onClick={() => startEditing(category.id, category.name)}
                    >
                      {category.name}
                    </span>
                    <Button
                      onClick={() => handleDeleteCategory(category.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTab;
