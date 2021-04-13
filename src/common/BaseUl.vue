<template>
    <ul>
        <li>原生事件绑定到组件，使用原生native修饰符的事件会绑定到此组件的根元素上1</li>
        <li>原生事件绑定到组件，使用原生native修饰符的事件会绑定到此组件的根元素上2</li>
        <li>原生事件绑定到组件，使用原生native修饰符的事件会绑定到此组件的根元素上3</li>
        <li>原生事件绑定到组件，使用原生native修饰符的事件会绑定到此组件的根元素上4</li>
        <li>原生事件绑定到组件，使用原生native修饰符的事件会绑定到此组件的根元素上5</li>
    </ul>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class BaseUl extends Vue {}
</script>
