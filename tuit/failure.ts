import * as dom from '../dom'
import * as types from './types'
import * as classes from './classes'
import * as functions from './functions'

export class Failure implements types.UI {
	ui: HTMLElement

	constructor(classes: classes.Classes, message: string) {
		this.ui = dom.div(
			dom.h1(classes.title, 'Error'),
			dom.p(
				dom._style({ 'white-space': 'pre-wrap' }),
				dom._style({ color: 'red' }),
				functions.titleize(message),
			),
		)
	}

	focus() {
	}
}

