import type { ConabRecord, ValidationReport } from '@/types'
import { ensemblePredict } from './ml'

interface CropConfig {
  id: string
  name: string
  url: string
  format: 'cafe' | 'graos'
  productIds?: Record<string, string>
}

const CROPS: CropConfig[] = [
  {
    id: 'cafe',
    name: 'Café',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaCafe.txt',
    format: 'cafe',
    productIds: { '7498': 'Café Conillon', '7090': 'Café Arábica' },
  },
  {
    id: 'soja',
    name: 'Soja',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaSoja.txt',
    format: 'graos',
  },
  {
    id: 'milho',
    name: 'Milho',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaMilho.txt',
    format: 'graos',
  },
  {
    id: 'trigo',
    name: 'Trigo',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaTrigo.txt',
    format: 'graos',
  },
  {
    id: 'arroz',
    name: 'Arroz',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaArroz.txt',
    format: 'graos',
  },
  {
    id: 'feijao',
    name: 'Feijão',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaFeijao.txt',
    format: 'graos',
  },
  {
    id: 'algodao',
    name: 'Algodão',
    url: 'https://portaldeinformacoes.conab.gov.br/downloads/arquivos/SerieHistoricaAlgodao.txt',
    format: 'graos',
  },
]

const REGION_MAP: Record<string, string> = {
  AC: "NORTE", AM: "NORTE", AP: "NORTE", PA: "NORTE",
  RO: "NORTE", RR: "NORTE", TO: "NORTE",
  AL: "NORDESTE", BA: "NORDESTE", CE: "NORDESTE", MA: "NORDESTE",
  PB: "NORDESTE", PE: "NORDESTE", PI: "NORDESTE", RN: "NORDESTE", SE: "NORDESTE",
  DF: "CENTRO-OESTE", GO: "CENTRO-OESTE", MT: "CENTRO-OESTE", MS: "CENTRO-OESTE",
  ES: "SUDESTE", MG: "SUDESTE", RJ: "SUDESTE", SP: "SUDESTE",
  PR: "SUL", RS: "SUL", SC: "SUL",
}

const ROBUSTA_STATES = new Set(["RO", "AM", "PA"])

function parseCafeFormat(raw: string, crop: CropConfig): ConabRecord[] {
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0)
  const dataLines = lines.slice(1)
  const records: ConabRecord[] = []

  dataLines.forEach(line => {
    const cols = line.split(";").map(c => c.trim())
    if (cols.length < 8) return

    const year = parseInt(cols[0])
    const uf = cols[2].toUpperCase()
    const idProduto = cols[4]
    const areaHa = parseFloat(cols[5]) || 0
    const producaoT = parseFloat(cols[6]) || 0
    const produtividade = parseFloat(cols[7]) || 0

    if (!year || isNaN(year) || !uf || uf === "NI") return

    const areaMilHa = areaHa / 1000
    const producaoMilSacas = producaoT / 60

    let cropName = crop.productIds?.[idProduto] ?? "Café"
    if (ROBUSTA_STATES.has(uf) && idProduto === "7090") {
      cropName = "Café Robusta"
    }

    records.push({
      id: `conab-${crop.id}-${uf}-${year}-${idProduto}`,
      year,
      state: uf,
      region: REGION_MAP[uf] ?? "SUDESTE",
      crop: cropName,
      production: Math.round(producaoMilSacas * 100) / 100,
      productivity: produtividade,
      area: Math.round(areaMilHa * 100) / 100,
      timestamp: new Date().toISOString(),
    })
  })

  return records
}

function parseGraosFormat(raw: string, crop: CropConfig): ConabRecord[] {
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0)
  const records: ConabRecord[] = []

  lines.forEach(line => {
    const cols = line.split(";").map(c => c.trim())
    if (cols.length < 6) return

    const year = parseInt(cols[0])
    const uf = cols[1]?.toUpperCase()
    const culturaRaw = cols[2]?.toLowerCase() || ''
    const areaHa = parseFloat(cols[3]) || 0
    const producaoT = parseFloat(cols[4]) || 0
    const produtividade = parseFloat(cols[5]) || 0

    if (!year || isNaN(year) || !uf || uf === "NI" || uf === "NI ") return
    if (culturaRaw !== crop.name.toLowerCase() && culturaRaw !== crop.id) return

    const areaMilHa = areaHa / 1000

    records.push({
      id: `conab-${crop.id}-${uf}-${year}`,
      year,
      state: uf,
      region: REGION_MAP[uf] ?? "SUDESTE",
      crop: crop.name,
      production: Math.round((producaoT * 100) / 100),
      productivity: produtividade,
      area: Math.round(areaMilHa * 100) / 100,
      timestamp: new Date().toISOString(),
    })
  })

  return records
}

async function fetchWithProxy(url: string): Promise<string> {
  const encoded = encodeURIComponent(url)
  const proxies = [
    `https://corsproxy.io/?${encoded}`,
    `https://api.allorigins.win/raw?url=${encoded}`,
    `https://cors-anywhere.herokuapp.com/${url}`,
  ]

  let lastError = new Error("Todos os proxies falharam.")

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} em ${proxyUrl}`)
        continue
      }
      const text = await response.text()
      if (text.length < 50) {
        lastError = new Error("Resposta vazia ou muito curta")
        continue
      }
      return text
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError
}

export const parseConabTxt = (raw: string): ConabRecord[] => {
  const cafeConfig = CROPS.find(c => c.id === 'cafe')!
  return parseCafeFormat(raw, cafeConfig)
}

export const scrapeConabData = async (): Promise<ConabRecord[]> => {
  const allRecords: ConabRecord[] = []
  const errors: string[] = []

  const results = await Promise.allSettled(
    CROPS.map(async (crop) => {
      const raw = await fetchWithProxy(crop.url)
      const parsed = crop.format === 'cafe'
        ? parseCafeFormat(raw, crop)
        : parseGraosFormat(raw, crop)
      return { crop: crop.name, records: parsed }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allRecords.push(...result.value.records)
    } else {
      errors.push(result.reason?.message || 'Erro desconhecido')
    }
  }

  if (allRecords.length === 0 && errors.length > 0) {
    throw new Error(`Falha ao buscar dados: ${errors[0]}`)
  }

  return allRecords
}

export const syncAllCrops = async (): Promise<{
  success: boolean
  count: number
  message: string
  data?: ConabRecord[]
}> => {
  try {
    const parsed = await scrapeConabData()
    const validation = validateDataIntegrity(parsed)
    if (!validation.isValid) {
      return { success: false, count: 0, message: `Validação falhou: ${validation.errors[0]}` }
    }
    return {
      success: true,
      count: parsed.length,
      message: `${parsed.length} registros de ${CROPS.length} culturas obtidos da CONAB (${new Date().toLocaleDateString("pt-BR")}).`,
      data: parsed,
    }
  } catch (error) {
    return { success: false, count: 0, message: error instanceof Error ? error.message : "Erro desconhecido." }
  }
}

export const validateDataIntegrity = (data: ConabRecord[]): ValidationReport => {
  const errors: string[] = []
  data.forEach((entry, idx) => {
    if (entry.production < 0) errors.push(`[${idx}] Produção negativa: ${entry.state} ${entry.year} ${entry.crop}`)
    if (entry.area < 0) errors.push(`[${idx}] Área negativa: ${entry.state} ${entry.year} ${entry.crop}`)
    if (entry.year > 2030 || entry.year < 1990) errors.push(`[${idx}] Ano fora do intervalo: ${entry.year}`)
    if (entry.productivity > 50000) errors.push(`[${idx}] Produtividade anômala: ${entry.productivity} kg/ha em ${entry.state} ${entry.crop}`)
  })
  return { isValid: errors.length === 0, errors }
}

export const parseConabTables: typeof parseConabTxt = parseConabTxt

export const scheduleDataUpdate = (intervalInHours: number = 24): void => {
  const next = new Date()
  next.setHours(next.getHours() + intervalInHours)
  localStorage.setItem("conab_next_update", next.toISOString())
}

export { CROPS, ensemblePredict }
