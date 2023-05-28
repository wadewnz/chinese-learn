<template>
    <button @click="handleClick($event)" :disabled="disabled" :class="{ primary: primary }">
      <slot></slot>
    </button>
  </template>
  
  <script setup lang="ts">
    const props =  defineProps<{
      // onClick?: (event: MouseEvent) => void
      disabled?: boolean
      primary?: boolean
    }>()

    const emit = defineEmits(['click'])

    function handleClick(event: MouseEvent) {
      // if (props.onClick) {
        // props.onClick(event)
      // }
      emit('click', event)
    }
  
  </script>
  
  <style scoped>
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