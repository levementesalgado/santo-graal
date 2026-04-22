-- ============================================================
-- Santo Graal — CONAB Data Analysis Platform
-- Supabase Setup SQL
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ============================================================

-- ============================================================
-- 1. TABELA PRINCIPAL: conab_data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conab_data (
  id            TEXT        PRIMARY KEY,
  year          INTEGER     NOT NULL CHECK (year >= 1990 AND year <= 2035),
  state         TEXT        NOT NULL,
  region        TEXT        NOT NULL CHECK (region IN ('NORTE','NORDESTE','CENTRO-OESTE','SUDESTE','SUL')),
  crop          TEXT        NOT NULL,
  production    NUMERIC(12,2) NOT NULL DEFAULT 0,
  productivity  NUMERIC(10,2) NOT NULL DEFAULT 0,
  area          NUMERIC(10,2) NOT NULL DEFAULT 0,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.conab_data IS 'Dados históricos de produção de café da CONAB por estado e safra';
COMMENT ON COLUMN public.conab_data.production   IS 'Produção em milhares de sacas de 60kg';
COMMENT ON COLUMN public.conab_data.productivity IS 'Produtividade em sacas/hectare';
COMMENT ON COLUMN public.conab_data.area         IS 'Área em produção em milhares de hectares';

-- Índices para performance nas queries mais comuns
CREATE INDEX IF NOT EXISTS idx_conab_year        ON public.conab_data (year);
CREATE INDEX IF NOT EXISTS idx_conab_state       ON public.conab_data (state);
CREATE INDEX IF NOT EXISTS idx_conab_region      ON public.conab_data (region);
CREATE INDEX IF NOT EXISTS idx_conab_crop        ON public.conab_data (crop);
CREATE INDEX IF NOT EXISTS idx_conab_year_state  ON public.conab_data (year, state);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conab_updated_at ON public.conab_data;
CREATE TRIGGER trg_conab_updated_at
  BEFORE UPDATE ON public.conab_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.conab_data ENABLE ROW LEVEL SECURITY;

-- Leitura pública (dados abertos da CONAB)
CREATE POLICY "Leitura pública dos dados CONAB"
  ON public.conab_data FOR SELECT
  USING (true);

-- Inserção/atualização apenas para usuários autenticados
CREATE POLICY "Inserção autenticada"
  ON public.conab_data FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Atualização autenticada"
  ON public.conab_data FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Exclusão autenticada"
  ON public.conab_data FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. VIEWS ÚTEIS
-- ============================================================

-- Produção nacional agregada por ano
CREATE OR REPLACE VIEW public.vw_producao_nacional AS
SELECT
  year,
  SUM(production)    AS total_production,
  AVG(productivity)  AS avg_productivity,
  SUM(area)          AS total_area,
  COUNT(DISTINCT state) AS states_count
FROM public.conab_data
GROUP BY year
ORDER BY year;

-- Ranking de produtividade por estado (último ano disponível)
CREATE OR REPLACE VIEW public.vw_ranking_estados AS
SELECT
  state,
  region,
  year,
  crop,
  productivity,
  production,
  area,
  RANK() OVER (PARTITION BY year ORDER BY productivity DESC) AS rank_produtividade
FROM public.conab_data
WHERE year = (SELECT MAX(year) FROM public.conab_data);

-- Comparativo bienal (ano par vs ímpar) para Café Arábica
CREATE OR REPLACE VIEW public.vw_bienalidade_arabica AS
SELECT
  state,
  year,
  production,
  CASE WHEN year % 2 = 0 THEN 'Safra Alta' ELSE 'Safra Baixa' END AS tipo_safra,
  LAG(production) OVER (PARTITION BY state ORDER BY year) AS production_anterior,
  ROUND(
    ((production - LAG(production) OVER (PARTITION BY state ORDER BY year))
     / NULLIF(LAG(production) OVER (PARTITION BY state ORDER BY year), 0)) * 100,
    2
  ) AS variacao_pct
FROM public.conab_data
WHERE crop ILIKE '%arábica%'
ORDER BY state, year;

-- ============================================================
-- 4. FUNÇÕES RPC (chamáveis pelo cliente Supabase)
-- ============================================================

-- Retorna dados filtrados com paginação
CREATE OR REPLACE FUNCTION public.get_conab_filtered(
  p_years    INTEGER[]   DEFAULT NULL,
  p_states   TEXT[]      DEFAULT NULL,
  p_crops    TEXT[]      DEFAULT NULL,
  p_limit    INTEGER     DEFAULT 500,
  p_offset   INTEGER     DEFAULT 0
)
RETURNS SETOF public.conab_data
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.conab_data
  WHERE
    (p_years  IS NULL OR year  = ANY(p_years))
    AND (p_states IS NULL OR state = ANY(p_states))
    AND (p_crops  IS NULL OR crop  = ANY(p_crops))
  ORDER BY year ASC, state ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Retorna anos disponíveis
CREATE OR REPLACE FUNCTION public.get_available_years()
RETURNS TABLE(year INTEGER)
LANGUAGE sql STABLE AS $$
  SELECT DISTINCT year FROM public.conab_data ORDER BY year DESC;
$$;

-- Retorna estados disponíveis
CREATE OR REPLACE FUNCTION public.get_available_states()
RETURNS TABLE(state TEXT)
LANGUAGE sql STABLE AS $$
  SELECT DISTINCT state FROM public.conab_data ORDER BY state ASC;
$$;

-- Estatísticas de resumo por região
CREATE OR REPLACE FUNCTION public.get_regional_stats(p_year INTEGER DEFAULT NULL)
RETURNS TABLE(
  region           TEXT,
  total_production NUMERIC,
  avg_productivity NUMERIC,
  total_area       NUMERIC,
  state_count      BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT
    region,
    SUM(production)       AS total_production,
    ROUND(AVG(productivity), 2) AS avg_productivity,
    SUM(area)             AS total_area,
    COUNT(DISTINCT state) AS state_count
  FROM public.conab_data
  WHERE (p_year IS NULL OR year = p_year)
  GROUP BY region
  ORDER BY total_production DESC;
$$;

-- ============================================================
-- 5. DADOS SEED (dados históricos da aplicação)
-- ============================================================
INSERT INTO public.conab_data (id, year, state, region, crop, production, productivity, area)
VALUES
  ('mg-2018', 2018, 'MG', 'SUDESTE',      'Café Arábica',  33400, 1810, 1108),
  ('mg-2019', 2019, 'MG', 'SUDESTE',      'Café Arábica',  24500, 1330, 1105),
  ('mg-2020', 2020, 'MG', 'SUDESTE',      'Café Arábica',  34650, 1880, 1105),
  ('mg-2021', 2021, 'MG', 'SUDESTE',      'Café Arábica',  22140, 1210, 1100),
  ('mg-2022', 2022, 'MG', 'SUDESTE',      'Café Arábica',  28450, 1550, 1102),
  ('mg-2023', 2023, 'MG', 'SUDESTE',      'Café Arábica',  29020, 1585, 1098),
  ('mg-2024', 2024, 'MG', 'SUDESTE',      'Café Arábica',  31500, 1720, 1100),
  ('mg-2025', 2025, 'MG', 'SUDESTE',      'Café Arábica',  32800, 1790, 1100),
  ('mg-2026', 2026, 'MG', 'SUDESTE',      'Café Arábica',  34100, 1860, 1100),
  ('es-2018', 2018, 'ES', 'SUDESTE',      'Café Conillon',  9200, 1880,  294),
  ('es-2019', 2019, 'ES', 'SUDESTE',      'Café Conillon',  9800, 2005,  293),
  ('es-2020', 2020, 'ES', 'SUDESTE',      'Café Conillon', 10150, 2080,  293),
  ('es-2021', 2021, 'ES', 'SUDESTE',      'Café Conillon', 11200, 2290,  294),
  ('es-2022', 2022, 'ES', 'SUDESTE',      'Café Conillon', 12350, 2510,  295),
  ('es-2023', 2023, 'ES', 'SUDESTE',      'Café Conillon', 13800, 2800,  296),
  ('es-2024', 2024, 'ES', 'SUDESTE',      'Café Conillon', 14500, 2950,  295),
  ('es-2025', 2025, 'ES', 'SUDESTE',      'Café Conillon', 15400, 3120,  296),
  ('es-2026', 2026, 'ES', 'SUDESTE',      'Café Conillon', 16100, 3260,  296),
  ('sp-2018', 2018, 'SP', 'SUDESTE',      'Café Arábica',   6450, 1920,  201),
  ('sp-2020', 2020, 'SP', 'SUDESTE',      'Café Arábica',   6200, 1850,  201),
  ('sp-2022', 2022, 'SP', 'SUDESTE',      'Café Arábica',   4300, 1285,  201),
  ('sp-2024', 2024, 'SP', 'SUDESTE',      'Café Arábica',   5400, 1620,  200),
  ('sp-2026', 2026, 'SP', 'SUDESTE',      'Café Arábica',   5850, 1760,  200),
  ('ro-2018', 2018, 'RO', 'NORTE',        'Café Robusta',   2150, 1980,   65),
  ('ro-2020', 2020, 'RO', 'NORTE',        'Café Robusta',   2420, 2230,   65),
  ('ro-2022', 2022, 'RO', 'NORTE',        'Café Robusta',   2650, 2450,   65),
  ('ro-2024', 2024, 'RO', 'NORTE',        'Café Robusta',   2900, 2680,   65),
  ('ro-2026', 2026, 'RO', 'NORTE',        'Café Robusta',   3120, 2880,   65),
  ('ba-2018', 2018, 'BA', 'NORDESTE',     'Café Arábica',   3800, 1300,  175),
  ('ba-2020', 2020, 'BA', 'NORDESTE',     'Café Arábica',   3950, 1350,  175),
  ('ba-2022', 2022, 'BA', 'NORDESTE',     'Café Arábica',   3600, 1230,  175),
  ('ba-2024', 2024, 'BA', 'NORDESTE',     'Café Arábica',   4100, 1405,  175),
  ('ba-2026', 2026, 'BA', 'NORDESTE',     'Café Arábica',   4250, 1460,  175),
  ('pr-2026', 2026, 'PR', 'SUL',          'Café Arábica',    850, 1250,   41),
  ('go-2026', 2026, 'GO', 'CENTRO-OESTE', 'Café Arábica',    320, 1480,   13),
  ('rj-2026', 2026, 'RJ', 'SUDESTE',      'Café Arábica',    240, 1150,   12),
  ('mt-2026', 2026, 'MT', 'CENTRO-OESTE', 'Café Robusta',    180, 1320,    8)
ON CONFLICT (id) DO UPDATE SET
  production   = EXCLUDED.production,
  productivity = EXCLUDED.productivity,
  area         = EXCLUDED.area,
  updated_at   = now();

-- ============================================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================================
SELECT
  'conab_data' AS tabela,
  COUNT(*)     AS registros,
  MIN(year)    AS ano_min,
  MAX(year)    AS ano_max,
  COUNT(DISTINCT state)  AS estados,
  COUNT(DISTINCT crop)   AS culturas
FROM public.conab_data;
