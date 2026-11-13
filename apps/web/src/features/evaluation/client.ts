import type { EvaluationRequest, EvaluationResult } from '@tryit/contracts'

export async function evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
  const response = await fetch('/api/evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? 'Falha ao avaliar o código.')
  }
  return response.json()
}
