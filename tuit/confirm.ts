import * as dom from '../dom'
import * as types from './types'
import * as popup from './popup'
import * as styles from './styles'

export class Confirm implements types.UI {
	root: HTMLElement

	private button: HTMLElement

	constructor(app: types.Looker, title: string, message: string, action: string, fn: () => void) {
		const spinBox = dom.span()
		this.root = dom.div(
			dom.h1(app.looks.title, title),
			dom.p(
				app.looks.textWrap,
				message,
			),
			dom.br(),
			dom.div(
				styles.textAlign.right,
				spinBox,
				this.button = dom.button(
					app.looks.btnPrimary,
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

export const confirm = (app: types.Looker & dom.Rooter, title: string, message: string, action: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const confirm = new Confirm(app, title, message, action, () => {
			resolve()
			close()
		})
		const close = popup.popup(app, popup.PopupSize.Small, confirm, reject)
	})
}
