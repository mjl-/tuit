import * as dg from '../domgen'
import * as functions from './functions'
import * as classes from './classes'

export const save = (
	classes: classes.Classes,
	spinBox: HTMLElement,
	disabler: { disabled: boolean } | null,
	msg: string,
	fn: () => Promise<void>,
	errorHandler: (err: Error) => void,
) => {
	dg.children(spinBox, dg.span(classes.spin))
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
			const checkmark = dg.span(
				dg._style({ opacity: 0 }),
				classes.checkmarkSuccess,
			)
			dg.children(spinBox, checkmark)
			functions.fade(checkmark, .2, () => { })
			setTimeout(() => functions.fade(checkmark, -.2, () => dg.children(spinBox)), 1000)
			_finally()
		})
		.catch((err: Error) => {
			errorHandler(err)
			_finally()
		})
}
