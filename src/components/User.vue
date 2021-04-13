<template>
    <div id="user">
        <h2>User {{ id }}</h2>
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component
export default class User extends Vue {
  @Prop(Number) readonly id!: string
}
</script>