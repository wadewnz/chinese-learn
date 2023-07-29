import {
  ref,
  reactive,
  watch
} from 'vue'
import {
  defineStore
} from 'pinia'

type TtsSettings = {
  voiceName: string
  rate: number
  pitch: number
}

type Settings = {
  version: number
  repeatDelay: number
  maxRepeats: number
  maxSequenceRepeats: number
  ttsEnglish: TtsSettings
  ttsCantonese: TtsSettings
  ttsMandarin: TtsSettings
  additionalLines: string
}

const defaultSettings: Settings = {
  version: 1,
  repeatDelay: 1000,
  maxRepeats: 30,
  maxSequenceRepeats: 5,
  ttsEnglish: {
    voiceName: "",
    rate: 1.0,
    pitch: 1
  },
  ttsCantonese: {
    voiceName: "",
    rate: 0.8,
    pitch: 1
  },
  ttsMandarin: {
    voiceName: "",
    rate: 0.8,
    pitch: 1
  },
  additionalLines: "",
}

type VoiceOptions = {
  value: string
  text: string
}

type TempSettings = {
  ttsCantonese: SpeechSynthesisVoice | undefined | null
  ttsMandarin: SpeechSynthesisVoice | undefined | null
  ttsEnglish: SpeechSynthesisVoice | undefined | null
}

const settings = reactive < Settings > (defaultSettings)
const tempSettings = reactive < TempSettings > ({
  ttsCantonese: null, ttsMandarin: null, ttsEnglish: null
})
const listVoiceOptions = ref < VoiceOptions[] > ([])
const listVoices: SpeechSynthesisVoice[] = [];

if ("speechSynthesis" in window) {
  console.log("Your browser supports speech synthesis.")

  // Execute loadVoices.
  loadVoices()

  // Chrome loads voices asynchronously.
  window.speechSynthesis.onvoiceschanged = () => loadVoices()
} else {
  console.log("Sorry your browser does not support speech synthesis.")
}

function loadVoices() {
  const voices = speechSynthesis.getVoices()

  let gVoiceDefault: SpeechSynthesisVoice | null = null
  console.log("loadVoices")

  const hkName = settings.ttsCantonese.voiceName
  const zhName = settings.ttsMandarin.voiceName
  const enName = settings.ttsEnglish.voiceName

  let defHkVoice: SpeechSynthesisVoice | null = null
  let defZhVoice: SpeechSynthesisVoice | null = null
  let defEnVoice: SpeechSynthesisVoice | null = null

  listVoiceOptions.value.splice(0, listVoiceOptions.value.length)
  listVoices.splice(0, listVoices.length)

  voices.forEach(function(voice) {
    listVoices.push(voice)

    let name = voice.name
    if (voice.localService) {
      name += " (local)"
    }
    if (voice.default) {
      name += " [Default]"
    }
    listVoiceOptions.value.push({
      value: voice.name, text: name
    })

    console.log("  name=" + voice.name + " lang=" + voice.lang + " localService=" + voice.localService + " default=" + voice.default + " voiceURI=" + voice.voiceURI);
    if (((voice.lang.startsWith("yue_HK") || voice.lang.startsWith("zh-HK") || voice.lang.startsWith("zh_HK")) && (defHkVoice === null || (voice.localService && !defHkVoice.localService)))) {
      defHkVoice = voice
    }
    if (hkName === voice.name) {
      tempSettings.ttsCantonese = voice
    }
    if (((voice.lang.startsWith("zh-CN") || voice.lang.startsWith("zh_CN")) && (defZhVoice == null || (voice.localService && !defZhVoice.localService)))) {
      defZhVoice = voice
    }
    if (zhName === voice.name) {
      tempSettings.ttsMandarin = voice
    }
    if (((voice.lang.startsWith("en_") || voice.lang.startsWith("en-")) && (defEnVoice == null || (voice.localService && !defEnVoice.localService) || (voice.default && voice.localService && !defEnVoice.default) || (voice.default && !defEnVoice.localService && !defEnVoice.default)))) {
      defEnVoice = voice;
    }
    if (enName === voice.name) {
      tempSettings.ttsEnglish = voice;
    }
    if (voice.default) {
      gVoiceDefault = voice;
    }
  })
  if (!tempSettings.ttsCantonese) {
    tempSettings.ttsCantonese = defHkVoice || gVoiceDefault
  }
  if (!tempSettings.ttsMandarin) {
    tempSettings.ttsMandarin = defZhVoice || gVoiceDefault
  }
  if (!tempSettings.ttsEnglish) {
    tempSettings.ttsEnglish = defEnVoice || gVoiceDefault
  }
  if (tempSettings.ttsCantonese) {
    settings.ttsCantonese.voiceName = tempSettings.ttsCantonese.name
    console.log("HkVoice=" + settings.ttsCantonese.voiceName)
  }
  if (tempSettings.ttsMandarin) {
    settings.ttsMandarin.voiceName = tempSettings.ttsMandarin.name
    console.log("ZhVoice=" + settings.ttsMandarin.voiceName)
  }
  if (tempSettings.ttsEnglish) {
    settings.ttsEnglish.voiceName = tempSettings.ttsEnglish.name
    console.log("EnVoice=" + settings.ttsEnglish.voiceName)
  }
}

watch(() => settings.ttsCantonese.voiceName, (value: string) => {
  tempSettings.ttsCantonese = listVoices.find(v => v.name === value) ?? null
  console.log('cantVoice =', tempSettings.ttsCantonese?.name)
})

watch(() => settings.ttsMandarin.voiceName, (value: string) => {
  tempSettings.ttsMandarin = listVoices.find(v => v.name === value) ?? null
  console.log('mandVoice =', tempSettings.ttsMandarin?.name)
})

watch(() => settings.ttsEnglish.voiceName, (value: string) => {
  tempSettings.ttsEnglish = listVoices.find(v => v.name === value) ?? null
  console.log('englVoice =', tempSettings.ttsEnglish?.name)
})

let isDirty = false
let settingsTimeout = 0

watch(() => settings, () => {
  isDirty = true
  console.log('Settings Dirty')
  if (settingsTimeout !== 0) return
  settingsTimeout = setTimeout(() => {
    settingsTimeout = 0
    if (isDirty) {
      isDirty = false
      console.log('Save Settings')
      localStorage.settings = JSON.stringify(settings)
    }
  },
    30000)
}, {
  deep: true
})

interface LooseObject {
  [key: string]: any
}

function deepExtend(extended: LooseObject, ...args: LooseObject[]): LooseObject {
  //const extended: LooseObject = {}
  const merge = function(obj: LooseObject) {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = deepExtend(extended[prop], obj[prop])
        } else {
          extended[prop] = obj[prop]
        }
      }
    }
  }
  args.forEach(obj => merge(obj))
  return extended
}

if (localStorage.settings) {
  deepExtend(settings, JSON.parse(localStorage.settings))
  console.log('Settings:', settings)
}

export const useSettingsStore = defineStore('settings', () => {
  return {
    settings, tempSettings, listVoiceOptions
  }
})