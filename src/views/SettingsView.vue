<template>
  <div id="page">
    <div>
      <label for="englVoice">English Voice</label><br/>
      <select v-model="store.settings.ttsEnglish.voiceName" id="englVoice">
        <option v-for="(i, index) in store.listVoiceOptions" :key="index" :value="i.value" :text="i.text" />
      </select><br/>
      <label for="englRate">Rate</label><input type="range" min="0.5" max="2" v-model="store.settings.ttsEnglish.rate" step="0.1" id="englRate"> <span>{{ store.settings.ttsEnglish.rate }}</span><br/>
      <label for="englPitch">Pitch</label><input type="range" min="0" max="2" v-model="store.settings.ttsEnglish.pitch" step="0.1" id="englPitch"> <span>{{ store.settings.ttsEnglish.pitch }}</span>
    </div>
    <div>
      <label for="cantVoice">Cantonese Voice</label><br/>
      <select v-model="store.settings.ttsCantonese.voiceName" id="cantVoice">
        <option v-for="(i, index) in store.listVoiceOptions" :key="index" :value="i.value" :text="i.text" />
      </select><br/>
      <label for="cantRate">Rate</label><input type="range" min="0.5" max="2" v-model="store.settings.ttsCantonese.rate" step="0.1" id="cantRate"> <span>{{ store.settings.ttsCantonese.rate }}</span><br/>
      <label for="cantPitch">Pitch</label><input type="range" min="0" max="2" v-model="store.settings.ttsCantonese.pitch" step="0.1" id="cantPitch"> <span>{{ store.settings.ttsCantonese.pitch }}</span>
    </div>
    <div>
      <label for="mandVoice">Mandarin Voice</label><br/>
      <select v-model="store.settings.ttsMandarin.voiceName" id="mandVoice">
        <option v-for="(i, index) in store.listVoiceOptions" :key="index" :value="i.value" :text="i.text" />
      </select><br/>
      <label for="mandRate">Rate</label><input type="range" min="0.5" max="2" v-model="store.settings.ttsMandarin.rate" step="0.1" id="mandRate"> <span>{{ store.settings.ttsMandarin.rate }}</span><br/>
      <label for="mandPitch">Pitch</label><input type="range" min="0" max="2" v-model="store.settings.ttsMandarin.pitch" step="0.1" id="mandPitch"> <span>{{ store.settings.ttsMandarin.pitch }}</span>
    </div>
    <div>
      <label for="repeatDelay">Repeat Delay </label><input type="number" min="0" max="10000" v-model="store.settings.repeatDelay" id="repeatDelay"/>
    </div>
    <div>
      <label for="maxRepeats">Max Repeats </label><input type="number" min="0" max="100" v-model="store.settings.maxRepeats" id="maxRepeats"/>
    </div>
    <div>
      <label for="maxSequenceRepeats">Max Sequence Repeats </label><input type="number" min="0" max="100" v-model="store.settings.maxSequenceRepeats" id="maxSequenceRepeats"/>
    </div>
    <div>
      <label for="script">Script </label>
      <select v-model="store.settings.scriptName" id="script">
        <option value="[default]" text="[default]" />
        <option v-for="(i, index) in store.settings.scripts" :key="index" :value="i.name" :text="i.name" />
      </select><br/>
      
      <div v-if="scriptIndex >= 0">
        <label for="scriptName">Script Name </label><input type="text" v-model="store.settings.scripts[scriptIndex].name" id="scriptName"/><br/>
        <textarea id="lines" rows="8" cols="80" v-model="store.settings.scripts[scriptIndex].lines"></textarea><br/>
        <button @click="handleAddClick" >Add</button> <button @click="handleDeleteClick" >Delete</button>
      </div>
      <button v-else @click="handleAddClick" >Add</button>
      
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingsStore } from '../stores/settings'
  import { ref, watch } from 'vue'

  const store = useSettingsStore()

  const scriptIndex = ref<number>(-1)

  watch(() => store.settings.scriptName, (a) => {
    console.log(`scriptName = ${a}`)
    scriptIndex.value = store.settings.scripts.findIndex((i) => i.name === a)
  }, { immediate: true } )

  watch(() => store.settings.scripts, () => {
    if (scriptIndex.value < 0) return
    console.log('scripts changed')
    if (store.settings.scriptName !== store.settings.scripts[scriptIndex.value].name) {
      console.log(`new script name = ${store.settings.scripts[scriptIndex.value].name}`)
      store.settings.scriptName = store.settings.scripts[scriptIndex.value].name
    }
  }, {
  deep: true
})

function handleAddClick() {
    let idx = 0
    let name = '[New]'
    while (store.settings.scripts.findIndex((i) => i.name === name) >= 0) {
      ++idx
      name = '[New ' + idx + ']'
    }
    store.settings.scripts.push({name, lines:''})
    store.settings.scriptName = name
  }

  function handleDeleteClick() {    
    if (scriptIndex.value < 0) return
    store.settings.scripts.splice(scriptIndex.value, 1)
    store.settings.scriptName = '[default]'
  }
</script>

<style scoped>
#page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-height: 100%;
  overflow-y: auto;  
}
#additionalLines {
  margin: 0 8px;
  width: 98vw
}
button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
  }
  
  button.primary {
    background-color: #007bff;
    color: #fff;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
