// ? 模拟 JSON.stringify 方法
export const stringify = (data: unknown, replacer?: Function | unknown[] | null, space?: number | string): string | undefined => {

    if (typeof data === 'function' && data.name === 'BigInt') throw new TypeError("BigInt value can't be serialized in JSON")

    if (data === null || Object.is(data, NaN) || data === Infinity || data === -Infinity || typeof data === 'function') return 'null'

    // 修复 Number、Boolean、String 类型不能被正确的解析成原始值
    if (typeof data !== 'object') return data === undefined ? undefined : typeof data === 'string' ? `"${ data }"` : `${ data }`

    if (space && typeof space === 'number') space = space > 10 ? 10 : space

    const format = (space: number | string | undefined, indent: number, isCloseSymbol = false) => {
        if (!space) return 0

        let length: number
        let symbol: string

        if (typeof space === 'string') {
            let string_length = space.length
            space = string_length > 10 ? space.substring(0, 10) : space
            string_length = space.length
            length = (isCloseSymbol ? string_length * indent - string_length : string_length * indent) / string_length
            symbol = space
        } else {
            length = isCloseSymbol ? space * indent - space : space * indent
            symbol = ' '
        }

        return Array.apply(null, { length } as []).reduce(result => ((result += symbol), result), '')
    }

    const ignoreSpecificType = (val: unknown) => typeof val === 'symbol' || typeof val === 'function' || val == null

    const toString = (val: unknown) => Object.prototype.toString.call(val)

    const isObject = (val: unknown): val is Record<string, unknown> => val !== null && toString(val) === '[object Object]'

    const toBasicType = (val: any) => typeof val === 'string' ? `"${ val }"` : val

    const dataTemplate = (space: number | string | undefined, solve: string[], indent: number, isArray = true) => {
        const [ begin, end ] = isArray ? ['[', ']'] : ['{', '}']
        // 1.修复结果的字符串不能被JSON.parse()方法解析
        // 2.修复打印格式，符合JSON.stringify()方法打印格式
        const contentPrefixSpaceCount = format(space!, indent)
        const closeSymbolPrefixSpaceCount = format(space!, indent, true)

        return (
            space ?
                `${ begin }\n${ solve.map(item => `${ contentPrefixSpaceCount }${ item }`).join(',\n') }\n${ closeSymbolPrefixSpaceCount }${ end }` :
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

    const filterCollect = (data: any, replacer: unknown) => {
        if (!replacer) return data
        type Solve = { [key in keyof typeof data]: unknown }
        return Object.keys(data).reduce((result, key) => {
            const filter = typeof replacer === 'function' ? replacer(key, data[key]) : (replacer as string[]).includes(key)
            if (filter) result[key] = data[key]
            return result
        }, {} as Solve)
    }

    if (hasCycle(data)) throw new TypeError('cyclic object value')

    const recursiveFormatting = (data: any, indent = 1) => {
        if (data == null) return 'null'

        if (typeof data !== 'object') return toBasicType(data)

        // 处理出现字符串、布尔、数字对象的情况
        if (typeof data === 'object' &&
            data!.valueOf &&
            [ 'string', 'boolean', 'number' ].some(type => typeof data.valueOf() === type)
        ) return toBasicType(data.valueOf())

        const solve: string[] = []

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (ignoreSpecificType(item)) {
                    solve.push("null")
                    return
                }
                solve.push(recursiveFormatting(item, indent + 1))
            })
            return dataTemplate(space, solve, indent)
        }

        if (isObject(data)) {

            const replacerType = toString(replacer).slice(8, -1)

            // 当replacer符合数组和函数类型时
            if ([ 'Array', 'Function' ].some(type => replacerType === type)) {

                // 过滤一下
                data = filterCollect(data, replacer)

                // 如果是空对象，则直接返回字符串的对象
                if (!Object.keys(data).length) return '{}'
            }

            Object.keys(data).forEach(key => {
                // 当值为symbol、function、null类型或者属性不可枚举的时候，则忽略
                if (ignoreSpecificType(data[key]) || !Object.prototype.propertyIsEnumerable.call(data, key)) return

                // 修复当对象中存在toJSON方法时，不会被调用
                if (Object.prototype.hasOwnProperty.call(data[key], 'toJSON') && typeof data[key].toJSON === 'function') {
                    solve.push(`"${ key }":${ space ? ' ' : '' }"${ data[key!].toJSON() }"`)
                    return
                }
                solve.push(`"${ key }":${ space ? ' ' : '' }${ recursiveFormatting(data[key],indent + 1) }`)
            })

            return dataTemplate(space, solve, indent, false)
        }
    }

    return recursiveFormatting(data)
}