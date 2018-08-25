import { div, _style } from '../domgen'
import * as dg from '../domgen'
import * as types from './types'
import * as classes from './classes'
import * as functions from './functions'

export const load = (classes: classes.Classes, elem: HTMLElement, fn: () => [types.Aborter, Promise<HTMLElement[]>], error: (err: Error, retry: () => void) => void, loaded?: () => void) => {
	let opacity = 1
	let loadingShow = 0
	let elems: HTMLElement[] | null

	const show = () => {
		let wait = 0
		if (loadingShow > 0) {
			wait = 250 - (new Date().getTime() - loadingShow)
			if (wait < 0) {
				wait = 0
			}
		}
		setTimeout(() => {
			if (!elems) {
				return
			}
			elem.style.opacity = '0'
			dg.children(elem, ...elems)
			functions.fade(elem, .25, () => {
				if (loaded) {
					loaded()
				}
			})
		}, wait)
	}

	let id = window.setInterval(() => {
		if (opacity > 0) {
			opacity -= !!elems ? .34 : (opacity > .5 ? .1 : .05)
			elem.style.opacity = '' + opacity
			return
		}

		clearInterval(id)
		id = 0

		if (elems) {
			show()
			return
		}

		loadingShow = new Date().getTime()
		elem.style.opacity = '1'
		let abortElem = dg.span()
		if (aborter.abort) {
			abortElem = dg.button(
				classes.btnSecondary,
				dg.listener('click', ev => {
					if (aborter.abort) {
						aborter.abort()
					}
				}),
				'abort'
			)
		}
		dg.children(elem,
			dg.middle(
				div(
					dg.span('loading...'),
					dg.span(classes.spin),
				),
				dg.br(),
				abortElem,
			)
		)
	}, 16)

	const [aborter, promise] = fn()
	promise
		.then((kids: HTMLElement[]) => {
			elems = kids
			if (id === 0) {
				show()
			}
		})
		.catch((err: Error) => {
			if (id != 0) {
				window.clearInterval(id)
			}
			elem.style.opacity = '1'
			error(err, () => load(classes, elem, fn, error, loaded))
		})
}
