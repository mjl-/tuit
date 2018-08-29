import * as dom from '../dom'
import * as types from './types'
import * as fns from './fns'

// reveal fades old content out and new content in, with a similar animation as load(). reveal is simpler, and cannot fail. use it when you have the content to show already available.
export const reveal = async (container: HTMLElement, ...kids: HTMLElement[]): Promise<void> => {
	await fns.fade(container, -.34)
	dom.children(container, ...kids)
	await fns.fade(container, .25)
}

export interface LoadErrorHandler {
	(err: Error, retry: () => void): Promise<void>
}
export interface LoadFunction {
	(): [types.Aborter, Promise<HTMLElement[]>]
}

export const load = async (app: types.Looker, container: HTMLElement, fn: LoadFunction, errorHandler: LoadErrorHandler): Promise<void> => {
	let opacity = 1
	let loadingShow = 0

	// we (slowly) fade out current content.
	// hopefully we're interrupted by a resolved promised with the new content.
	// if so, this interval function is canceled and the new content shown.
	// if not, this interval cancels itself, but first shows a box saying "loading...", along with a button to abort the operation.
	let id = window.setInterval(() => {
		if (opacity > 0) {
			opacity -= opacity > .5 ? .1 : .05
			container.style.opacity = '' + Math.max(0, opacity)
			return
		}

		window.clearInterval(id)
		id = 0

		loadingShow = new Date().getTime()
		container.style.opacity = '1'
		let abortElem = dom.span()
		if (aborter.abort) {
			abortElem = dom.button(
				app.looks.btnSecondary,
				dom.listen('click', ev => {
					if (aborter.abort) {
						aborter.abort()
					}
				}),
				'abort'
			)
		}
		dom.children(container,
			fns.middle(
				app,
				dom.div(
					dom.span('loading...'),
					dom.span(app.looks.spin),
				),
				dom.br(),
				abortElem,
			)
		)
	}, 16)

	let [aborter, promise] = fn()

	let kids: HTMLElement[]
	try {
		kids = await promise
	} catch (err) {
		if (id !== 0) {
			window.clearInterval(id)
		}
		container.style.opacity = '1'
		const retry = () => load(app, container, fn, errorHandler)
		await errorHandler(err, retry)
		return
	}
	if (id !== 0) {
		window.clearInterval(id)
	}

	// make sure any "still loading" content is visible at least 250ms, to prevent flashing
	let wait = 0
	if (loadingShow > 0) {
		wait = 250 - (new Date().getTime() - loadingShow)
		if (wait < 0) {
			wait = 0
		}
	}
	await fns.delay(wait)

	await fns.fade(container, -.34)
	dom.children(container, ...kids)
	fns.fade(container, .25)
}
