import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { languages, type EvaluationRequest, type EvaluationResult, type Exercise } from '@tryit/contracts'
import content from '../../../content/exercises/sum-two-numbers.json'
import { evaluateCase, type Bindings } from './piston'

const { additionalCases, ...exercise } = content
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.get('/health', (c) => c.json({ status: 'ok' }))
app.get('/exercises', (c) => c.json([exercise] satisfies Exercise[]))

function isEvaluationRequest(value: unknown): value is EvaluationRequest {
  if (typeof value !== 'object' || value === null) return false
  const input = value as Partial<EvaluationRequest>
  return typeof input.exerciseId === 'string'
    && typeof input.language === 'string'
    && Object.hasOwn(languages, input.language)
    && (input.mode === 'run' || input.mode === 'submit')
    && typeof input.code === 'string'
    && input.code.trim().length > 0
    && input.code.length <= 16_000
}

app.post('/evaluations', bodyLimit({ maxSize: 80_000 }), async (c) => {
  const input: unknown = await c.req.json().catch(() => null)
  if (!isEvaluationRequest(input)) return c.json({ message: 'Envio inválido.' }, 400)
  if (input.exerciseId !== exercise.id) return c.json({ message: 'Exercício inexistente.' }, 404)

  const url = c.env.PISTON_URL
  const version = input.language === 'java' ? c.env.PISTON_JAVA_VERSION : c.env.PISTON_JAVASCRIPT_VERSION
  if (!url || !version) return c.json({ message: 'Executor indisponível para esta linguagem.' }, 503)

  try {
    const cases = input.mode === 'run' ? exercise.examples : [...exercise.examples, ...additionalCases]
    const results = []
    for (const example of cases) {
      const result = await evaluateCase(url, version, input, example)
      results.push(result)
      if (input.mode === 'submit' && result.verdict !== 'accepted') break
    }
    const verdict = results.find((result) => result.verdict !== 'accepted')?.verdict ?? 'accepted'
    const result: EvaluationResult = input.mode === 'run' ? { verdict, examples: results } : { verdict }
    return c.json(result)
  } catch {
    return c.json({ message: 'Falha ao comunicar com o executor.' }, 502)
  }
})

export default app
