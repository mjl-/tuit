import * as CSS from './node_modules/csstype/index'
export { Properties as CSSProperties } from './node_modules/csstype/index'

interface StringDict {
	[propName: string]: string
}

export interface StringKeyDict {
	[propName: string]: any
}

class Listener {
	constructor(public event: string, public handler: (event: Event) => void) {
	}
}

export class Style {
	constructor(public props: CSS.Properties) { }
}

export interface Rooter {
	root: HTMLElement
}

export const isRooter = (v: any): v is Rooter => {
	return 'root' in v && v.root instanceof HTMLElement
}

export interface ClassNamer {
	className: string
}

export function isClassNamer(v: any): v is ClassNamer {
	return 'className' in v && typeof v['className'] === 'string'
}

export type ElemArg = string | ClassNamer | Element | Listener | Style | StringDict | Rooter

export const fill = <T extends HTMLElement>(e: T, l: ElemArg[]): T => {
	l.forEach((c) => {
		if (typeof c === 'string') {
			const n = document.createTextNode(c)
			e.appendChild(n)
		} else if (c instanceof Element) {
			e.appendChild(c)
		} else if (isClassNamer(c)) {
			e.className = c.className
		} else if (c instanceof Listener) {
			e.addEventListener(c.event, c.handler)
		} else if (c instanceof Style) {
			const st = e.style as any // xxx
			for (const key in <object>c.props) {
				st[key] = (<any>c.props)[key] // xxx probably not always correct, eg for array values
			}
		} else if (isRooter(c)) {
			e.appendChild(c.root)
		} else if (typeof c === 'object' && c !== null && c.constructor === Object) {
			for (const key in c) {
				e.setAttribute(key, c[key])
			}
		}
	})
	return e
}

export const a = (...l: ElemArg[]) => fill(document.createElement('a'), l)
export const nav = (...l: ElemArg[]) => fill(document.createElement('nav'), l)
export const label = (...l: ElemArg[]) => fill(document.createElement('label'), l)
export const small = (...l: ElemArg[]) => fill(document.createElement('small'), l)
export const h1 = (...l: ElemArg[]) => fill(document.createElement('h1'), l)
export const h2 = (...l: ElemArg[]) => fill(document.createElement('h2'), l)
export const h3 = (...l: ElemArg[]) => fill(document.createElement('h3'), l)
export const h4 = (...l: ElemArg[]) => fill(document.createElement('h4'), l)
export const h5 = (...l: ElemArg[]) => fill(document.createElement('h5'), l)
export const h6 = (...l: ElemArg[]) => fill(document.createElement('h6'), l)
export const div = (...l: ElemArg[]) => fill(document.createElement('div'), l)
export const span = (...l: ElemArg[]) => fill(document.createElement('span'), l)
export const button = (...l: ElemArg[]) => fill(document.createElement('button'), l)
export const table = (...l: ElemArg[]) => fill(document.createElement('table'), l)
export const thead = (...l: ElemArg[]) => fill(document.createElement('thead'), l)
export const tbody = (...l: ElemArg[]) => fill(document.createElement('tbody'), l)
export const tr = (...l: ElemArg[]) => fill(document.createElement('tr'), l)
export const th = (...l: ElemArg[]) => fill(document.createElement('th'), l)
export const td = (...l: ElemArg[]) => fill(document.createElement('td'), l)
export const input = (...l: ElemArg[]) => fill(document.createElement('input'), l)
export const form = (...l: ElemArg[]) => fill(document.createElement('form'), l)
export const fieldset = (...l: ElemArg[]) => fill(document.createElement('fieldset'), l)
export const strong = (...l: ElemArg[]) => fill(document.createElement('strong'), l)
export const img = (...l: ElemArg[]) => fill(document.createElement('img'), l)
export const p = (...l: ElemArg[]) => fill(document.createElement('p'), l)
export const br = (...l: ElemArg[]) => fill(document.createElement('br'), l)
export const style = (...l: ElemArg[]) => fill(document.createElement('style'), l)
export const textarea = (...l: ElemArg[]) => fill(document.createElement('textarea'), l)
export const select = (...l: ElemArg[]) => fill(document.createElement('select'), l)
export const option = (...l: ElemArg[]) => fill(document.createElement('option'), l)
export const ul = (...l: ElemArg[]) => fill(document.createElement('ul'), l)
export const ol = (...l: ElemArg[]) => fill(document.createElement('ol'), l)
export const li = (...l: ElemArg[]) => fill(document.createElement('li'), l)
export const dl = (...l: ElemArg[]) => fill(document.createElement('dl'), l)
export const dt = (...l: ElemArg[]) => fill(document.createElement('dt'), l)
export const dd = (...l: ElemArg[]) => fill(document.createElement('dd'), l)

export function listen(event: 'keyup' | 'keydown', handler: (event: KeyboardEvent) => void): Listener
export function listen(event: string, handler: (event: Event) => void): Listener
export function listen(event: string, handler: (event: any) => void): Listener {
	return new Listener(event, handler)
}

export const _style = (props: CSS.Properties) => {
	return new Style(props)
}

export const children = (elem: HTMLElement, ...kids: (string | Rooter | HTMLElement)[]) => {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild)
	}
	let ensureElement = (e: string | Rooter | HTMLElement): Element => {
		if (typeof e === 'string') {
			return span(e)
		} else if (isRooter(e)) {
			return e.root
		} else {
			return e
		}
	}
	kids.forEach((kid) => elem.appendChild(ensureElement(kid)))
}
