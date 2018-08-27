import * as dom from '../dom'
import * as types from './types'

export class Popover implements dom.Rooter {
	root: HTMLElement

	constructor(app: types.Looker, elem: HTMLElement) {
		this.root = dom.div(
			dom._style({
				position: 'absolute',
				bottom: '2.2em',
				width: '100%',
				border: '1px solid #ccc',
				borderRadius: '.25em',
				boxShadow: '0 0 10px #ccc',
				marginTop: '0.25em',
				backgroundColor: 'white',
				padding: '0.25em',
				zIndex: 2,
				overflowY: 'auto',
				maxHeight: '10em',
			}),
			elem,
		)
	}
}
