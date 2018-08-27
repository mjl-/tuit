import * as dom from '../dom'
import * as types from './types'
import * as attr from './attr'
import * as functions from './functions'

export enum PopupSize {
	Small,
	Medium,
	Large,
}

export const popup = (root: HTMLElement, size: PopupSize, view: types.UI & types.Focuser, canceled: () => void) => {
	const close = () => {
		bg.remove()
		popup.remove()
	}
	const closeButton = dom.div(
		attr.tabindex0,
		dom._style({
			cursor: 'pointer',
			position: 'absolute',
			right: '0',
			top: '0',
			color: '#888',
			padding: '0.25em 0.5em 0.5em',
		}),
		'x',
		dom.listener('click', ev => {
			close()
			canceled()
		})
	)
	const bg = dom.div(
		dom._style({
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			opacity: 0,
		}),
		dom.listener('click', ev => {
			close()
			canceled()
		}),
	)
	let halfWidth = '300px'
	if (size === PopupSize.Small) {
		halfWidth = '200px'
	} else if (size === PopupSize.Large) {
		halfWidth = '450px'
	}
	const popup = dom.div(
		dom._style({
			position: 'fixed',
			top: '30px',
			left: 'calc(50% - ' + halfWidth + ')',
			right: 'calc(50% - ' + halfWidth + ')',
			backgroundColor: 'white',
			padding: '1em 2em 2em 2em',
			boxShadow: '0 0 100px #666',
			borderRadius: '.25em',
			opacity: 0,
		}),
		closeButton,
		view,
		dom.listener('keyup', ev => {
			if (ev.key === 'Escape') {
				ev.stopPropagation()
				close()
				canceled()
			}
		})
	)
	root.appendChild(bg)
	root.appendChild(popup)
	functions.fade(bg, .25, () => { })
	functions.fade(popup, .25, () => { })
	closeButton.focus() // in case view.focus() doesn't set a focus
	view.focus()
	return close
}
