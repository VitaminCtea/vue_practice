<template>
	<div class="home">
		<img alt="Vue logo" src="../assets/logo.png" />
		<HelloWorld msg="Welcome to Your Vue.js + TypeScript App" 
            v-model="modelValue" 
            text="我是lala" 
            meesage="success"
        >
            <button @click="changeValue">点我</button>
        </HelloWorld>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

@Component({
	components: {
		HelloWorld,
	},
})
export default class Home extends Vue {
    modelValue = 'modelValue'
    obj = {
        a: '我是a',
        b: '我是b',
        c: '我是c'
    }

    changeValue() {
        switch (this.modelValue) {
            case 'modelValue changed!': this.modelValue = 'modelValue'; break
            case 'modelValue': this.modelValue = 'modelValue changed!'; break
        }
    }
}
</script>
