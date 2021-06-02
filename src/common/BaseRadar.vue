<template>
    <canvas ref="canvas" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

type CustomDefineCtx<T = number> = CanvasRenderingContext2D & { centerX: T; centerY: T; r: T; sides: T }
type PolygonColor<S = string> = {
    line: { lineStrokeColor: S, lineFillColor: S }
    circle: { outerCircleColor: S, innerCircleColor: S }
}
type Offsets<T = number> = (T | null)[]
type Legend = { data: string[]; colors: string[]; margin: number }

@Component
export default class BaseRadar extends Vue {
    @Prop(Array) data!: string[]
    @Prop(Object) legend!: Legend
    @Prop(Number) width!: number
    @Prop(Number) height!: number

    private radarMapInit() {
        const POLYGONS = 3
        const BASE_RADIUS = 40
        const SCALE = 4
        const canvas = this.$refs.canvas as HTMLCanvasElement
        const ctx = canvas.getContext('2d') as CustomDefineCtx

        canvas.width = this.width
        canvas.height = this.height

        // 把这些自定义属性设置在Canvas上下文中，避免重复对函数进行传参
        ctx.centerX = this.width / 2
        ctx.centerY = this.height / 2
        ctx.r = ctx.centerX - 80
        ctx.sides = 6

        if (this.data.length < ctx.sides)
            throw new RangeError('Make sure that the number of sides of the polygon is consistent with the data length')

        canvas.style.width = this.width * 2 + "px"
        canvas.style.height = this.height * 2 + "px"

        canvas.setAttribute('width', this.width * SCALE as any)
        canvas.setAttribute('height', this.height * SCALE as any)

        ctx.scale(SCALE, SCALE)

        new Promise<boolean>(resolve => {
            const run: { (radius: number): void; id: number | undefined } = (radius: number) => {
                ctx.save()

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.47)'
                ctx.lineWidth = 0.5
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                this.drawOuterPolygon(ctx, POLYGONS, false)
                this.drawMiddleLongLine(ctx)
                this.drawText(ctx, this.data)
                this.drawNumber(ctx,8, 8, POLYGONS + 1, BASE_RADIUS)
                this.drawDangerPolygon(ctx, radius * 2)
                this.drawUserPolygon(ctx, radius)
                this.drawLegends<number, string>(ctx, SCALE, this.legend as unknown as Legend)

                ctx.restore()

                run.id = window.requestAnimationFrame(() => run(radius + 0.5))

                if (radius >= BASE_RADIUS) {
                    window.cancelAnimationFrame(run.id)
                    resolve(true)
                }
            }

            run.id = undefined

            window.requestAnimationFrame(() => run(0))
        }).then(isDrawSuccess => {
            isDrawSuccess && [ 'centerX', 'centerY', 'r', 'sides' ].forEach(val => delete ctx[val as keyof CustomDefineCtx])
        })
    }

    private drawLegends<T extends number, S extends string>(ctx: CustomDefineCtx, scale: T, options: { data: S[]; colors: S[]; margin: T }) {
        const { data, colors, margin } = options

        if (data.length !== colors.length) return

        ctx.save()

        ctx.font = '8px 微软雅黑'
        ctx.textBaseline = 'middle'

        const WIDTH = 14
        const HEIGHT = 8
        const SPACE = 2
        const canvasWidth = ctx.canvas.width / scale
        const totalWidth = data.reduce((result, current) => result + WIDTH + SPACE + ctx.measureText(current).width + margin, 0) - margin
        const enableAnotherLine = totalWidth > canvasWidth

        let y = 10
        for (let i = 0, x = (canvasWidth - totalWidth) / 2; i < colors.length; i++) {
            const color = colors[i]
            const legend = data[i]
            const textWidth = ctx.measureText(legend).width

            if (enableAnotherLine) {
                if (textWidth > canvasWidth) continue
                x = (canvasWidth - textWidth) / 2
                y += 10 + HEIGHT / 2 + 1
            }

            ctx.save()
            ctx.fillStyle = color
            this.drawRoundRect(ctx, x, y, WIDTH, HEIGHT, 2)
            ctx.fill()

            ctx.fillText(legend, x + SPACE + WIDTH, y + HEIGHT / 2 + 1)
            ctx.restore()

            if (!enableAnotherLine) x += margin + textWidth + SPACE + WIDTH
        }

        ctx.restore()
    }

    private drawRoundRect<T extends number>(ctx: CustomDefineCtx, x: T, y: T, w: T, h: T, r: T) {
        if (w < 2 * r) r = w / 2 as T
        if (h < 2 * r) r = h / 2 as T
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + w, y, x + w, y + h, r)
        ctx.arcTo(x + w, y + h, x, y + h, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + w, y, r)
        ctx.closePath()
    }

    private drawDangerPolygon(ctx: CustomDefineCtx, r: number) {
        this._drawInnerPolygon(
            ctx,
            [ 20, 0, 0, -20, 0, 0, 20 ] as Offsets,
            {
                line: { lineFillColor: 'rgba(255,0,0,0.3)', lineStrokeColor: '#ff0000' },
                circle: { outerCircleColor: '#ffffff', innerCircleColor: '#ff0000' }
            },
            true,
            r
        )
    }

    private drawUserPolygon(ctx: CustomDefineCtx, r: number) {
        this._drawInnerPolygon(
            ctx,
            [ 20, null, 0, 60, null, 20, 20 ] as Offsets,
            {
                line: { lineFillColor: 'rgba(0,144,255,0.3)', lineStrokeColor: '#0090ff' },
                circle: { outerCircleColor: '#ffffff', innerCircleColor: '#001aff' }
            },
            false,
            r
        )
    }

    private _drawInnerPolygon(ctx: CustomDefineCtx, offsets: Offsets, color: PolygonColor, isDanger: boolean, r: number) {
        this.drawInnerPolygonLine(ctx, offsets, color.line, r)
        this.drawInnerPolygonDots(ctx, offsets, color.circle, isDanger, r)
    }

    private drawOuterPolygon(ctx: CustomDefineCtx, polygons: number, enableNonZero: boolean) {
        ctx.save()
        ctx.beginPath()
        enableNonZero && (ctx.fillStyle = '#f7faff')

        for (let i = 0; i < polygons; i++) {
            const radius = ctx.r - i * 40
            const radian = enableNonZero && i % 2 === 1 ? -2 * Math.PI / ctx.sides : 2 * Math.PI / ctx.sides
            let angle = enableNonZero && i % 2 === 1 ? 2 * Math.PI : 0

            ctx.moveTo(ctx.centerX + Math.sin(angle) * radius, ctx.centerY - Math.cos(angle) * radius)
            for (let i = 0; i < ctx.sides; i++) {
                angle += radian
                ctx.lineTo(ctx.centerX + Math.sin(angle) * radius, ctx.centerY - Math.cos(angle) * radius)
            }

            ctx.closePath()
        }

        enableNonZero && ctx.fill()
        ctx.stroke()
        ctx.restore()
    }

    private drawInnerPolygonLine(ctx: CustomDefineCtx, offsets: Offsets, color: PolygonColor['line'], r: number) {
        const delta = 2 * Math.PI / ctx.sides
        const { lineStrokeColor, lineFillColor } = color

        ctx.save()
        ctx.strokeStyle = lineStrokeColor
        ctx.fillStyle = lineFillColor
        ctx.lineWidth = 0.5

        ctx.beginPath()

        // centerY - Math.cos(0) * (r + offsets[0]!) = centerY - (r + offsets[0]!)
        // Math.cos(0) = 1, Math.sin(0) = 0
        ctx.moveTo(ctx.centerX, ctx.centerY - (r + offsets[0]!))

        for (let i = 1, radian = delta; i <= ctx.sides; i++, radian += delta) {
            if (offsets[i] === null) continue
            ctx.lineTo(ctx.centerX + Math.sin(radian) * (r + offsets[i]!), ctx.centerY - Math.cos(radian) * (r + offsets[i]!))
            ctx.stroke()
        }

        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }

    private drawInnerPolygonDots(ctx: CustomDefineCtx, offsets: Offsets, color: PolygonColor['circle'], isDanger: boolean, r: number) {
        const { outerCircleColor, innerCircleColor } = color
        const arc = <T extends number>(ctx: CanvasRenderingContext2D, x: T, y: T, r: T, color: string, anticlockwise: boolean = false) => {
            ctx.save()
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.arc(x, y, r, 0, Math.PI * 2, anticlockwise)
            ctx.fill()
            ctx.restore()
        }

        for (let i = 0, radian = 0; i < ctx.sides; i++, radian += 2 * Math.PI / ctx.sides) {
            if (offsets[i] === null || isDanger && radian === Math.PI) continue
            const x = ctx.centerX + Math.sin(radian) * (r + offsets[i]!)
            const y = ctx.centerY - Math.cos(radian) * (r + offsets[i]!)
            arc(ctx, x, y, 5, outerCircleColor)
            arc(ctx, x, y, 4, innerCircleColor)
        }
    }

    private drawMiddleLongLine(ctx: CustomDefineCtx) {
        const calcCoordinate = (radian: number) => ([ Math.sin(radian) * ctx.r, Math.cos(radian) * ctx.r ])
        for (let i = 0; i < ctx.sides / 2 /* 六边形中间的长线数量为 3 */; i++) {
            const from = 2 * Math.PI / ctx.sides * i
            const toAngle = (from / Math.PI) * 180 + 180
            // 角度 = (弧度 / Math.PI) * 180, 弧度 = (角度 / 180) * Math.PI
            const toRadian = (toAngle / 180) * Math.PI
            const [ moveX, moveY ] = calcCoordinate(from as T)
            const [ lineX, lineY ] = calcCoordinate(toRadian as T)
            ctx.beginPath()
            ctx.moveTo(ctx.centerX + moveX, ctx.centerY - moveY)
            ctx.lineTo(ctx.centerX + lineX, ctx.centerY - lineY)
            ctx.stroke()
        }
    }

    private drawText(ctx: CustomDefineCtx, data: string[], offset: number = 15) {
        this.beginDrawText(ctx, '10px', 'center', () => {
            const length = Math.min(data.length, ctx.sides)
            for (let i = 0, radian = 0; i < length; i++, radian += 2 * Math.PI / ctx.sides) {
                const textWidth = ctx.measureText(data[i]).width
                const fillText = ctx.fillText.bind(ctx, data[i])

                ctx.save()

                ctx.beginPath()
                ctx.translate(ctx.centerX + Math.sin(radian) * ctx.r, ctx.centerY - Math.cos(radian) * ctx.r)

                if (radian === 0 || radian === Math.PI) fillText(0, radian === 0 ? -offset : offset)
                else if (radian > 0 && radian < Math.PI) fillText(textWidth / 2 + offset, 0)
                else fillText(-textWidth / 2 - offset, 0)

                ctx.restore()
            }
        })
    }

    private drawNumber<T extends number>(ctx: CustomDefineCtx, step: T, offset: T, plies: T/* 层数 */, r: T) {
        this.beginDrawText(ctx, '10px', 'right', () => {
            // [ 0, 8, 16, 24 ]
            for (let i = 0, total = 0; i < plies; i++, (total += step)) {
                let y = ctx.centerY - i * r
                if (i < plies - 1 && i !== 0) y = ctx.centerY - i * r - (step / 2 | 0)
                ctx.beginPath()
                ctx.moveTo(ctx.centerX, ctx.centerY)
                ctx.fillText(total.toFixed(0), ctx.centerX - offset, y)
            }
        })
    }

    private beginDrawText(ctx: CustomDefineCtx, font: string, textAlign: CanvasTextAlign, callback: Function) {
        ctx.save()

        ctx.font = `${ font } 微软雅黑`
        ctx.textAlign = textAlign
        ctx.textBaseline = "middle"

        callback()

        ctx.restore()
    }

    public mounted() {
        this.radarMapInit()
    }
}
</script>