
-- Adicionar coluna "brand" (marca) na tabela shopping_list_items
ALTER TABLE public.shopping_list_items 
ADD COLUMN brand TEXT;

-- Adicionar coluna "purchase_date" (data da compra) na tabela shopping_list_items
ALTER TABLE public.shopping_list_items 
ADD COLUMN purchase_date DATE;

-- Criar tabela para histórico de listas de compras por mês
CREATE TABLE public.monthly_shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_value DECIMAL(10,2),
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finalized_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(month, year)
);

-- Criar tabela para itens do histórico mensal
CREATE TABLE public.monthly_shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_list_id UUID NOT NULL REFERENCES public.monthly_shopping_lists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  brand TEXT,
  purchase_date DATE,
  purchased BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.monthly_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para acesso público (como as outras tabelas)
CREATE POLICY "Allow public access to monthly shopping lists" 
  ON public.monthly_shopping_lists 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to monthly shopping list items" 
  ON public.monthly_shopping_list_items 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
