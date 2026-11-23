/* ═══════════════════════════════════════════════════════════════════
   Função da Vercel: repassa /api/calculadora/* para a API da calculadora.

   A página chama o próprio domínio (campo "Endereço da API" vazio), então
   não há CORS nem conteúdo misto. Quem sai para a internet é esta função,
   e ela só fala com UM destino: o da variável CALC_API_URL, configurada
   no painel da Vercel. Ninguém consegue usá-la para chamar outro site.

   O vercel.json reescreve /api/calculadora/<caminho> para cá com
   ?caminho=<caminho>; o resto da query string segue junto.
   ═══════════════════════════════════════════════════════════════════ */

// Cabeçalhos da resposta que a página precisa ler (o aviso de dados simulados).
const REPASSAR = ['content-type', 'x-warning-dados-simulados']

module.exports = async (req, res) => {
  const destino = (process.env.CALC_API_URL || '').trim().replace(/\/+$/, '')
  if (!destino) {
    return res.status(503).json({
      title: 'API não configurada',
      detail: 'Defina CALC_API_URL nas variáveis de ambiente do projeto na Vercel.',
    })
  }

  const caminho = [].concat(req.query.caminho || []).join('/').replace(/^\/+/, '')
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'caminho') for (const x of [].concat(v)) qs.append(k, x)
  }
  const url = `${destino}/api/calculadora/${caminho}${qs.toString() ? `?${qs}` : ''}`

  const temCorpo = !['GET', 'HEAD'].includes(req.method)
  const corpo = !temCorpo || req.body === undefined ? undefined
    : typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body
      : JSON.stringify(req.body)

  try {
    const r = await fetch(url, {
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'] || 'application/json',
        accept: req.headers.accept || 'application/json',
      },
      body: corpo,
      signal: AbortSignal.timeout(25000),
    })
    for (const h of REPASSAR) {
      const v = r.headers.get(h)
      if (v) res.setHeader(h, v)
    }
    res.status(r.status).send(Buffer.from(await r.arrayBuffer()))
  } catch (e) {
    res.status(502).json({
      title: 'API fora do ar',
      detail: `A Vercel não conseguiu falar com a API da calculadora (${e.name === 'TimeoutError' ? 'demorou mais de 25 s' : e.message}).`,
    })
  }
}
