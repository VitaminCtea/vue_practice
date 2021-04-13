<template>
    <p class="base-count-down">{{ formatTimeDownState() }}</p>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

type TimeDown<N> = { ss: N; mm: N; hh: N; dd: N }

@Component
export default class BaseCountDown extends Vue {
    @Prop({ type: Object }) readonly date!: { [K in 'day' | 'hour' | 'minutes' | 'seconds']?: number }
    @Prop({ type: Function }) readonly propCallback?: () => void

    public timeDownState: TimeDown<number> | TimeDown<string> = { dd: 0, hh: 0, mm: 0, ss: 0 }
    public timer: unknown = null

    public mounted() {
        this.createTimeDown(this.toMillisecond, this.propCallback)
    }

    private get toMillisecond() {
        return Object.entries(this.date).reduce((totalMillisecond, [ key, value ]) => {
            switch (key) {
                case 'day': totalMillisecond += 1000 * 60 * 60 * 24 * value!; break
                case 'hour': totalMillisecond += 1000 * 60 * 60 * value!; break
                case 'minutes': totalMillisecond += 1000 * 60 * value!; break
                case 'seconds': totalMillisecond += 1000 * value!; break
            }
            return totalMillisecond
        }, 0)
    }

    private createTimeDown(timestamp: number, callback?: () => void | null, delay = 1000) {
        this.timeDownState = this.updateTimeDownState(this.timeDownState as TimeDown<number>, true, timestamp)
        const run = callback ? this.run.bind(this, callback) : this.run.bind(this)
        this.timer = setInterval(run, delay)
    }

    private run(callback: () => void) {
        if (Object.values(this.timeDownState).every(time => !+time)) {
            clearInterval(this.timer as number)
            this.timer = null
            callback && callback()
            return
        }

        this.timeDownState = this.formatTime(this.timeDownState as TimeDown<number>)
    }

    private formatTime(timeState: TimeDown<number>): TimeDown<string> {
        timeState.ss > 0
                ? timeState.ss--
                : timeState.mm > 0
                ? (timeState.ss = 59) && timeState.mm--
                : timeState.hh > 0
                        ? (timeState.mm = timeState.ss = 59) && timeState.hh--
                        : timeState.dd > 0
                                ? (timeState.mm = timeState.ss = 59) && (timeState.hh = 23) && timeState.dd--
                                : timeState.dd

        return this.updateTimeDownState(this.timeDownState as TimeDown<number>)
    }

    private updateTimeDownState(state: TimeDown<number>, isInitialization = false, timestamp?: number) {
        type Key = keyof TimeDown<string>
        let dates: number[]
        if (isInitialization && timestamp) dates = this.millisecondToTime(timestamp)
        return Object.keys(state).reduce(
                (result, key, index) => ((result[key as Key] = this.fillZero(dates ? dates[index] : state[key as Key])), result),
                {} as TimeDown<string>
        )
    }

    private millisecondToTime(timestamp: number) {
        return [
            (timestamp / (1000 * 60 * 60 * 24)) | 0,
            ((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) | 0,
            ((timestamp % (1000 * 60 * 60)) / (1000 * 60)) | 0,
            ((timestamp % (1000 * 60)) / 1000) | 0,
        ]
    }

    private fillZero(num: number, digit = 2) {
        return '0000000000'.substring(0, digit - (num + '').length) + num
    }

    private formatTimeDownState() {
        const { dd, hh, mm, ss } = this.timeDownState
        return `${ dd }:${ hh }:${ mm }:${ ss }`
    }
}
</script>