<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { basicSetup, EditorView } from 'codemirror'
import { Compartment, type Extension } from '@codemirror/state'
import type { Language } from '@tryit/contracts'

const props = defineProps<{ language: Language }>()
const code = defineModel<string>({ required: true })
const host = useTemplateRef('host')
const syntax = new Compartment()
let editor: EditorView | undefined

const extensions: Record<Language, () => Promise<Extension>> = {
  javascript: () => import('@codemirror/lang-javascript').then(({ javascript }) => javascript()),
  java: () => import('@codemirror/lang-java').then(({ java }) => java()),
}

watch(() => props.language, async (language, _, onCleanup) => {
  let active = true
  onCleanup(() => { active = false })
  const extension = await extensions[language]().catch(() => [])
  if (active) editor?.dispatch({ effects: syntax.reconfigure(extension) })
}, { immediate: true })

onMounted(() => {
  if (!host.value) return
  editor = new EditorView({
    parent: host.value,
    doc: code.value,
    extensions: [
      basicSetup,
      syntax.of([]),
      EditorView.contentAttributes.of({ 'aria-label': 'Código da solução' }),
      EditorView.theme({ '&': { height: '100%' } }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) code.value = update.state.doc.toString()
      }),
    ],
  })
})

watch(code, (value) => {
  if (editor && editor.state.doc.toString() !== value) {
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
  }
})

onUnmounted(() => editor?.destroy())
</script>

<template>
  <div ref="host" class="code-editor" />
</template>

<style scoped>
.code-editor { min-height: 0; flex: 1; }
</style>
