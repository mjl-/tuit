import { div, _style } from '../dom'
import * as types from './types'


export class Split implements types.UI {
	ui: HTMLElement

	constructor(...elems: HTMLElement[]) {
		const makeChild = (e: HTMLElement) => div(
			{ ui: 'SplitChild' },
			_style({
				display: 'flex',
				'height': '100%',
				'overflow-y': 'auto',
			}),
			e,
		)
		const x = [makeChild(elems[0])]
		elems.slice(1).map(e => {
			x.push(
				div(
					{ ui: 'SplitBorder' },
					_style({
						'height': '100%',
						width: '1px',
						'background-color': '#ddd',
					})
				)
			)
			x.push(makeChild(e))
		})
		if (x.length > 0) {
			x[x.length - 1].style.setProperty('flex-grow', '1')
		}
		this.ui = div(
			{ ui: 'Split' },
			_style({
				display: 'flex',
				height: '100%',
				'flex-grow': 1,
				'flex-direction': 'row',
				//					'align-items': 'stretch'
			}),
			...x
		)
	}
}
