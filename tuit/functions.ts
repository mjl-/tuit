import * as dom from '../dom'
import * as types from './types'

export const titleize = (s: string) => s.substring(0, 1).toUpperCase() + s.substring(1)

export const parseState = (): types.State => {
	const words = location.hash ? decodeURI(location.hash || '#').substring(1).split(' ') : []

	const takeArray = (): types.State => {
		const r: types.State = []
		while (words.length > 0 && words[0] !== '.') {
			const w = words[0]
			words.shift()
			if (w === '/') {
				r.push(takeArray())
				words.shift()
			} else {
				r.push(w)
			}
		}
		return r
	}
	const r = takeArray()
	return r
}

export const fade = (elem: HTMLElement, step: number, done: () => void) => {
	let opacity = step < 0 ? 1 : 0
	let id = window.setInterval(() => {
		opacity += step
		elem.style.opacity = '' + opacity
		if (opacity <= 0 || opacity >= 1) {
			window.clearInterval(id)
			done()
		}
	}, 16)
}

export const box = (className: string, ...l: dom.ElemArg[]) => {
	const e = dom.div({ ui: 'box' }, { class: className }, ...l)
	e.style.setProperty('height', '100%') // todo: figure out why this is necessary. same style is in class, but doesn't have the effect this inline style has....
	return e
}

export const middle = (...kids: HTMLElement[]) => {
	return dom.div({ style: 'display: flex; height: 100%; text-align: center' },
		dom.div({ 'style': 'flex-grow: 1; align-self: center' },
			...kids,
		),
	)
}
