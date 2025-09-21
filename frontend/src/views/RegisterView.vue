<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" name="username" />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" name="password" />
      </div>
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" name="confirmPassword" />
      </div>
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/auth";

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const router = useRouter();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match");
    return;
  }

  try {
    await register(username.value, password.value);
    alert("Registration successful!");
    router.push("/login");
  } catch (error: any) {
    alert(error.message || "Registration failed");
  }
};
</script>
