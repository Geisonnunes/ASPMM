-- Configurações do site (singleton id = 1): hero + bloco editável na home.
CREATE TABLE public.site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_image_url text,
  hero_badge text NOT NULL DEFAULT 'Associação dos Servidores Públicos',
  hero_title text NOT NULL DEFAULT 'Bem-vindo à',
  hero_title_accent text NOT NULL DEFAULT 'ASPMM',
  hero_subtitle text NOT NULL DEFAULT 'Esporte, lazer e convivência para servidores públicos e suas famílias em Marília. Venha conhecer nossa estrutura completa!',
  editor_title text NOT NULL DEFAULT '',
  editor_description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id) VALUES (1);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
