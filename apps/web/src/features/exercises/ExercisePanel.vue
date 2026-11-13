<script setup lang="ts">
import type { Exercise } from '@tryit/contracts'

defineProps<{ exercise: Exercise }>()
</script>

<template>
  <section class="panel exercise-panel" aria-labelledby="exercise-title">
    <h2 id="exercise-title">{{ exercise.title }}</h2>
    <p>{{ exercise.statement }}</p>
    <div v-for="(example, index) in exercise.examples" :key="index" class="example">
      <h3>Exemplo</h3>
      <div class="example-grid">
        <div>Entrada<pre>{{ example.input }}</pre></div>
        <div>Saída esperada<pre>{{ example.expected }}</pre></div>
      </div>
    </div>
  </section>
</template>
