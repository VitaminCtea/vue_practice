<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <p>{{ value }}</p>
        <slot></slot>
        <br/>
        <a :[dynamicHref]="url">动态参数</a>
        <BaseCountDown
                :date="{ day: 1, hour: 4, minutes: 10, seconds: 30 }"
                :prop-callback="printCountDownOverInfo"/>
        <ul>
            <template v-for="item in items">
                <li :key="item.id">{{ item.msg }}</li>
                <li class="divider" role="presentation" :key="item.msg"></li>
            </template>
        </ul>
        <ul v-if="todos.length">
            <li v-for="todo of filterTodos" :key="todo.id">{{ todo.text }}</li>
        </ul>
        {{ text }}
        <form @submit.prevent="addNewTodo">
            <label for="new-todo">Add a todo</label>
            <input v-model="newTodoText" id="new-todo" placeholder="E.g. Feed the cat"/>
            <button>Add</button>
        </form>
        <ul>
            <li
                    is="todo-items"
                    v-for="(todo, index) in todos2"
                    :key="todo.id"
                    :text="todo.text"
                    @remove="todos2.splice(index, 1)"
            />
        </ul>
        <base-slot>
            <template #header>
                <h5>Here might be a page title</h5>
            </template>
            <p>A paragraph for the main content.</p>
            <p>And another one.</p>
            <template #footer>
                <p>Here's some contact info</p>
            </template>
        </base-slot>
        <form action="">
            <base-input v-model="username" label="username" :required="true" placeholder="Enter your username"/>
            <input type="submit" @click.prevent=""/>
        </form>
        <base-ul @click.native="removeItem"/>
    </div>
</template>

<script lang="ts">
import {Component, Model, Prop, Vue, Watch} from 'vue-property-decorator'
import TodoItems from '@/components/TodoItems.vue'
import BaseInput from '@/common/BaseInput.vue'
import BaseUl from '@/common/BaseUl.vue'
import BaseSlot from '@/common/BaseSlot.vue'
import BaseCountDown from "@/common/BaseCountDown.vue"
import { BST } from "@/utils"

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

type DateRange<T extends boolean = boolean> = { days: number; isFuture?: T; isContainToday?: T; separator?: string }

class TrieNode {
    public val: any = null
    public next: TrieNode = Object.create(null) as TrieNode
}

class Tire {
    private root: TrieNode | null = null
    private n: number = 0

    public put(key: string | null, val: number) {
        if (key === null) throw new TypeError('first argument to put() is null')
        this.root = this.innerPut(this.root, key, val, 0)
    }

    private innerPut(node: TrieNode | null, key: string, val: number, index: number) {
        if (node == null) node = new TrieNode()
        if (index === key.length) {
            if (node!.val === null) this.n++
            node!.val = val
            return node
        }

        const k = key.charAt(index)
        node.next[k as keyof typeof node.next] = this.innerPut(node.next[k as keyof typeof node.next], key, val, index + 1)
        return node
    }
}

const tire = new Tire()
const puts = { by: 4, sea: 6, sells: 1, she: 0, shells: 3, shore: 7, the: 5 }
console.log(tire)
Object.entries(puts).forEach(([ key, val ]) => tire.put(key, val))

@Component({components: {TodoItems, BaseInput, BaseUl, BaseSlot, BaseCountDown}})
export default class HelloWorld extends Vue {
    public dynamicHref = 'href'
    public url = 'https://cn.vuejs.org/'
    public items = [
        {id: 11, msg: '相当于React.Fragment组件'},
        {id: 21, msg: '可以渲染多个内容'},
    ]
    public todos: { id: number; text: string; isComplete: boolean }[] = [
        {id: 1, text: '丹尼尔‧凯曼：《丈量世界》', isComplete: false},
        {id: 2, text: '《白鹿原》', isComplete: true},
        {id: 3, text: '《解忧杂货铺》', isComplete: true},
        {id: 4, text: '《挪威的森林》', isComplete: false},
        {id: 5, text: '《资本论》', isComplete: false},
    ]
    public todos2: { id: number; text: string }[] = [
        {id: 1, text: '丹尼尔‧凯曼：《丈量世界》'},
        {id: 2, text: '《白鹿原》'},
        {id: 3, text: '《解忧杂货铺》'},
    ]

    public newTodoText = ''
    public username = ''
    public timer: unknown = null

    @Prop() private msg!: string
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

    // $ computed
    private get filterTodos() {
        return this.todos.filter(todo => !todo.isComplete)
    }

    // ! Methods
    private addNewTodo() {
        if (!this.newTodoText) return
        this.todos2.push({
            id: this.todos2[this.todos2.length - 1].id + 1,
            text: this.newTodoText,
        })
        this.newTodoText = ''
    }

    private removeItem(event: Event) {
        if ((event.target as HTMLUListElement).nodeName === 'UL') return
        const parent = (event.target as HTMLLIElement).parentNode
        const items = (parent as HTMLUListElement).children
        const findIndex = Array.from(items).findIndex(item => item === event.target)
        findIndex !== -1 && parent?.removeChild(event.target as HTMLLIElement)
    }

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

    // ? 模拟 JSON.stringify 方法
    private stringify(data: unknown, replacer?: Function | unknown[] | null, space?: number | string): string | undefined {
        if (typeof data === 'function' && data.name === 'BigInt') throw new TypeError("BigInt value can't be serialized in JSON")
        if (data === null || Object.is(data, NaN) || data === Infinity || data === -Infinity || typeof data === 'function') return 'null'
        // 修复 Number、Boolean、String 类型不能被正确的解析成原始值
        if (typeof data !== 'object') return data === undefined ? undefined : typeof data === 'string' ? `"${ data }"` : `${ data }`

        const prefix = (val: number | string, indent: number, isCloseSymbol = false) => {
            let length: number
            let symbol: string
            if (typeof val === 'string') {
                let string_length = val.length
                val = string_length > 10 ? val.substring(0, 10) : val
                string_length = val.length
                length = (isCloseSymbol ? string_length * indent - string_length : string_length * indent) / string_length
                symbol = val
            } else {
                length = isCloseSymbol ? val * indent - val : val * indent
                symbol = ' '
            }
            return Array.apply(null, { length } as []).reduce(result => ((result += symbol), result), '')
        }

        const ignoreSpecificValue = (val: unknown) => typeof val === 'symbol' || typeof val === 'function' || val == null

        const toString = (val: unknown) => Object.prototype.toString.call(val)

        const isObject = (val: unknown): val is Record<string, unknown> => val !== null && toString(val) === '[object Object]'

        const dataTemplate = (space: number | string | undefined, solve: string[], indent: number, isArray = true) => {
            const [ begin, end ] = isArray ? ['[', ']'] : ['{', '}']
            // 1.修复结果的字符串不能被JSON.parse()方法解析
            // 2.修复打印格式，符合JSON.stringify()方法打印格式
            return (
                space ?
                `${ begin }\n${ solve.map(item => `${ prefix(space, indent) }${ item }`).join(',\n') }\n${ prefix(space, indent, true) }${ end }` :
                `${ begin }${ solve }${ end }`
            )
        }

        const cycleCallback = <T extends unknown>(value: T | T[], objs: T[]) => {
            if (objs.some((obj: T) => obj === value)) return true
            objs.push(value as T)
            return hasCycle(value, objs as unknown as T[])
        }

        const hasCycle = <T extends unknown>(data: T | T[], objs: T[] = []) => {
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    if (typeof data[i] !== 'object') continue
                    if (cycleCallback(data[i], objs)) return true
                }
            } else if (typeof data === 'object' && data !== null) {
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        if (typeof data[key] !== 'object' || data[key] === null) continue
                        if (cycleCallback(data[key], objs as unknown[])) return true
                    }
                }
            }
            return false
        }

        const reduce = (data: any, replacer: unknown) => {
            if (replacer == null) return data
            type Solve = { [key in keyof typeof data]: unknown }
            return Object.keys(data).reduce((result, key) => {
                    const filter = typeof replacer === 'function' ? replacer(key, data[key]) : (replacer as string[]).includes(key)
                    if (filter) result[key] = data[key]
                    return result
                }, {} as Solve)
        }

        if (space) space = space > 10 ? 10 : space

        let isCheckCycleSuccess = false

        const recursiveFormatting = (data: any, indent = 1) => {
            if (data == null) return 'null'
            if (
                  typeof data !== 'object' ||
                  typeof data === 'object' && data!.valueOf && [ 'string', 'boolean', 'number' ].some(type => typeof data.valueOf() === type)
            ) {
                return typeof data.valueOf() === 'string' ? `"${ data.valueOf() }"` : data
            }

            const solve: string[] = []

            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (ignoreSpecificValue(item)) {
                        solve.push("null")
                        return
                    }
                    solve.push(recursiveFormatting(item, indent + 1))
                })
                return dataTemplate(space, solve, indent)
            }

            if (isObject(data)) {

                if (!isCheckCycleSuccess) {
                    isCheckCycleSuccess = true
                    if (hasCycle(data)) throw new TypeError('cyclic object value')
                }

                switch (toString(replacer).slice(8, -1)) {
                    case 'Array':
                    case 'Function':
                        data = reduce(data, replacer)
                        if (!Object.keys(data).length) return '{}'
                        break
                }

                Object.keys(data).forEach(key => {
                    if (ignoreSpecificValue(data[key]) || !Object.prototype.propertyIsEnumerable.call(data, key)) return
                    // 修复当对象中存在toJSON方法时，不会被调用
                    if (Object.prototype.hasOwnProperty.call(data[key!], 'toJSON') && typeof data[key!].toJSON === 'function') {
                        solve.push(`"${ key }":${ space ? ' ' : '' }${ data[key!].toJSON() }`)
                    }
                    else solve.push(`"${ key }":${ space ? ' ' : '' }${ recursiveFormatting(data[key],indent + 1) }`)
                })

                return dataTemplate(space, solve, indent, false)
            }
        }

        return recursiveFormatting(data)
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
        //     toJSON: 1
        // }

        const result = this.stringify({ x: obj }, null, '....')
        console.log(result)
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
