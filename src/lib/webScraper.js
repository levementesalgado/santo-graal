const CONAB_URL =
  "https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaCafe.txt";

const CROP_MAP = {
  "7498": "Café Conillon",
  "7090": "Café Arábica",
};

const ROBUSTA_STATES = new Set(["RO", "AM", "PA"]);

const REGION_MAP = {
  AC: "NORTE", AM: "NORTE", AP: "NORTE", PA: "NORTE",
  RO: "NORTE", RR: "NORTE", TO: "NORTE",
  AL: "NORDESTE", BA: "NORDESTE", CE: "NORDESTE", MA: "NORDESTE",
  PB: "NORDESTE", PE: "NORDESTE", PI: "NORDESTE", RN: "NORDESTE", SE: "NORDESTE",
  DF: "CENTRO-OESTE", GO: "CENTRO-OESTE", MT: "CENTRO-OESTE", MS: "CENTRO-OESTE",
  ES: "SUDESTE", MG: "SUDESTE", RJ: "SUDESTE", SP: "SUDESTE",
  PR: "SUL", RS: "SUL", SC: "SUL",
};

export const parseConabTxt = (raw) => {
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const dataLines = lines.slice(1);
  const records = [];

  dataLines.forEach(line => {
    const cols = line.split(";").map(c => c.trim());
    if (cols.length < 8) return;

    const year = parseInt(cols[0]);
    const uf = cols[2].toUpperCase();
    const idProduto = cols[4];
    const areaHa = parseFloat(cols[5]) || 0;
    const producaoT = parseFloat(cols[6]) || 0;
    const produtividade = parseFloat(cols[7]) || 0;

    if (!year || isNaN(year) || !uf || uf === "NI") return;

    const areaMilHa = areaHa / 1000;
    const producaoMilSacas = producaoT / 60;

    let crop = CROP_MAP[idProduto] ?? "Café";
    if (ROBUSTA_STATES.has(uf) && idProduto === "7090") {
      crop = "Café Robusta";
    }

    const region = REGION_MAP[uf] ?? "SUDESTE";

    records.push({
      id: `conab-${uf}-${year}-${idProduto}`,
      year,
      state: uf,
      region,
      crop,
      production: Math.round(producaoMilSacas * 100) / 100,
      productivity: produtividade,
      area: Math.round(areaMilHa * 100) / 100,
      timestamp: new Date().toISOString(),
    });
  });

  return records;
};

export const scrapeConabData = async () => {
  const encoded = encodeURIComponent(CONAB_URL);
  const proxies = [
    `https://corsproxy.io/?${encoded}`,
    `https://api.allorigins.win/raw?url=${encoded}`,
    `https://cors-anywhere.herokuapp.com/${CONAB_URL}`,
  ];

  let lastError = new Error("Todos os proxies falharam.");

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) { lastError = new Error(`HTTP ${response.status} em ${proxyUrl}`); continue; }
      const text = await response.text();
      if (!text.includes("ano_agricola")) { lastError = new Error("Formato inesperado no arquivo da CONAB."); continue; }
      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError;
};

export const syncAllCrops = async () => {
  try {
    const raw = await scrapeConabData();
    const parsed = parseConabTxt(raw);
    const validation = validateDataIntegrity(parsed);
    if (!validation.isValid) {
      return { success: false, count: 0, message: `Validação falhou: ${validation.errors[0]}` };
    }
    return {
      success: true,
      count: parsed.length,
      message: `${parsed.length} registros obtidos da CONAB (${new Date().toLocaleDateString("pt-BR")}).`,
      data: parsed,
    };
  } catch (error) {
    return { success: false, count: 0, message: error instanceof Error ? error.message : "Erro desconhecido." };
  }
};

export const validateDataIntegrity = (data) => {
  const errors = [];
  data.forEach((entry, idx) => {
    if (entry.production < 0) errors.push(`[${idx}] Produção negativa: ${entry.state} ${entry.year}`);
    if (entry.area < 0) errors.push(`[${idx}] Área negativa: ${entry.state} ${entry.year}`);
    if (entry.year > 2030 || entry.year < 1990) errors.push(`[${idx}] Ano fora do intervalo: ${entry.year}`);
    if (entry.productivity > 15000) errors.push(`[${idx}] Produtividade anômala: ${entry.productivity} kg/ha em ${entry.state}`);
  });
  return { isValid: errors.length === 0, errors };
};

export const parseConabTables = parseConabTxt;

export const scheduleDataUpdate = (intervalInHours = 24) => {
  const next = new Date();
  next.setHours(next.getHours() + intervalInHours);
  localStorage.setItem("conab_next_update", next.toISOString());
};
