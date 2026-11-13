<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { languages, type EvaluationMode, type EvaluationResult, type Exercise, type Language } from '@tryit/contracts'
import CodeEditor from '../features/editor/CodeEditor.vue'
import ExercisePanel from '../features/exercises/ExercisePanel.vue'
import EvaluationPanel from '../features/evaluation/EvaluationPanel.vue'
import { evaluate } from '../features/evaluation/client'

const exercise = ref<Exercise>()
const exerciseError = ref('')
const language = ref<Language>('javascript')
const drafts = ref<Record<string, string>>({})
const busy = ref(false)
const error = ref('')
const result = ref<EvaluationResult | null>(null)
const draftKey = computed(() => `tryit:draft:${exercise.value?.id}:${language.value}`)

const code = computed({
  get() {
    if (draftKey.value in drafts.value) return drafts.value[draftKey.value]
    try {
      return localStorage.getItem(draftKey.value) ?? languages[language.value].starter
    } catch {
      return languages[language.value].starter
    }
  },
  set(value: string) {
    drafts.value[draftKey.value] = value
    try {
      localStorage.setItem(draftKey.value, value)
    } catch {
      // O rascunho continua disponível em memória nesta sessão.
    }
  },
})

async function loadExercise() {
  exerciseError.value = ''
  try {
    const response = await fetch('/api/exercises')
    if (!response.ok) throw new Error()
    const exercises: Exercise[] = await response.json()
    if (!exercises[0]) throw new Error()
    exercise.value = exercises[0]
  } catch {
    exerciseError.value = 'Não foi possível carregar o exercício.'
  }
}

async function run(mode: EvaluationMode) {
  if (!exercise.value || busy.value || !code.value.trim()) return
  busy.value = true
  error.value = ''
  result.value = null
  try {
    result.value = await evaluate({
      exerciseId: exercise.value.id,
      language: language.value,
      code: code.value,
      mode,
    })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Falha ao avaliar o código.'
  } finally {
    busy.value = false
  }
}

function clearResult() {
  result.value = null
  error.value = ''
}

onMounted(loadExercise)
</script>

<template>
  <main class="workspace">
    <header class="topbar"><h1>TryIT</h1></header>
    <div v-if="exercise" class="workspace-grid">
      <ExercisePanel :exercise="exercise" />
      <div class="workspace-code">
        <section class="panel editor-panel" aria-label="Editor">
          <div class="toolbar">
            <label for="language">Linguagem</label>
            <select id="language" v-model="language" :disabled="busy" @change="clearResult">
              <option v-for="(option, id) in languages" :key="id" :value="id">{{ option.label }}</option>
            </select>
            <div class="actions">
              <button class="button primary" :disabled="busy || !code.trim()" @click="run('run')">Executar</button>
              <button class="button" :disabled="busy || !code.trim()" @click="run('submit')">Submeter</button>
            </div>
          </div>
          <CodeEditor :key="draftKey" v-model="code" :language="language" />
        </section>
        <EvaluationPanel :busy="busy" :error="error" :result="result" />
      </div>
    </div>
    <section v-else class="panel" aria-live="polite">
      <template v-if="exerciseError">
        <p>{{ exerciseError }}</p>
        <button class="button" @click="loadExercise">Tentar novamente</button>
      </template>
      <p v-else>Carregando exercício…</p>
    </section>
  </main>
</template>
