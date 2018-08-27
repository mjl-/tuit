import * as dom from '../dom'
import * as types from './types'
import * as functions from './functions'

export class Failure implements types.UI {
	root: HTMLElement

	constructor(app: types.Looker, message: string) {
		this.root = dom.div(
			dom.h1(app.looks.title, 'Error'),
			dom.p(
				dom._style({ whiteSpace: 'pre-wrap' }),
				dom._style({ color: 'red' }),
				functions.titleize(message),
			),
		)
	}

	focus() {
	}
}

