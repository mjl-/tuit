import * as dg from '../domgen'
import * as types from './types'
import * as classes from './classes'
import * as functions from './functions'

export class Failure implements types.UI {
	ui: HTMLElement

	constructor(classes: classes.Classes, message: string) {
		this.ui = dg.div(
			dg.h1(classes.title, 'Error'),
			dg.p(
				dg._style({ 'white-space': 'pre-wrap' }),
				dg._style({ color: 'red' }),
				functions.titleize(message),
			),
		)
	}

	focus() {
	}
}

