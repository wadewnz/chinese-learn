<template> 
  <div id="page">
    <div id="toolbar">
      <BaseButton @click="selectAll">SelectAll</BaseButton>
      <BaseButton @click="selectNone">SelectNone</BaseButton>
      <input type="checkbox" id="repeat" v-model="repeat"/><label for="repeat">Repeat</label>
      <BaseButton @click="play($event, -1)" >{{ playLabel() }}</BaseButton>
      <select v-model="store.settings.scriptName" id="script">
        <option value="[default]" text="[default]" />
        <option v-for="(i, index) in store.settings.scripts" :key="index" :value="i.name" :text="i.name" />
      </select>
    </div>
    <div class="ttsLabel" v-if="ttsLabel">{{ ttsLabel }} [ Repeats: {{ playCurrentCount }}/{{ maxRepeats }}]</div>
    <div class="ttsLabel" v-else></div>
    <table>
      <thead>
        <tr>
          <th v-for="(column, index) in columns" :key="index">
            <div class="resizable-column" :style="{ width: column.width + 'px' }" >
              {{ column.name }}
              <div class="resize-handle"
                @pointerdown="startResize($event, index)"></div>
            </div>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows"
            :key="row[0]"
            :class="{ 'selected': isRowSelected(rowIndex) }"
            @click="toggleRowSelection($event, rowIndex)"
            @dblclick="play($event, rowIndex)"
            v-long-press:1000="longPress2" v-long-press:start="longPress"
        >
          <td v-if="isSingleRow(rowIndex)" :colspan="columns.length">{{ row[3] }}</td>
          <td v-else v-for="(column) in columns"
              :key="column.name"
              :style="{ width: `${column.width}px` }"
          >
            {{ row[column.field] }}
          </td>
          <td><BaseButton v-if="isPlayRow(rowIndex)" @click="play($event, rowIndex)" >{{ rowLabel(rowIndex) }}</BaseButton></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import { parse } from '@vanillaes/csv'
import { useSettingsStore } from '@/stores/settings'

interface Column {
  name: string
  field: number
  width: number
}

type Row = string[]
  // id: number
  // [key: string]: any
//}

// async function getFileText(filePath: string): Promise<string> {
//   const response = await fetch(filePath);
//   const text = await response.text();
//   return text;
// }

// //                let words = $.csv.toArrays(data);
// const fileText = await getFileText('../assets/CantUpperBeginner.csv')
// console.log(fileText);

function getFileText(filePath: string): Promise<string> {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }
      return response.text()
    })
    .catch(error => {
      console.error(error)
      throw error
    })
}
let fileRows:string[][] = [[]]

// const filePath = (document.getElementById ('base') as HTMLBaseElement).href + 'CantUpperBeginner.csv'
const filePath = 'lists/CantUpperBeginner.csv'
 getFileText(filePath)
  .then(fileText => {
    let data = parse(fileText)
    data.splice(0, 1)  // remove header
    //rows.value = data
    fileRows = [...data]
    console.log('scriptIndex='+scriptIndex.value)
    if (scriptIndex.value >= 0 && store.settings.scripts[scriptIndex.value].lines) {
      let lines = store.settings.scripts[scriptIndex.value].lines.split('\n').filter((i) => i).map((t, i) => [`${i}`, '', '', t.trim(), 'additional'])
      rows.value = lines //.splice(0, 0, ...lines)
    }
    else {
      rows.value = fileRows
    }

    // if (store.settings.additionalLines) {
    //   let lines = store.settings.additionalLines.split('\n').map((t, i) => [`${i}`, '', '', t.trim(), 'additional'])
    //   rows.value.splice(0, 0, ...lines)
    // }
    // console.log(data)
  })
 .catch(error => console.error(error))

let width = window.innerWidth - 200

const columns = ref<Column[]>([
  { name: 'Chinese', field: 1, width: width * 3 / 12 },
  { name: 'Jyutping', field: 2, width: width / 3 },
  { name: 'English', field: 3, width: width / 3 },
  { name: 'Type', field: 4, width: width / 12 },
])

const rows = ref<Row[]>([
  ['0', '1', '2', '3', '4'],
  ['1', '11', '22', '33', '44'],
  ['2', '111', '222', '333', '444'],
  ['3', '1111', '2222', '3333', '4444'],
  ['4', '11111', '22222', '33333', '44444'],
  ['5', '111111', '222222', '333333', '444444'],
])

let selectedRowIndexes = ref<number[]>([])
let lastSelectedIndex = -1
let isSelect = false
let resizingColumnIndex: number | null = null
let resizeStartX: number | null = null
let resizeStartWidth: number | null = null
const repeat = ref(false)
let playingRow = ref('')

// const selectedRowsData = computed((): Row[] | null => {
//     if (selectedRowIndexes.length > 0) {
//       return selectedRowIndexes.map(rowIndex => rows.value[rowIndex]);
//     } else {
//       return null;
//     }
//   })

function selectAll(): void {
    for (let i = 0; i < rows.value.length; ++i) {
      if (!isPlayRow(i)) continue
      const index = selectedRowIndexes.value.indexOf(i)
      if (index === -1) {
        selectedRowIndexes.value.push(i)            
      }
    }
    selectedRowIndexes.value.sort()
    lastSelectedIndex = -1
    isSelect = false
  }

  function selectNone(): void {
    selectedRowIndexes.value = []
    lastSelectedIndex = -1
    isSelect = false
  }

  function isRowSelected(rowIndex: number): boolean {
    return selectedRowIndexes.value.indexOf(rowIndex) !== -1
  }

  function isSingleRow(rowIndex: number): boolean {
    return rows.value[rowIndex][3].startsWith('#') || rows.value[rowIndex][4] == 'additional'
  }

  function isPlayRow(rowIndex: number): boolean {
    return !rows.value[rowIndex][3].startsWith('#') && rows.value[rowIndex][4] !== 'additional' || isChineseRow(rowIndex)
  }

  function rowLabel(rowIndex: number): string {
    return rows.value[rowIndex][0] === playingRow.value ? 'Stop' : 'Play'
  }

  function playLabel(): string {
    return ttsState.value === 'idle' ? 'Play' : 'Stop'
  }

  function isChineseRow(rowIndex: number) {
    let row = rows.value[rowIndex]
    //console.log(`${rowIndex} = ${row[4]}`)
    if (row[4] === "additional" && row[3]) {
      let ratio = filterChinese(row[3]).length / row[3].length
      //console.log(`ratio=${ratio} - ${row[3]}`)
      return ratio > 0.33
    }
    return false
  }

  function filterChinese(text: string): string {
	  return text.replace(/[^\u2E80-\u2ff0\u30A1-\uff00（），。？?!！⋯ /.]/gu, '')
  }

  function toggleRowSelection(event: MouseEvent, rowIndex: number) {
    if ((longPressed || event.shiftKey) && lastSelectedIndex >= 0) {
      // console.log("shiftKey")
      for (let i = Math.min(lastSelectedIndex, rowIndex); i <= Math.max(lastSelectedIndex, rowIndex); ++i) {
        const index = selectedRowIndexes.value.indexOf(i)
        if (isSelect) {
          if (index === -1) {
            selectedRowIndexes.value.push(i)            
          }
        } else if (index !== -1) {
          selectedRowIndexes.value.splice(index, 1)
        }
      }
      selectedRowIndexes.value.sort()
    } else {
      const index = selectedRowIndexes.value.indexOf(rowIndex)
      if (index !== -1) {
        selectedRowIndexes.value.splice(index, 1)
        // console.log(`Remove rowIndex ${rowIndex}`)
      } else {
        selectedRowIndexes.value.push(rowIndex)
        selectedRowIndexes.value.sort()
        if (rows.value[rowIndex][1]) {
          navigator.clipboard.writeText(rows.value[rowIndex][1])
        }
        // console.log(`Add rowIndex ${rowIndex}`)
      }
      isSelect = index === -1
    }
    lastSelectedIndex = rowIndex    
  }

function startResize(event: MouseEvent, index: number) {  
  resizingColumnIndex = index
  resizeStartX = event.clientX
  resizeStartWidth = columns.value[index].width
  window.addEventListener('pointermove', doResize)
  window.addEventListener('pointerup', stopResize)
}

function doResize(event: MouseEvent) {
  if (resizingColumnIndex !== null) {
    // console.log('doResize:' + resizeStartWidth)
    const delta = event.clientX - (resizeStartX as number)
    columns.value[resizingColumnIndex].width = (resizeStartWidth as number) + delta
  }
}

function stopResize() {
  // console.log('stopResize')
  resizingColumnIndex = null
  resizeStartX = null
  resizeStartWidth = null
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
}

type PlayListItem = {
  type: string
  text: string
  label: string
}
let playIndex = -1
let playList: PlayListItem[] = []
const playCurrentCount = ref(0)
const maxRepeats = ref(0)
let playSequenceCount = 0
const ttsLabel = ref('')

function play(event: MouseEvent, rowIndex: number) {
  ttsCancel = false
  if (rowIndex === -1) {
    if (ttsState.value === 'idle') {
      playList = []
      playIndex = -1
      selectedRowIndexes.value.forEach(i => {
        if (rows.value[i][1] && !rows.value[i][3].startsWith('#')) { 
          console.log(`RowId=${rows.value[i][0]}`)
          const label = `${rows.value[i][1]} - ${rows.value[i][2]} - ${rows.value[i][3]}`
          if (repeat.value) {
            playList.push({ type: 'E', text: rows.value[i][3], label})
          }
          playList.push({ type: 'C', text: rows.value[i][1], label})
        }
        else if (isChineseRow(i)) {
          const label = `${rows.value[i][3]} - ${rows.value[i+1][3]}`
          playList.push({ type: 'C', text: rows.value[i][3], label})
        }
      })
      playTts()
      return
    }
    stopHandler()

    return
  }
  if (!longPressed) {
    console.log(JSON.stringify(rows.value[rowIndex], null, 2))
    let row = rows.value[rowIndex]
    if (row[1] || row[4] == 'additional' && row[3]) {
      if (ttsState.value !== 'idle' && row[0] === playingRow.value) {
        stopHandler()
        return
      }
      else if (ttsState.value === 'idle') {
        playingRow.value = row[0]
        if (store.tempSettings.ttsCantonese) {
          utterance.voice = store.tempSettings.ttsCantonese
          utterance.lang = store.tempSettings.ttsCantonese.lang
        }
        utterance.pitch = store.settings.ttsCantonese.pitch
        utterance.rate = store.settings.ttsCantonese.rate
        if (row[4] == 'additional') {
          ttsLabel.value = (rowIndex > 0 ? `${rows.value[rowIndex - 1][3]} - ` : '') + `${row[3]}` + (rowIndex + 1 < rows.value.length ? ` - ${rows.value[rowIndex + 1][3]}` : '')
          utterance.text = row[3]
        }
        else {
          ttsLabel.value = `${row[1]} - ${row[2]} - ${row[3]}`
          utterance.text = row[1]
        }
        playCurrentCount.value = 0
        maxRepeats.value = store.settings.maxRepeats
        console.log(`Play: ${utterance.lang} - ${utterance.text}`)
        window.speechSynthesis.speak(utterance)
      }
    }
    // window.speechSynthesis.pause();
    // window.speechSynthesis.resume();
  }
  event.stopPropagation()
}

interface CancellablePromise<T> extends Promise<T> {
  cancel: handler
}

type WaitPromise = CancellablePromise<number>

function delay(milliseconds: number): WaitPromise {
  let waitTimeout = -1
  let resolveCb: (a: number) => void
  let p = new Promise<number>(resolve => {
    resolveCb = resolve
    console.log('wait timeout')
    waitTimeout = setTimeout(() => {         
      waitTimeout = -1
      console.log('timeout done')
      resolve(0)
    }, milliseconds)
  }) as WaitPromise
  p.cancel = () => {
    if (waitTimeout >= 0) {
      console.log('timeout cancelled')
      clearTimeout(waitTimeout)
      waitTimeout = -1
      ttsCancel = true
      ttsDone()
      resolveCb(-1)
    }
  }
  return p
}

const stopTts = () => {
  console.log('stopTts')
  ttsCancel = true
  window.speechSynthesis.cancel()
  ttsDone()
}

type handler = () => void
let stopHandler: handler = stopTts
let ttsCancel = false

function playTts(): void {

  const ttsType = playIndex >= 0 ? playList[playIndex].type : ''
  const first = playIndex === -1
  if (playIndex === -1 || !repeat.value || ttsType === 'E' || ++playCurrentCount.value >= store.settings.maxRepeats) {
    if (first) {
      playSequenceCount = 0
    }
    if (repeat.value || ++playIndex >= playList.length) {
      console.log('Tts Sequence Done')
      if (++playSequenceCount >= store.settings.maxSequenceRepeats) {
        console.log('Max Tts Sequence Done')
        ttsCancel = true
        ttsDone()
        return
      }
      playIndex = 0
    }
    playCurrentCount.value = 0
    if (ttsType !== playList[playIndex].type) {
      if (playList[playIndex].type === 'E') {
        maxRepeats.value = 1
        if (store.tempSettings.ttsEnglish) {
          utterance.voice = store.tempSettings.ttsEnglish
          utterance.lang = store.tempSettings.ttsEnglish.lang
        }
        utterance.pitch = store.settings.ttsEnglish.pitch
        utterance.rate = store.settings.ttsEnglish.rate
      } else {
        maxRepeats.value = store.settings.maxRepeats
        if (store.tempSettings.ttsCantonese) {
          utterance.voice = store.tempSettings.ttsCantonese
          utterance.lang = store.tempSettings.ttsCantonese.lang
        }
        utterance.pitch = store.settings.ttsCantonese.pitch
        utterance.rate = store.settings.ttsCantonese.rate
      }
    }
    ttsLabel.value = playList[playIndex].label
    utterance.text = playList[playIndex].text
    console.log(`Playing: ${utterance.lang} - ${utterance.text}`)
  } else {
    console.log('Repeat')
  }
  if (!first) {
    const p = delay(store.settings.repeatDelay)
    stopHandler = p.cancel;
    (async () => {
      if (await p === 0) {
        window.speechSynthesis.speak(utterance)
      }
    })()
  }
  else {
    window.speechSynthesis.speak(utterance)
  }
}

const store = useSettingsStore()

const ttsState = ref('idle')

let utterance = new SpeechSynthesisUtterance()
utterance.onstart = ttsStart
utterance.onend = ttsDone

function ttsDone() {
  console.log('ttsDone')
  if (!ttsCancel) {
    if (playIndex >= 0) {
      playTts()
      return
    }
    if (repeat.value && ++playCurrentCount.value <= store.settings.maxRepeats) {
      const p = delay(store.settings.repeatDelay)
      stopHandler = p.cancel;
      (async () => {
        if (await p === 0) {
          window.speechSynthesis.speak(utterance)
        }
      })()
      return
    }
  }
  ttsState.value = 'idle'
  playingRow.value = ''
  playIndex = -1
  ttsLabel.value = ''
}

function ttsStart() {
  console.log('ttsStart')
  ttsState.value = 'playing'
  stopHandler = stopTts
}

let longPressed = false

function longPress() {
  // console.log('Long Press')
  longPressed = false
}

function longPress2() {
  console.log('Long Press2')
  longPressed = true
}

/*
watch(() => store.settings.additionalLines, (a) => {
  while (rows.value.length && rows.value[0][4] == 'additional') {
    rows.value.splice(0, 1);
  }
  if (a) {
    let lines = a.split('\n').map((t, i) => [`${i}`, '', '', t.trim(), 'additional'])
    rows.value.splice(0, 0, ...lines)
  }
})
*/
const scriptIndex = ref<number>(store.settings.scripts.findIndex((i) => i.name === store.settings.scriptName))

watch(() => store.settings.scriptName, (a) => {
  console.log('ScriptName='+a)
  const lastIndex = scriptIndex.value
  scriptIndex.value = store.settings.scripts.findIndex((i) => i.name === a)
  console.log('lastIndex=' + lastIndex+' scriptIndex='+scriptIndex.value)
  if (lastIndex == scriptIndex.value) return
  // while (rows.value.length && rows.value[0][4] == 'additional') {
  //   rows.value.splice(0, 1);
  // }

  selectedRowIndexes.value = []
  lastSelectedIndex = -1
  isSelect = false
  playingRow.value = ''
  playIndex = -1
  playList = []
  playCurrentCount.value = 0
  maxRepeats.value = 0
  playSequenceCount = 0
  ttsLabel.value = ''

  if (scriptIndex.value >= 0) {
    console.log('lines=' + store.settings.scripts[scriptIndex.value].lines)
  }
  if (scriptIndex.value >= 0 && store.settings.scripts[scriptIndex.value].lines) {
    const lines = store.settings.scripts[scriptIndex.value].lines.split('\n').filter((i) => i).map((t, i) => [`${i}`, '', '', t.trim(), 'additional'])
    rows.value = lines //.splice(0, 0, ...lines)
  }
  else {
    rows.value = fileRows
  }
} )

// navigator.permissions.query({ name: PermissonName. "write-on-clipboard" }).then((result) => {
//   if (result.state == "granted" || result.state == "prompt") {
//     alert("Write access granted!");
//   }
// });

// const copyContent = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       console.log('Content copied to clipboard');
//     } catch (err) {
//       console.error('Failed to copy: ', err);
//     }
//   }

</script>
  
<style scoped>

#page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  max-height: 100%;
  max-width: 100vw;
}
table {
  display: inline-block;
  overflow-y: auto;
  border-collapse: collapse;
  user-select: none;
  flex-grow: 1 1 auto;
  max-width: 100vw;
}
 
th,
td {
  padding: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
 
th {
  position: sticky;
  top: 0;
  background: #5cb85c;
  text-align: left;
  font-weight: normal;
  font-size: 1.1rem;
  color: white;
  z-index: 20;
}
 
th:last-child {
  border: 0;
}
 
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: black;
  opacity: 0;
  width: 3px;
  cursor: col-resize;
}
 
.resize-handle:hover,
.header--being-resized .resize-handle {
  opacity: 0.5;
}
 
th:hover .resize-handle {
  opacity: 0.3;
}
 
td {
  padding-top: 10px;
  padding-bottom: 10px;
  color: #808080;
}
 
tr:nth-child(even) td {
  background: #f8f6ff;
}

.resizable-column {
  position: relative;
}

.resize-handle {
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  background-color: #ddd;
  z-index: 10;
}

tr.selected td {
  background-color: yellow
}
tr.selected:nth-child(even) td {
  background-color: gold
}

#toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ttsLabel {
  max-width: 100vw;
  height:58px;
  white-space: normal;
}

</style>