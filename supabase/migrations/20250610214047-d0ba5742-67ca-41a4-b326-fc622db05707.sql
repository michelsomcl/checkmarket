
-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da lista de compras
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS que permitem acesso público (já que não há autenticação ainda)
-- Categorias
CREATE POLICY "Allow public access to categories" 
  ON public.categories 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Itens
CREATE POLICY "Allow public access to items" 
  ON public.items 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Lista de compras
CREATE POLICY "Allow public access to shopping list items" 
  ON public.shopping_list_items 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Inserir algumas categorias iniciais
INSERT INTO public.categories (name) VALUES 
  ('Alimentos'),
  ('Bebidas'),
  ('Limpeza');

-- Inserir alguns itens iniciais
INSERT INTO public.items (name, category_id, unit) 
SELECT 'Arroz', id, 'kg' FROM public.categories WHERE name = 'Alimentos'
UNION ALL
SELECT 'Feijão', id, 'kg' FROM public.categories WHERE name = 'Alimentos'
UNION ALL
SELECT 'Água', id, 'L' FROM public.categories WHERE name = 'Bebidas'
UNION ALL
SELECT 'Detergente', id, 'ml' FROM public.categories WHERE name = 'Limpeza';
