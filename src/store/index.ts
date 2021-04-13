import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

type State<T = string> = T[]

const moduleA = {
    state: () => ([ 'L', 'E', 'E', 'A', 'M', 'H', 'L', 'E', 'P', 'S', 'O', 'L', 'T', 'S', 'X', 'R' ]),
    mutations: {
        shellSort: (state: State) => {
            const LENGTH = state.length
            let h = 1
            while (h < LENGTH / 3) h = 3 * h + 1
            while (h >= 1) {
                for (let i = h; i < LENGTH; i++) {
                    const temp = state[i]
                    let j = i
                    while (j > 0 && temp < state[j - 1]) {
                        state[j] = state[j - 1]
                        j--
                    }
                    if (i !== j) state[j] = temp
                }
                h = h / 3 | 0
            }
        }
    }
}

const store = new Vuex.Store({
	state: {
        count: 0
    },
	mutations: {
        increment(state) {
            state.count++
        }
    },
	actions: {
        incrementAsync({ commit }) {
            return new Promise<void>(resolve => {
                setTimeout(() => {
                    commit({ type: 'increment' })
                    resolve()
                }, 3000)
            })
        }
    },
	modules: {
        posts: moduleA
    },
})

export default store
