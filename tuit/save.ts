import * as dom from '../dom'
import * as functions from './functions'
import * as types from './types'

export const save = (
	app: types.Looker,
	spinBox: HTMLElement,
	disabler: { disabled: boolean } | null,
	msg: string,
	fn: () => Promise<void>,
	errorHandler: (err: Error) => void,
) => {
	dom.children(spinBox, dom.span(app.looks.spin))
	if (disabler) {
		disabler.disabled = true
	}
	const _finally = () => {
		if (disabler) {
			disabler.disabled = false
		}
	}
	fn()
		.then(() => {
			const checkmark = dom.span(
				dom._style({ opacity: 0 }),
				app.looks.checkmarkSuccess,
			)
			dom.children(spinBox, checkmark)
			functions.fade(checkmark, .2, () => { })
			setTimeout(() => functions.fade(checkmark, -.2, () => dom.children(spinBox)), 1000)
			_finally()
		})
		.catch((err: Error) => {
			errorHandler(err)
			_finally()
		})
}
