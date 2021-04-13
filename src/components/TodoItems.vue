<template>
    <li>
        {{ text }}
        <button @click="$emit('remove')">Remove</button>
    </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class DoSomeThing extends Vue {
    @Prop({ type: String, default: '' }) public readonly text!: string
}
</script>