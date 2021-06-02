<template>
    <div class="hello">
        <BaseCountDown
                :date="{ day: 1, hour: 4, minutes: 10, seconds: 30 }"
                :prop-callback="printCountDownOverInfo"/>

        <BaseRadar
            :width="400"
            :height="400"
            :data="[ 'BMI', '高血脂', '糖尿病史', '年龄', '吸烟情况', '高血压病史' ]"
            :legend="{
                data: ['当前风险: 0.03%', '理想风险: 0.01%', '华为Mate系列手机'],
                colors: ['#ff0000', '#56A3F1', '#d90086'],
                margin: 20
            }"
        />

        <form action="">
            <base-input v-model="username" label="username" :required="true" placeholder="Enter your username"/>
            <input type="submit" @click.prevent=""/>
        </form>
    </div>
</template>

<script lang="ts">
import {Component, Model, Prop, Vue, Watch} from 'vue-property-decorator'
import BaseInput from '@/common/BaseInput.vue'
import BaseCountDown from "@/common/BaseCountDown.vue"
import BaseRadar from '@/common/BaseRadar.vue'
import { BST } from "@/utils"
import { stringify } from "@/utils/stringify"
import { nextTick, withMacroTask } from "@/utils/nextTick"

type DateRange<T extends boolean = boolean> = { days: number; isFuture?: T; isContainToday?: T; separator?: string }

const bst = new BST<string, number>()
const data = ['S', 'E', 'A', 'R', 'C', 'H', 'E', 'X', 'A', 'M', 'P', 'L', 'E', 'V', 'Y', 'Z']
data.forEach((item, index) => bst.put(item, index))

console.log(bst)
console.log(`获取BST树中A的值: ${ bst.get('A') }`)
console.log(`BST树中最大值是: ${ bst.max() }`)
console.log(`BST树中最小值是: ${ bst.max() }`)
console.log(`BST key G floor是: ${ bst.floor('G') }`)
console.log(`BST key G ceil是: ${ bst.ceil('G') }`)
console.log(`BST select 3: ${ bst.select(3) }`)
console.log(`BST key R 的排名: ${ bst.rank('R') }`)

// bst.deleteMin()
// bst.deleteMax()
// bst.delete('E')

console.log(bst.keys())
console.log(bst.rangeKeys('F', 'T'))

const strategyForm = {
    empty<T extends string>(val: T, errorMsg: T) {
        if (!val) return errorMsg
    },
    minLength<T extends string>(val: T, len: number, errorMsg: T) {
        if (val.length < len) return errorMsg
    },
    checkPhone<T extends string>(val: T, errorMsg: T) {
        if (!/^1(?=(3|5|7|8[0-9]))(?=[0-9]{4}[0-9]{4})\d{10}$/.test(val) && val.length !== 11) return errorMsg
    }
}

class Validator {
    private readonly checkRules: Function[] = []

    public addRule<T extends string>(val: T, rules: { strategy: T; errorMessage: T }[]) {
        rules.forEach(rule => {
            const checkInfo = rule.strategy.split(':')
            this.checkRules.push(() => {
                const strategyName = checkInfo.shift()!
                checkInfo.unshift(val)
                checkInfo.push(rule.errorMessage)
                return (strategyForm as any)[strategyName].apply(strategyForm, checkInfo)
            })
        })
    }

    public checkAllRule() {
        const len = this.checkRules.length
        let i = -1
        while (++i < len) {
            const errorMessage = this.checkRules[i]()
            if (errorMessage) return errorMessage
        }
        return '规则全部通过校验!'
    }
}

const validator = new Validator()

validator.addRule('1', [{ strategy: 'empty', errorMessage: '用户名不能为空' }])
validator.addRule('假装么111', [{ strategy: 'minLength:6', errorMessage: '用户名不能少于六位.' }])
validator.addRule('假装么', [{ strategy: 'minLength:3', errorMessage: '用户名不能少于三位.' }])
validator.addRule('13556612233', [{ strategy: 'checkPhone', errorMessage: '手机号不正确，请重新输入.' }])

console.log(validator.checkAllRule())

@Component({components: { BaseInput, BaseCountDown, BaseRadar }})
export default class HelloWorld extends Vue {
    public username = ''
    public timer: unknown = null

    @Prop(Number) readonly propA: number | undefined
    @Prop({default: 'default value'}) readonly propB!: string
    @Prop([String, Boolean]) readonly propC: string | boolean | undefined
    @Prop(String) public readonly text!: string
    // ? 自定义验证函数
    @Prop({validator: (value) /* 传入的prop值 */ => ['success', 'waring', 'danger'].indexOf(value) !== -1})
    meesage!: string

    @Model('modelValue', {type: String, default: 'Default Value'})
    readonly value!: string

    @Watch('value')
    onChangeValue(oldVal: string, val: string) {
        if (oldVal !== val) console.log(val)
    }

    private printCountDownOverInfo() {
        console.log('倒计时结束...')
    }

    // ! Methods

    // ? 动态规划(找零钱问题)
    private coinChange(coins: number[], amount: number) {
        const dp = new Array(amount + 1).fill(-1)
        dp[0] = 0

        for (let i = 1; i <= amount; i++) {
            for (let j = 0; j < coins.length; j++) {
                const currentAmountMoney = coins[j]
                if (currentAmountMoney > i) break
                const remainingDenominationsOptimalSolution = dp[i - currentAmountMoney]
                if (
                    remainingDenominationsOptimalSolution !== -1 &&
                    (dp[i] === -1 || dp[i] > remainingDenominationsOptimalSolution + 1)
                )
                    dp[i] = remainingDenominationsOptimalSolution + 1
            }
        }

        return `组成面额${amount}的最小金币数是: ${dp[amount]}个`
    }

    private coinChangeViolentSolution(coins: number[], amount: number) {
        const run = (n: number) => {
            if (n === 0) return 0
            if (n < 0) return -1

            let res = Infinity

            for (let i = 0; i < coins.length; i++) {
                const subProblem = run(n - coins[i])
                if (subProblem === -1) continue
                res = Math.min(res, subProblem + 1)
            }

            return res !== Infinity ? res : -1
        }

        return run(amount)
    }

    private createlatelyDays({days, isFuture = true, isContainToday = false, separator = '/'}: DateRange) {
        const result = []
        const date = new Date()
        const currentMsec = date.getTime()
        const isDefaultSeparator = separator === '/'
        const count = isFuture ? (isContainToday ? 0 : 1) : isContainToday ? -days + 1 : -days

        for (let i = 0; i < days; i++) {
            date.setTime(currentMsec + (count + i) * 8.64e7)
            result[i] = isDefaultSeparator
                    ? date.toLocaleDateString()
                    : date.toLocaleDateString().replace(/\//g, separator)
        }

        return result
    }

    private toHex<T extends number>({r, g, b}: { r: T; g: T; b: T }) {
        const INT_HEX_MAP: Record<number, string> = {10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F'}
        const hexOne = (value: T): string => {
            value = Math.min(Math.round(value), 255) as T
            const high = Math.floor(value / 16) as keyof typeof INT_HEX_MAP
            const low = (value % 16) as keyof typeof INT_HEX_MAP
            return '' + (INT_HEX_MAP[high] || high) + (INT_HEX_MAP[low] || low)
        }
        if (isNaN(r) || isNaN(g) || isNaN(b)) return ''
        return '#' + hexOne(r) + hexOne(g) + hexOne(b)
    }

    private backtrack<T extends number, S extends string>(solve: S[][], queen: S[], row: T, n: T) {
        if (queen.length === row) solve.push([...queen])
        for (let col = 0; col < n; col++) {
            if (this.valid(queen, row, col, n)) {
                queen[row] = queen[row].replace(/\./g, (match, index) => index === col ? 'Q' : '.') as S
                this.backtrack(solve, queen, row + 1, n)
                queen[row] = queen[row].replace(/Q/g, '.') as S
            }
        }
    }

    private valid(ansTemp: string[], row: number, col: number, n: number) {
        for (let i = 0; i < row; i++) if (ansTemp[i][col] === 'Q') return false
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (ansTemp[i][j] === 'Q') return false
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (ansTemp[i][j] === 'Q') return false
        return true
    }

    private solveNQueens(n: number) {
        const solve = [] as string[][]
        const queen = [] as string[]
        for (let i = 0; i < n; i++) queen[i] = '.'.repeat(n)
        this.backtrack(solve, queen, 0, n)
        return solve
    }

    private print(val: string) {
        if (typeof val !== 'object') console.log('The value of the count attribute in the store is: ' + val)
        else console.log(val)
    }

    private printVuexState({type, attr}: { type: string; attr: string }) {
        if (!(attr in this.$store.state)) throw new RangeError('The attr parameter must be an attribute in the state object.')

        const returnType = /Async$/.test(type) ? this.$store.dispatch({type}) : this.$store.commit({type})
        const wrapPrint = () => this.print(this.$store.state[attr])

        !returnType ? wrapPrint() : returnType[Symbol.toStringTag] === 'Promise' && returnType.then(wrapPrint)
    }

    private increment() {
        this.printVuexState({type: 'increment', attr: 'count'})
    }

    private incrementAsync() {
        this.printVuexState({type: 'incrementAsync', attr: 'count'})
    }

    private testVuexModule() {
        this.printVuexState({type: 'shellSort', attr: 'posts'})
    }

    // ? 生命周期钩子
    public mounted() {
        const obj = {
            a: 1,
            b: 2,
            c: [ 'a', 'b', 'c', { d: 3, e: 4, x: { f: 5, g: 6 } }, [ 10, 20, 30] ]
        }
        // var obj = {
        //     foo: 'foo',
        //     toJSON: () => 'bar'
        // }

        const result = stringify({ x: obj }, null, '----')
        // console.log(JSON.stringify({ x: obj }, null, '----'))
        console.log(result)

        withMacroTask(nextTick.bind(null, function () { console.log('降级宏任务') }) as any)()

        nextTick()!.then(() => console.log('promise nextTick'))

        // console.log(JSON.parse(result!))
        console.log(this.coinChange([1, 2, 5, 7, 10], 14))
        console.log('浅粉红(LightPink)十六进制颜色为: ' + this.toHex({r: 255, g: 182, b: 193}))
        console.log(this.createlatelyDays({days: 7, isContainToday: true, isFuture: true}))
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        console.log(re.exec('jiazhuangme@163.com'))
        console.log(this.coinChangeViolentSolution([1, 2, 5, 7, 10], 3))

        this.increment()
        this.increment()
        this.incrementAsync()
        this.testVuexModule()

        console.log(this.solveNQueens(4))
        console.log(this.createlatelyDays({ days: 7, isContainToday: true }))
    }

    destroyed() {
        clearInterval(this.timer as number)
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    padding: 0;
}

li {
    text-justify: newspaper;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
