<template>
    <label>
        {{ label }}
        <input ref="input" v-bind="$attrs" :value="value" v-on="inputListeners" />
    </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ inheritAttrs: false })
export default class BaseInput extends Vue {
    @Prop() label!: string
    @Prop() value!: string

    $refs!: {
        input: HTMLInputElement;
    }

    public get inputListeners() {
        return Object.assign(
                    {}, 
                    this.$listeners, 
                    { input: (event: Event & { target: { value: HTMLElement }}) => this.$emit('input', event.target.value) }
                )
    }

    public mounted() {
        console.log(this.$attrs)
        console.log(this.$listeners)
        this.$refs.input.focus()
    }
}
</script>