import { languages, type Example, type EvaluationRequest, type Verdict } from '@tryit/contracts'

export interface Bindings {
  PISTON_URL?: string
  PISTON_JAVASCRIPT_VERSION?: string
  PISTON_JAVA_VERSION?: string
}

interface ProcessResult {
  stdout: string
  stderr: string
  code: number | null
  signal?: string | null
  status?: string | null
}

function normalize(output: string) {
  return output.replace(/\r\n/g, '\n').replace(/\n$/, '')
}

export async function evaluateCase(
  url: string,
  version: string,
  request: EvaluationRequest,
  example: Example,
): Promise<Example & { actual: string; diagnostic: string; verdict: Verdict }> {
  const response = await fetch(new URL('execute', url.replace(/\/?$/, '/')), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      language: request.language,
      version,
      files: [{ name: languages[request.language].file, content: request.code }],
      stdin: example.input,
      compile_timeout: 10_000,
      run_timeout: 3_000,
    }),
  })

  if (!response.ok) throw new Error('Executor returned an HTTP error')

  const { compile, run } = await response.json() as { compile?: ProcessResult; run?: ProcessResult }
  const failedCompilation = compile && (compile.code !== 0 || compile.signal || compile.status)
  const process = failedCompilation ? compile : run
  if (!process) throw new Error('Executor returned no process result')

  let verdict: Verdict = 'accepted'
  if (process.status === 'TO') verdict = 'timeout'
  else if (failedCompilation) verdict = 'compile-error'
  else if (process.code !== 0 || process.signal || process.status) verdict = 'runtime-error'
  else if (normalize(process.stdout) !== normalize(example.expected)) verdict = 'wrong-answer'

  return { ...example, actual: process.stdout, diagnostic: process.stderr, verdict }
}
