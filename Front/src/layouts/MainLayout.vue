<template>
  <div class="contenedorNav">
    <AppBar />
    <SideNav />
    <main >
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppBar from "@/components/AppBar.vue"
import SideNav from "@/components/SideNav.vue"
</script>
<style scoped>
.contenedorNav{
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    flex:1;
}
main{
    flex:1;
    margin-top: 130px;
    padding:16px;
    display: flex;
    flex-direction: row;
}
</style>