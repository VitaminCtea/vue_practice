const callbacks = [] as Function[]
let pending = false

const flushCallbacks = () => {
    pending = false
    callbacks.forEach(callback => callback())
    callbacks.length = 0
}

const isNative = (fn: any) => {
    const toString = Object.prototype.toString
    const fnToString = Function.prototype.toString
    const reHostCtor = /^\[object .+?Constructor\]$/
    /**
     * function setTimeout () { [native code] }
     * function setTimeout \\(\\) \\{ \\[native code\\] \\}
     * function.*?\\(\\) \\{ \\[native code\\] \\}
     * ^function.*?\\(\\) \\{ \\[native code\\] \\}
     */
    const reNative = new RegExp(
        '^' +
        String(toString)
            .replace(/[{}()\[\]]/g, '\\$&')
            .replace(/(function).*?(?=\\\()/g, '$1.*?') +
        '$'
    )

    const type = typeof fn
    return type === 'function' ? reNative.test(fnToString.call(fn)) : (fn && type === 'object' && reHostCtor.test(toString.call(fn))) || false
}

let useMacroTask = false
let macroTimerFunc: Function
let microTimerFunc: Function

// @ts-ignore
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) macroTimerFunc = () => setImmediate(flushCallbacks)
else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]')) {
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = flushCallbacks
    macroTimerFunc = () => port.postMessage(1)
} else macroTimerFunc = () => setTimeout(flushCallbacks, 0)

if (typeof Promise !== 'undefined' && isNative(Promise)) microTimerFunc = () => Promise.resolve().then(flushCallbacks)
else microTimerFunc = macroTimerFunc

// 强制使用宏任务进行更新，用法： withMacroTask(nextTick.bind(null, function () {}))()
export const withMacroTask = (fn: Function & { _withTask: Function }) => fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
})

export const nextTick = (cb?: Function, ctx?: any): undefined | Promise<any> => {
    let _resolve: Function
    callbacks.push(() => cb ? cb.call(ctx) : _resolve ? _resolve(ctx) : undefined)
    if (!pending) {
        pending = true
        if (useMacroTask) macroTimerFunc()
        else microTimerFunc()
    }
    if (!cb && typeof Promise !== 'undefined') return new Promise(resolve => _resolve = resolve)
}