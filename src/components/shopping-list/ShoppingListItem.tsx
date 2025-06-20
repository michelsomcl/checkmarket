
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Loader2 } from 'lucide-react';
import { ShoppingListItem as ShoppingListItemType, Item } from '../../types';
import EditableField from './EditableField';

interface ShoppingListItemProps {
  listItem: ShoppingListItemType;
  item: Item | undefined;
  categoryName: string;
  onUpdate: (id: string, quantity: number, unitPrice?: number, purchased?: boolean, brand?: string, purchaseDate?: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  listItem,
  item,
  categoryName,
  onUpdate,
  onRemove,
  isSubmitting
}) => {
  const calculateSubtotal = (quantity: number, unitPrice?: number) => {
    return unitPrice ? quantity * unitPrice : 0;
  };

  const handleQuantityChange = (newQuantity: string | number) => {
    const quantity = typeof newQuantity === 'string' ? parseInt(newQuantity) : newQuantity;
    if (quantity >= 1) {
      onUpdate(listItem.id, quantity, listItem.unit_price, listItem.purchased, listItem.brand, listItem.purchase_date);
    }
  };

  const handlePriceChange = (newPrice: string | number) => {
    const price = typeof newPrice === 'string' ? (newPrice === '' ? undefined : parseFloat(newPrice)) : newPrice;
    onUpdate(listItem.id, listItem.quantity, price || undefined, listItem.purchased, listItem.brand, listItem.purchase_date);
  };

  const handleBrandChange = (newBrand: string | number) => {
    const brand = typeof newBrand === 'string' ? newBrand : newBrand.toString();
    onUpdate(listItem.id, listItem.quantity, listItem.unit_price, listItem.purchased, brand, listItem.purchase_date);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    onUpdate(listItem.id, listItem.quantity, listItem.unit_price, listItem.purchased, listItem.brand, date);
  };

  const handlePurchasedChange = (checked: boolean) => {
    let purchaseDate = listItem.purchase_date;
    
    if (checked) {
      // Se marcou como comprado, preenche com a data atual se não tiver data
      if (!purchaseDate) {
        const today = new Date();
        purchaseDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      }
    } else {
      // Se desmarcou, apaga a data
      purchaseDate = '';
    }
    
    onUpdate(listItem.id, listItem.quantity, listItem.unit_price, checked, listItem.brand, purchaseDate);
  };

  const subtotal = calculateSubtotal(listItem.quantity, listItem.unit_price);

  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Checkbox
          checked={listItem.purchased || false}
          onCheckedChange={handlePurchasedChange}
        />
        <div className={`flex-1 ${listItem.purchased ? 'opacity-60 line-through' : ''}`}>
          <div className="font-medium text-sm md:text-base truncate">{item?.name}</div>
          <div className="text-xs md:text-sm text-gray-500">
            {categoryName} {item?.unit && `• ${item.unit}`}
          </div>
        </div>
      </div>
      
      {/* Linha com quantidade, preço e total */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
        <div className="flex items-center gap-2">
          <EditableField
            value={listItem.quantity}
            type="number"
            placeholder="Qtd"
            className="w-16 text-center"
            onSave={handleQuantityChange}
            disabled={isSubmitting}
          />
          
          <span className="text-xs md:text-sm text-gray-500">x</span>
          
          <EditableField
            value={listItem.unit_price || ''}
            type="number"
            step="0.01"
            placeholder="R$ 0,00"
            className="w-24"
            onSave={handlePriceChange}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-center justify-between md:justify-start md:gap-2">
          {listItem.unit_price && (
            <div className="text-success font-semibold text-sm md:text-base md:w-20 md:text-right">
              R$ {subtotal.toFixed(2)}
            </div>
          )}
          <Button
            onClick={() => onRemove(listItem.id)}
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            className="ml-auto md:ml-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Linha com marca e data da compra */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Marca</label>
          <EditableField
            value={listItem.brand || ''}
            type="text"
            placeholder="Digite a marca"
            className="w-full"
            onSave={handleBrandChange}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Data da Compra</label>
          <Input
            type="date"
            value={listItem.purchase_date || ''}
            onChange={handleDateChange}
            className="w-full text-sm"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ShoppingListItem;
