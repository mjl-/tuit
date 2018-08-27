import * as dom from '../dom'
import * as types from './types'
import * as classes from './classes'
import * as popup from './popup'
import * as styles from './styles'

export class Confirm implements types.UI {
	root: HTMLElement

	private button: HTMLElement

	constructor(classes: classes.Classes, title: string, message: string, action: string, fn: () => void) {
		const spinBox = dom.span()
		this.root = dom.div(
			dom.h1(classes.title, title),
			dom.p(
				dom._style({ 'white-space': 'pre-wrap' }),
				message,
			),
			dom.br(),
			dom.div(
				styles.textAlign.right,
				spinBox,
				this.button = dom.button(
					classes.btnPrimary,
					dom.listener('click', ev => fn()),
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
