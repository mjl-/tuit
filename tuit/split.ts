import * as dom from '../dom'

export class Split implements dom.Rooter {
	root: HTMLElement

	constructor(...elems: HTMLElement[]) {
		const makeChild = (e: HTMLElement) => dom.div(
			{ ui: 'SplitChild' },
			dom._style({
				display: 'flex',
				height: '100%',
				overflowY: 'auto',
			}),
			e,
		)
		const x = [makeChild(elems[0])]
		elems.slice(1).map(e => {
			x.push(
				dom.div(
					{ ui: 'SplitBorder' },
					dom._style({
						height: '100%',
						width: '1px',
						backgroundColor: '#ddd',
					})
				)
			)
			x.push(makeChild(e))
		})
		if (x.length > 0) {
			x[x.length - 1].style.setProperty('flex-grow', '1')
		}
		this.root = dom.div(
			{ ui: 'Split' },
			dom._style({
				display: 'flex',
				height: '100%',
				flexGrow: 1,
				flexDirection: 'row',
			}),
			...x
		)
	}
}
