
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import Navigation from '../components/Navigation';
import CategoriesTab from '../components/CategoriesTab';
import ItemsTab from '../components/ItemsTab';
import ShoppingListTab from '../components/ShoppingListTab';
import Footer from '../components/Footer';

const Index = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesTab />;
      case 'items':
        return <ItemsTab />;
      case 'shopping':
        return <ShoppingListTab />;
      default:
        return <CategoriesTab />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-primary">Check</span>
              <span className="text-success">market</span>
            </h1>
            <p className="text-gray-600 mt-1">Gerencie suas listas de compras de forma inteligente</p>
          </div>
        </header>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 bg-gray-50">
          {renderActiveTab()}
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
};

export default Index;
