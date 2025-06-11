
import React from 'react';

interface ShoppingListSummaryProps {
  totalListValue: number;
  totalPurchasedValue: number;
}

const ShoppingListSummary: React.FC<ShoppingListSummaryProps> = ({
  totalListValue,
  totalPurchasedValue
}) => {
  if (totalListValue <= 0) return null;

  return (
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
  );
};

export default ShoppingListSummary;
