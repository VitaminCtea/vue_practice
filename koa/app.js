const Koa = require('koa')
const app = new Koa()

const logger = format => {
    format = format || ':method ":url"'
    return async (ctx, next) => {
        const str = format.replace(':method', `method: ${ ctx.method }`).replace(':url', `url: ${ ctx.url }`)
        console.log(str)
        await next()
    }
}

const middlewareCompose = middlewares => {
    if (!Array.isArray(middlewares)) throw new TypeError('Middleware stack must be an array!')
    if (!middlewares.every(fn => typeof fn === 'function')) throw new TypeError('Middleware must be composed of functions!')

    return (context, next) => {
        let index = -1
        const dispatch = i => {
            if (i <= index) return Promise.reject(new Error('next() called multiple times'))
            index = i
            let fn = middlewares[i]
            if (i === middlewares.length) fn = next
            if (!fn) return Promise.resolve()
            try {
                return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
            } catch (err) {
                return Promise.reject(err)
            }
        }
        return dispatch(0)
    }
}

const middleware = (path, body) => async (ctx, next) => {
    if (path === ctx.path) {
        ctx.body = body
        return
    }
    await next()
}

const random = middleware('/random', Math.floor(Math.random() * 10))
const backwards = middleware('/backwards', 'sdrawkcab')
const pi = middleware('/pi', String(Math.PI))

const allMiddlewares = middlewareCompose([ random, backwards, pi ])

app.use(allMiddlewares)

app.use(logger())
app.use(logger(':method ":url"'))

app.use(async (ctx, next) => {
    await next()
    const rt = ctx.response.get('X-Response-Time')
    console.log(`${ ctx.method } ${ ctx.url } - ${ rt }`)
})

app.use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ ms }ms`)
})

app.use(async ctx => ctx.body = 'Hello World')

app.listen(3333)