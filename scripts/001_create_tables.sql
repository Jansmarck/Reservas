-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Politicas para properties
CREATE POLICY "properties_select_own" ON public.properties 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "properties_insert_own" ON public.properties 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "properties_update_own" ON public.properties 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "properties_delete_own" ON public.properties 
  FOR DELETE USING (auth.uid() = user_id);

-- Politicas para bookings
CREATE POLICY "bookings_select_own" ON public.bookings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_own" ON public.bookings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own" ON public.bookings 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bookings_delete_own" ON public.bookings 
  FOR DELETE USING (auth.uid() = user_id);
