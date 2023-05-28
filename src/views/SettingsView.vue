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
  </div>
</template>

<script setup lang="ts">
  import { useSettingsStore } from '../stores/settings'
  // import { ref } from 'vue'

  const store = useSettingsStore()


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
</style>
