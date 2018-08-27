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
	constructor(public pairs: StringKeyDict) { }
}

interface UI {
	ui: HTMLElement
}

const isUI = (v: any): v is UI => {
	return 'ui' in v && v.ui instanceof HTMLElement
}

export type ElemArg = string | Element | Listener | Style | StringDict | UI


export let makeElement = (name: string, l: ElemArg[]) => {
	let e: HTMLElement = document.createElement(name)
	l.forEach((c) => {
		if (typeof c === 'string') {
			let n = document.createTextNode(c)
			e.appendChild(n)
		} else if (c instanceof Listener) {
			e.addEventListener(c.event, c.handler)
		} else if (c instanceof Style) {
			for (let key in c.pairs) {
				e.style.setProperty(key, c.pairs[key])
			}
		} else if (isUI(c)) {
			e.appendChild(c.ui)
		} else if (c instanceof Element) {
			e.appendChild(c)
		} else if (typeof c === 'object' && c !== null && c.constructor === Object) {
			for (let key in c) {
				e.setAttribute(key, c[key])
			}
		}
	});
	return e
}

export let a = (...l: ElemArg[]) => makeElement('a', l) as HTMLAnchorElement
export let nav = (...l: ElemArg[]) => makeElement('nav', l)
export let label = (...l: ElemArg[]) => makeElement('label', l) as HTMLLabelElement
export let small = (...l: ElemArg[]) => makeElement('small', l)
export let h1 = (...l: ElemArg[]) => makeElement('h1', l) as HTMLHeadingElement
export let h2 = (...l: ElemArg[]) => makeElement('h2', l) as HTMLHeadingElement
export let h3 = (...l: ElemArg[]) => makeElement('h3', l) as HTMLHeadingElement
export let h4 = (...l: ElemArg[]) => makeElement('h4', l) as HTMLHeadingElement
export let h5 = (...l: ElemArg[]) => makeElement('h5', l) as HTMLHeadingElement
export let h6 = (...l: ElemArg[]) => makeElement('h6', l) as HTMLHeadingElement
export let div = (...l: ElemArg[]) => makeElement('div', l) as HTMLDivElement
export let span = (...l: ElemArg[]) => makeElement('span', l) as HTMLSpanElement
export let button = (...l: ElemArg[]) => makeElement('button', l) as HTMLButtonElement
export let table = (...l: ElemArg[]) => makeElement('table', l) as HTMLTableElement
export let thead = (...l: ElemArg[]) => makeElement('thead', l) as HTMLTableSectionElement
export let tbody = (...l: ElemArg[]) => makeElement('tbody', l) as HTMLTableSectionElement
export let tr = (...l: ElemArg[]) => makeElement('tr', l) as HTMLTableRowElement
export let th = (...l: ElemArg[]) => makeElement('th', l) as HTMLTableHeaderCellElement
export let td = (...l: ElemArg[]) => makeElement('td', l) as HTMLTableCellElement
export let input = (...l: ElemArg[]) => makeElement('input', l) as HTMLInputElement
export let form = (...l: ElemArg[]) => makeElement('form', l) as HTMLFormElement
export let fieldset = (...l: ElemArg[]) => makeElement('fieldset', l) as HTMLFieldSetElement
export let strong = (...l: ElemArg[]) => makeElement('strong', l)
export let img = (...l: ElemArg[]) => makeElement('img', l) as HTMLImageElement
export let p = (...l: ElemArg[]) => makeElement('p', l) as HTMLParagraphElement
export let br = (...l: ElemArg[]) => makeElement('br', l) as HTMLBRElement
export let style = (...l: ElemArg[]) => makeElement('style', l) as HTMLStyleElement
export let textarea = (...l: ElemArg[]) => makeElement('textarea', l) as HTMLTextAreaElement
export let select = (...l: ElemArg[]) => makeElement('select', l) as HTMLSelectElement
export let option = (...l: ElemArg[]) => makeElement('option', l) as HTMLOptionElement

export function listener(event: 'keyup' | 'keydown', handler: (event: KeyboardEvent) => void): Listener
export function listener(event: string, handler: (event: Event) => void): Listener;
export function listener(event: string, handler: (event: any) => void): Listener {
	return new Listener(event, handler)
}

export let _style = (pairs: StringKeyDict) => {
	return new Style(pairs)
}

export let children = (elem: HTMLElement, ...children: (string | UI | HTMLElement)[]) => {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
	let ensureElement = (e: string | UI | HTMLElement): Element => {
		if (typeof e === 'string') {
			return span(e)
		} else if (isUI(e)) {
			return e.ui
		} else {
			return e
		}
	}
	children.forEach((child) => elem.appendChild(ensureElement(child)));
}

export let middle = (...children: HTMLElement[]) => {
	return div({ style: 'display: flex; height: 100%; text-align: center' },
		div({ 'style': 'flex-grow: 1; align-self: center' },
			...children,
		),
	)
}
