<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div id="window">
    <header>
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/convert">Convert</RouterLink>
          <RouterLink to="/settings">Settings</RouterLink>
          <RouterLink to="/welcome">Welcome</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
    </header>
    <div id="body">
      <RouterView />
    </div>
  </div>
</template>

<!-- <style scoped >
header {
  display: block;
  line-height: 1.5;
  /* max-height: 100vh; */
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  /* header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  } */

  .logo {
    margin: 0 2rem 0 0;
  }

  /* header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  } */

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->

<style scoped lang="scss">

#window {
  display: flex;
  flex-direction: column;
  place-items: center;
  min-height: 100vh;
  max-height: 100vh;
}

header {
  display: flex;
  flex-direction: column;
  place-items: center;
}

#body {
  height: 10px;
  flex: 1 1 auto;
  padding-bottom: 10px;
}

nav {
  padding: 10px;

  a {
    font-weight: bold;
    color: #2c3e50;
    padding: 5px;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
