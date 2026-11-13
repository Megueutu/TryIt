export const languages = {
  javascript: { label: 'JavaScript', file: 'main.js', starter: '// Escreva sua solução aqui.\n' },
  java: { label: 'Java', file: 'Main.java', starter: 'public class Main {\n    public static void main(String[] args) {\n        // Escreva sua solução aqui.\n    }\n}\n' },
} as const

export type Language = keyof typeof languages
export type EvaluationMode = 'run' | 'submit'

export interface Example {
  input: string
  expected: string
}

export interface Exercise {
  id: string
  title: string
  statement: string
  examples: Example[]
}

export interface EvaluationRequest {
  exerciseId: string
  language: Language
  mode: EvaluationMode
  code: string
}

export type Verdict = 'accepted' | 'wrong-answer' | 'compile-error' | 'runtime-error' | 'timeout'

export interface EvaluationResult {
  verdict: Verdict
  examples?: Array<Example & { actual: string; diagnostic: string; verdict: Verdict }>
}
