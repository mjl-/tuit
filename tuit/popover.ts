import * as dom from '../dom'
import * as classes from './classes'

export class Popover implements dom.Rooter {
	root: HTMLElement

	constructor(classes: classes.Classes, elem: HTMLElement) {
		this.root = dom.div(
			dom._style({
				position: 'absolute',
				bottom: '2.2em',
				width: '100%',
				border: '1px solid #ccc',
				'border-radius': '.25em',
				'box-shadow': '0 0 10px #ccc',
				'margin-top': '0.25em',
				'background-color': 'white',
				padding: '0.25em',
				'z-index': 2,
				'overflow-y': 'auto',
				'max-height': '10em',
			}),
			elem,
		)
	}
}
