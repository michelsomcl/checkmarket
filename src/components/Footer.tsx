
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            © {new Date().getFullYear()} <span className="font-semibold text-primary">Checkmarket</span> é uma marca Vibesys Sistemas. 
            Todos os direitos reservados.
          </p>
          <p className="text-xs mt-1">
            Desenvolvido para facilitar suas compras no supermercado.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
