import { div, _style } from '../domgen'
import * as dg from '../domgen'
import * as types from './types'
import * as classes from './classes'
import * as popup from './popup'
import * as styles from './styles'

export class Confirm implements types.UI {
	ui: HTMLElement

	private button: HTMLElement

	constructor(classes: classes.Classes, title: string, message: string, action: string, fn: () => void) {
		const spinBox = dg.span()
		this.ui = div(
			dg.h1(classes.title, title),
			dg.p(
				_style({ 'white-space': 'pre-wrap' }),
				message,
			),
			dg.br(),
			div(
				styles.textAlign.right,
				spinBox,
				this.button = dg.button(
					classes.btnPrimary,
					dg.listener('click', ev => fn()),
					action,
				),
			),
		)
	}

	focus() {
		this.button.focus()
	}
}

export const confirm = (root: HTMLElement, classes: classes.Classes, title: string, message: string, action: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const confirm = new Confirm(classes, title, message, action, () => {
			resolve()
			close()
		})
		const close = popup.popup(root, popup.PopupSize.Small, confirm, reject)
	})
}
