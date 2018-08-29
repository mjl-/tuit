import * as dom from '../dom'
import * as types from './types'
import * as attr from './attr'
import * as fns from './fns'

export enum PopupSize {
	Small,
	Medium,
	Large,
}

const popupCloseBtnStyle: dom.CSSProperties = {
	cursor: 'pointer',
	position: 'absolute',
	right: '0',
	top: '0',
	color: '#888',
	padding: '0.25em 0.5em 0.5em',
}

const popupBgStyle: dom.CSSProperties = {
	position: 'fixed',
	top: '0',
	left: '0',
	right: '0',
	bottom: '0',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	opacity: 0,
}

const popupStyle: dom.CSSProperties = {
	position: 'fixed',
	top: '30px',
	backgroundColor: 'white',
	padding: '1em 2em 2em 2em',
	boxShadow: '0 0 100px #666',
	borderRadius: '.25em',
	opacity: 0,
}
const popupSmallStyle: dom.CSSProperties = {
	left: 'calc(50% - 200px)',
	right: 'calc(50% - 200px)',
}
const popupMediumStyle: dom.CSSProperties = {
	left: 'calc(50% - 300px)',
	right: 'calc(50% - 300px)',
}
const popupLargeStyle: dom.CSSProperties = {
	left: 'calc(50% - 450px)',
	right: 'calc(50% - 450px)',
}


export const popup = (app: types.Looker & dom.Rooter, size: PopupSize, view: types.UI & types.Focuser, canceled: () => void) => {
	const looksPopupCloseBtn = app.ensureLooks('popup-close-btn', popupCloseBtnStyle)
	const looksPopupBg = app.ensureLooks('popup-bg', popupBgStyle)
	const looksPopup =
		size === PopupSize.Small ? app.ensureLooks('popup-small', popupStyle, popupSmallStyle) :
			size === PopupSize.Medium ? app.ensureLooks('popup-medium', popupStyle, popupMediumStyle) :
				app.ensureLooks('popup-large', popupStyle, popupLargeStyle)

	const close = () => {
		bg.remove()
		popup.remove()
	}
	const closeButton = dom.div(
		looksPopupCloseBtn,
		attr.tabindex0,
		dom.listen('click', ev => {
			close()
			canceled()
		}),
		'x',
	)
	const bg = dom.div(
		looksPopupBg,
		dom.listen('click', ev => {
			close()
			canceled()
		}),
	)
	const popup = dom.div(
		looksPopup,
		closeButton,
		view,
		dom.listen('keyup', ev => {
			if (ev.key === 'Escape') {
				ev.stopPropagation()
				close()
				canceled()
			}
		})
	)
	app.root.appendChild(bg)
	app.root.appendChild(popup)
	fns.fade(bg, .25, () => { })
	fns.fade(popup, .25, () => { })
	closeButton.focus() // in case view.focus() doesn't set a focus
	view.focus()
	return close
}
