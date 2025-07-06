<template>
  <div class="sidebar">
    <ul>
      <li>
        <router-link to="/accounts" active-class="active-link">Accounts</router-link>
      </li>
      <li>
        <router-link to="/transactions" active-class="active-link">Transactions</router-link>
      </li>
      <li>
        <router-link to="/categories" active-class="active-link">Categories</router-link>
      </li>
      <li>
        <router-link to="/reports" active-class="active-link">Reports</router-link>
      </li>
      <li>
        <router-link to="/chat" active-class="active-link">Chat</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for static sidebar links
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #2d3a4b;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 16px;
}

a {
  color: #b0bec5;
  text-decoration: none;
  font-weight: 500;
}

a.active-link {
  color: #42b983;
  font-weight: 700;
}
</style>
