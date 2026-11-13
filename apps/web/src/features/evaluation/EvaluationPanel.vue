<script setup lang="ts">
import type { EvaluationResult, Verdict } from '@tryit/contracts'

defineProps<{ busy: boolean; error: string; result: EvaluationResult | null }>()

const labels: Record<Verdict, string> = {
  accepted: 'Aprovado',
  'wrong-answer': 'Resposta incorreta',
  'compile-error': 'Erro de compilação',
  'runtime-error': 'Erro de execução',
  timeout: 'Tempo limite excedido',
}
</script>

<template>
  <section class="panel result-panel" aria-labelledby="result-title">
    <h2 id="result-title">Resultado</h2>
    <div role="status">
      <p v-if="busy">Executando…</p>
      <p v-else-if="error">{{ error }}</p>
      <template v-else-if="result">
        <p><strong>{{ labels[result.verdict] }}</strong></p>
        <div v-for="(example, index) in result.examples" :key="index" class="example-grid">
          <div>Saída esperada<pre>{{ example.expected }}</pre></div>
          <div>Saída obtida<pre>{{ example.actual }}</pre></div>
          <pre v-if="example.diagnostic">{{ example.diagnostic }}</pre>
        </div>
      </template>
      <p v-else>Execute o código para conferir a saída.</p>
    </div>
  </section>
</template>
