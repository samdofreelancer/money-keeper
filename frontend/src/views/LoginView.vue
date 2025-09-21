<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" name="username" />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" name="password" />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api/auth";

const username = ref("");
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await login(username.value, password.value);
    alert("Login successful! Token: " + response.token);
    router.push("/");
  } catch (error: any) {
    alert(error.message || "Login failed");
  }
};
</script>
