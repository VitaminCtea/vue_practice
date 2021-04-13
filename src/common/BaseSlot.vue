<template>
	<div class="container">
		<header>
			<slot name="header"></slot>
		</header>
		<main>
			<slot></slot>
		</main>
		<footer>
			<slot name="footer"></slot>
		</footer>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class BaseSlot extends Vue {}
</script>
