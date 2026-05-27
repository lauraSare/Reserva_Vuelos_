<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

onMounted(() => {
  // Hacer SweetAlert disponible globalmente
  window.Swal = Swal
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #0f0508;
  color: #f0e8e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0f0508;
}

::-webkit-scrollbar-thumb {
  background: #c9a84c;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #f0c96b;
}
</style>