
-- Adicionar coluna 'purchased' na tabela shopping_list_items
ALTER TABLE public.shopping_list_items 
ADD COLUMN purchased boolean NOT NULL DEFAULT false;
