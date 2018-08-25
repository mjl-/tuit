import * as dg from './domgen'
import { div, _style } from './domgen'

export const textAlign = {
	left: _style({ 'text-align': 'left' }),
	center: _style({ 'text-align': 'center' }),
	right: _style({ 'text-align': 'right' }),
}
export const tabindex0 = { tabindex: '0' }

export const titleize = (s: string) => s.substring(0, 1).toUpperCase() + s.substring(1)

export enum PopupSize {
	Small,
	Medium,
	Large,
}

export type StateWord = (string | StateArray)
export type State = StateWord[]
export interface StateArray extends Array<StateWord> { }

export interface Rooter {
	root: HTMLElement
}

// Most UIs are "Staters": they can load a state and return their current state.
// The state comes from the location.hash. UIs that deal with state should call StateSaver.saveState when their state has changed.
export interface Stater {
	loadState: (state: State) => Promise<void>	// Called (at most) once, usually right after creation of the UI. The promise must always resolve, after any child UIs have resolved.
	currentState: () => State	// Return current state, including state of the children.
}

export const parseState = (): State => {
	const words = location.hash ? decodeURI(location.hash || '#').substring(1).split(' ') : []

	const takeArray = (): State => {
		const r: State = []
		while (words.length > 0 && words[0] !== '.') {
			const w = words[0]
			words.shift()
			if (w === '/') {
				r.push(takeArray())
				words.shift()
			} else {
				r.push(w)
			}
		}
		return r
	}
	const r = takeArray()
	return r
}

export interface StateSaver {
	// UIs must call this function after user interaction. eg after selecting a new item from the list, opening a different tab.
	// But only if those interactions cause the state to change.
	saveState: () => void
}

export interface Saver {
	save: (spinBox: HTMLElement, disabler: { disabled: boolean } | null, msg: string, fn: () => Promise<void>) => void
}

export interface Loader {
	load: (elem: HTMLElement, fn: () => [Aborter, Promise<HTMLElement[]>], loaded?: () => void) => void
}

export interface Classer {
	classes: Classes
}

export interface UI {
	ui: HTMLElement
}

export const isUI = (v: any): v is UI => {
	return 'ui' in v && v.ui instanceof HTMLElement
}

export interface Focuser {
	focus(): void
}

export interface Aborter {
	abort?: () => void
}

export interface Boxer {
	box: (...l: dg.ElemArg[]) => HTMLElement
}

export class Split implements UI {
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

export class Confirm implements UI {
	ui: HTMLElement

	private button: HTMLElement

	constructor(classes: Classes, title: string, message: string, action: string, fn: () => void) {
		const spinBox = dg.span()
		this.ui = div(
			dg.h1(classes.title, title),
			dg.p(
				_style({ 'white-space': 'pre-wrap' }),
				message,
			),
			dg.br(),
			div(
				textAlign.right,
				spinBox,
				this.button = dg.button(
					classes.btnPrimary,
					dg.listener('click', ev => fn()),
					action,
				),
			),
		)
	}

	focus() {
		this.button.focus()
	}
}

export const confirm = (root: HTMLElement, classes: Classes, title: string, message: string, action: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const confirm = new Confirm(classes, title, message, action, () => {
			resolve()
			close()
		})
		const close = popup(root, PopupSize.Small, confirm, reject)
	})
}

export class Failure implements UI {
	ui: HTMLElement

	constructor(classes: Classes, message: string) {
		this.ui = div(
			dg.h1(classes.title, 'Error'),
			dg.p(
				_style({ 'white-space': 'pre-wrap' }),
				_style({ color: 'red' }),
				titleize(message),
			),
		)
	}

	focus() {
	}
}

export class Popover implements UI {
	ui: HTMLElement

	constructor(classes: Classes, elem: HTMLElement) {
		this.ui = div(
			_style({
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

export class TypeaheadOption implements UI {
	ui: HTMLElement

	constructor(classes: Classes, public value: string, typeahead: Typeahead) {
		this.ui = div(
			classes.typeaheadOption,
			_style({ padding: '0.25em' }),
			tabindex0,
			value,
			dg.listener('click', ev => typeahead.selected(this)),
			dg.listener('keydown', ev => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					typeahead.selected(this)
				}
			}),
			dg.listener('blur', ev => typeahead.checkFocus()),
		)
	}
}

const commonPrefix = (s: string, l: string[]): string => {
	if (l.length === 0) {
		return s
	}
	let v = l[0]
	l.forEach(e => {
		let i: number
		for (i = 0; i < v.length && i < e.length && v[i] === e[i]; i++) {
		}
		v = v.substring(0, i)
	})
	return v
}

export class Typeahead implements UI {
	ui: HTMLElement

	private popoverBox: HTMLElement
	private optionsAll: TypeaheadOption[]
	private optionsFiltered: TypeaheadOption[]
	private input: HTMLInputElement
	private optionsBox: HTMLElement
	private popover: Popover

	constructor(
		private classes: Classes,
		value: string,
		private values: string[],
		private inputClass: { class: string },
		inputFocusedClass: { class: string },
		private select: (v: string) => void,
		create: (v: string) => void,
		private focused: () => void,
		private blurred: () => void,
	) {
		this.optionsAll = this.values.map(v => new TypeaheadOption(classes, v, this))
		this.optionsFiltered = this.optionsAll
		this.popoverBox = div()
		this.optionsBox = div(
			...this.optionsFiltered,
		)
		this.popover = new Popover(classes, this.optionsBox)
		this.input = dg.input(
			inputClass,
			{ value: value },
			dg.listener('focus', ev => {
				this.focused()
				this.input.className = inputFocusedClass.class
				this.filter(true)
			}),
			dg.listener('blur', ev => this.checkFocus()),
			dg.listener('keydown', ev => {
				if (ev.key === 'Enter') {
					if (this.input.value) {
						if (this.values.includes(this.input.value)) {
							select(this.input.value)
						} else {
							create(this.input.value)
						}
					}
				} else if (ev.key === 'f' && ev.getModifierState('Control')) {
					ev.preventDefault()
					this.input.value = commonPrefix(this.input.value, this.optionsFiltered.map(o => o.value))
				}
			}),
			dg.listener('keyup', ev => {
				this.filter(true)
			}),
		)
		this.ui = dg.div(
			_style({ position: 'relative' }),
			this.input,
			this.popoverBox,
		)
	}

	value() {
		return this.input.value
	}

	focus() {
		this.input.focus()
	}

	setValue(v: string) {
		this.input.value = v
		this.filter(false)
	}

	removeValue(v: string) {
		const i = this.values.indexOf(v)
		if (i < 0) {
			throw new Error('could not find value')
		}
		this.values.splice(i, 1)
		this.optionsAll.splice(i, 1)
		this.filter(false)
	}

	addValue(v: string) {
		this.values.push(v)
		this.values.sort()
		const i = this.values.indexOf(v)
		this.optionsAll.splice(i, 0, new TypeaheadOption(this.classes, v, this))
		this.filter(false)
	}

	filter(ensure: boolean) {
		const v = this.input.value.toLowerCase()
		this.optionsFiltered = []
		this.values.forEach((vv, i) => {
			if (vv.toLowerCase().includes(v)) {
				this.optionsFiltered.push(this.optionsAll[i])
			}
		})
		if (this.optionsFiltered.length === 0) {
			dg.children(this.popoverBox)
		} else if (this.popoverBox.childElementCount > 0 || ensure) {
			dg.children(this.optionsBox, ...this.optionsFiltered)
			dg.children(this.popoverBox, this.popover)
		}
	}

	selected(o: TypeaheadOption) {
		this.select(o.value)
	}

	isFocused(): boolean {
		const elem = document.activeElement
		if (elem === this.input) {
			return true
		}
		for (let i = 0; i < this.optionsFiltered.length; i++) {
			if (this.optionsFiltered[i].ui === elem) {
				return true
			}
		}
		return false
	}

	checkFocus() {
		setTimeout(() => {
			if (this.isFocused()) {
				return
			}

			this.input.className = this.inputClass.class
			dg.children(this.popoverBox)
			this.blurred()
		}, 0)
	}
}

export const popup = (root: HTMLElement, size: PopupSize, view: UI & Focuser, canceled: () => void) => {
	const close = () => {
		bg.remove()
		popup.remove()
	}
	const closeButton = div(
		tabindex0,
		_style({
			cursor: 'pointer',
			position: 'absolute',
			right: '0',
			top: '0',
			color: '#888',
			padding: '0.25em 0.5em 0.5em',
		}),
		'x',
		dg.listener('click', ev => {
			close()
			canceled()
		})
	)
	const bg = div(
		_style({
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
			'background-color': 'rgba(0, 0, 0, 0.5)',
			opacity: '0',
		}),
		dg.listener('click', ev => {
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
	const popup = div(
		_style({
			position: 'fixed',
			top: '30px',
			left: 'calc(50% - ' + halfWidth + ')',
			right: 'calc(50% - ' + halfWidth + ')',
			'background-color': 'white',
			'padding': '1em 2em 2em 2em',
			'box-shadow': '0 0 100px #666',
			'border-radius': '.25em',
			opacity: '0',
		}),
		closeButton,
		view,
		dg.listener('keyup', ev => {
			if (ev.key === 'Escape') {
				ev.stopPropagation()
				close()
				canceled()
			}
		})
	)
	root.appendChild(bg)
	root.appendChild(popup)
	fade(bg, .25, () => { })
	fade(popup, .25, () => { })
	closeButton.focus() // in case view.focus() doesn't set a focus
	view.focus()
	return close
}

export const fade = (elem: HTMLElement, step: number, done: () => void) => {
	let opacity = step < 0 ? 1 : 0
	let id = window.setInterval(() => {
		opacity += step
		elem.style.opacity = '' + opacity
		if (opacity <= 0 || opacity >= 1) {
			window.clearInterval(id)
			done()
		}
	}, 16)
}

export const load = (classes: Classes, elem: HTMLElement, fn: () => [Aborter, Promise<HTMLElement[]>], error: (err: Error, retry: () => void) => void, loaded?: () => void) => {
	let opacity = 1
	let loadingShow = 0
	let elems: HTMLElement[] | null

	const show = () => {
		let wait = 0
		if (loadingShow > 0) {
			wait = 250 - (new Date().getTime() - loadingShow)
			if (wait < 0) {
				wait = 0
			}
		}
		setTimeout(() => {
			if (!elems) {
				return
			}
			elem.style.opacity = '0'
			dg.children(elem, ...elems)
			fade(elem, .25, () => {
				if (loaded) {
					loaded()
				}
			})
		}, wait)
	}

	let id = window.setInterval(() => {
		if (opacity > 0) {
			opacity -= !!elems ? .34 : (opacity > .5 ? .1 : .05)
			elem.style.opacity = '' + opacity
			return
		}

		clearInterval(id)
		id = 0

		if (elems) {
			show()
			return
		}

		loadingShow = new Date().getTime()
		elem.style.opacity = '1'
		let abortElem = dg.span()
		if (aborter.abort) {
			abortElem = dg.button(
				classes.btnSecondary,
				dg.listener('click', ev => {
					if (aborter.abort) {
						aborter.abort()
					}
				}),
				'abort'
			)
		}
		dg.children(elem,
			dg.middle(
				div(
					dg.span('loading...'),
					dg.span(classes.spin),
				),
				dg.br(),
				abortElem,
			)
		)
	}, 16)

	const [aborter, promise] = fn()
	promise
		.then((kids: HTMLElement[]) => {
			elems = kids
			if (id === 0) {
				show()
			}
		})
		.catch((err: Error) => {
			if (id != 0) {
				window.clearInterval(id)
			}
			elem.style.opacity = '1'
			error(err, () => load(classes, elem, fn, error, loaded))
		})
}

export const save = (
	classes: Classes,
	spinBox: HTMLElement,
	disabler: { disabled: boolean } | null,
	msg: string,
	fn: () => Promise<void>,
	errorHandler: (err: Error) => void,
) => {
	dg.children(spinBox, dg.span(classes.spin))
	if (disabler) {
		disabler.disabled = true
	}
	const _finally = () => {
		if (disabler) {
			disabler.disabled = false
		}
	}
	fn()
		.then(() => {
			const checkmark = dg.span(
				_style({ opacity: 0 }),
				classes.checkmarkSuccess,
			)
			dg.children(spinBox, checkmark)
			fade(checkmark, .2, () => { })
			setTimeout(() => fade(checkmark, -.2, () => dg.children(spinBox)), 1000)
			_finally()
		})
		.catch((err: Error) => {
			errorHandler(err)
			_finally()
		})
}

export const rowMarkSelected = (classes: Classes, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = classes.listItemSelected.class
	primary.className = classes.listItemSelectedPrimary.class
	secondary.className = classes.listItemSelectedSecondary.class
}

export const rowMarkUnselected = (classes: Classes, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = classes.listItem.class
	primary.className = classes.listItemPrimary.class
	secondary.className = classes.listItemSecondary.class
}

export const boxPaddingStyle = 'padding: 0.25em 0.5em;'
export const boxMarginStyle = 'margin: 0.25em 0.5em;'
export const boxPaddingLastStyle = 'padding: 0.25em 0.5em 1em 0.5em;'
export const boxMarginLastStyle = 'margin: 0.25em 0.5em 1em 0.5em;'

export class Classes {
	uniqueID: string

	header: { 'class': string }
	title: { 'class': string }
	formInput: { 'class': string }
	textarea: { 'class': string }
	tableInput: { 'class': string }
	tableInputSmall: { 'class': string }
	searchInput: { 'class': string }
	searchInputFiltered: { 'class': string }
	searchInputNoresults: { 'class': string }
	btnSuccess: { 'class': string }
	btnDanger: { 'class': string }
	btnPrimary: { 'class': string }
	btnSecondary: { 'class': string }
	btnLight: { 'class': string }
	groupBtnSuccess: { 'class': string }
	groupBtnDanger: { 'class': string }
	groupBtnPrimary: { 'class': string }
	groupBtnSecondary: { 'class': string }
	groupBtnLight: { 'class': string }
	navBtnActive: { 'class': string }
	navBtnInactive: { 'class': string }
	navSearchActive: { 'class': string }
	navSearchInactive: { 'class': string }
	cell: { 'class': string }
	headerCell: { 'class': string }
	dayHeaderCell: { 'class': string }
	spin: { 'class': string }
	typeaheadOption: { 'class': string }
	box: { 'class': string }
	listItem: { 'class': string }
	listItemSelected: { 'class': string }
	listItemPrimary: { 'class': string }
	listItemSecondary: { 'class': string }
	listItemSelectedPrimary: { 'class': string }
	listItemSelectedSecondary: { 'class': string }
	boxPadding: { 'class': string }
	boxMargin: { 'class': string }
	boxPaddingLast: { 'class': string }
	boxMarginLast: { 'class': string }
	checkmarkSuccess: { 'class': string }

	constructor(private style: HTMLStyleElement, private baseClassName: string) {
		this.uniqueID = ('' + Math.random()).substring(2, 10)

		const css = `
{
	line-height: 1.5;
	font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
	font-size: 15px;
}
* {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
	box-sizing: border-box;
}
ol {
	list-style: none;
}
ul {
	list-style: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}`
		css.split('}').forEach(rule => {
			if (rule && style.sheet) {
				rule = '.' + baseClassName + '-' + this.uniqueID + ' ' + rule + '}'
				const sheet = style.sheet as CSSStyleSheet
				sheet.insertRule(rule, sheet.cssRules.length)
			}
		})

		this.header = this.uniqueClass('header')
		this.title = this.uniqueClass('title')
		this.formInput = this.uniqueClass('form-input')
		this.textarea = this.uniqueClass('textarea')
		this.tableInput = this.uniqueClass('table-input')
		this.tableInputSmall = this.uniqueClass('table-input-small')
		this.searchInput = this.uniqueClass('search-input')
		this.searchInputFiltered = this.uniqueClass('search-input-filtered')
		this.searchInputNoresults = this.uniqueClass('search-input-noresults')
		this.btnSuccess = this.uniqueClass('btn-success')
		this.btnDanger = this.uniqueClass('btn-danger')
		this.btnPrimary = this.uniqueClass('btn-primary')
		this.btnSecondary = this.uniqueClass('btn-secondary')
		this.btnLight = this.uniqueClass('btn-light')
		this.groupBtnSuccess = this.uniqueClass('groupbtn-success')
		this.groupBtnDanger = this.uniqueClass('groupbtn-danger')
		this.groupBtnPrimary = this.uniqueClass('groupbtn-primary')
		this.groupBtnSecondary = this.uniqueClass('groupbtn-secondary')
		this.groupBtnLight = this.uniqueClass('groupbtn-light')
		this.navBtnActive = this.uniqueClass('nav-btn-active')
		this.navBtnInactive = this.uniqueClass('nav-btn-inactive')
		this.navSearchInactive = this.uniqueClass('nav-search-inactive')
		this.navSearchActive = this.uniqueClass('nav-search-active')
		this.cell = this.uniqueClass('cell')
		this.headerCell = this.uniqueClass('header-cell')
		this.dayHeaderCell = this.uniqueClass('day-header-cell')
		this.spin = this.uniqueClass('spin')
		this.typeaheadOption = this.uniqueClass('typeahead-option')
		this.box = this.uniqueClass('box')
		this.listItem = this.uniqueClass('list-item')
		this.listItemSelected = this.uniqueClass('list-item-selected')
		this.listItemPrimary = this.uniqueClass('list-item-primary')
		this.listItemSecondary = this.uniqueClass('list-item-secondary')
		this.listItemSelectedPrimary = this.uniqueClass('list-item-selected-primary')
		this.listItemSelectedSecondary = this.uniqueClass('list-item-selected-secondary')
		this.boxPadding = this.uniqueClass('box-padding')
		this.boxMargin = this.uniqueClass('box-margin')
		this.boxPaddingLast = this.uniqueClass('box-padding-last')
		this.boxMarginLast = this.uniqueClass('box-margin-last')
		this.checkmarkSuccess = this.uniqueClass('checkmark-success')

		const roundCornerStyle = 'border-radius: .25em;'

		const buttonStyle = `
				font-size: 1em;
				border: none;
				padding: 0em 0.6em 0.15em;
				cursor: pointer;
			`

		const btnSuccessStyle = buttonStyle + `
				color: #fff;
				background-color: #28a745;
				border-color: #28a745;
			`
		const btnSuccessHoverStyle = `
				background-color: #218838;
				border-color: #1e7e34;
			`
		const btnSuccessFocusStyle = `
				box-shadow: 0 0 0 0.2em rgba(40,167,69,.5)
			`
		const btnSuccessActiveStyle = `
				background-color: #1e7e34;
				border-color: #1c7430;
			`

		const btnDangerStyle = buttonStyle + `
				color: #fff;
				background-color: #dc3545;
				border-color: #dc3545;
			`
		const btnDangerHoverStyle = `
				background-color: #c82333;
				border-color: #bd2130;
			`
		const btnDangerFocusStyle = `
				box-shadow: 0 0 0 0.2em rgba(220,53,69,.5)
			`
		const btnDangerActiveStyle = `
				background-color: #bd2130;
				border-color: #b21f2d;
			`

		const primaryColor = '#007bff'
		const btnPrimaryStyle = buttonStyle + `
				color: #fff;
				background-color: #007bff;
				border-color: #007bff;
			`
		const btnPrimaryHoverStyle = `
				background-color: #0069d9;
				border-color: #0062cc;
			`
		const btnPrimaryFocusStyle = `
				box-shadow: 0 0 0 0.2em rgba(0,123,255,.5)
			`
		const btnPrimaryActiveStyle = `
				background-color: #0062cc;
				border-color: #005cbf;
			`

		const btnSecondaryStyle = buttonStyle + `
				color: #fff;
				background-color: #6c757d;
				border-color: #6c757d;
			`
		const btnSecondaryHoverStyle = `
				background-color: #5a6268;
				border-color: #545b62;
			`
		const btnSecondaryFocusStyle = `
				box-shadow: 0 0 0 0.2em rgba(108,117,125,.5)
			`
		const btnSecondaryActiveStyle = `
				background-color: #545b62;
				border-color: #4e555b;
			`

		const btnLightStyle = buttonStyle + `
				color: #212529;
				background-color: #f8f9fa;
				border-color: #f8f9fa;
			`
		const btnLightHoverStyle = `
				background-color: #e2e6ea;
				border-color: #dae0e5;
			`
		const btnLightFocusStyle = `
				box-shadow: 0 0 0 .2rem rgba(248,249,250,.5)
			`
		const btnLightActiveStyle = `
				background-color: #dae0e5;
				border-color: #d3d9df;
			`

		this.addRule(this.header, `
				font-weight: normal;
				padding: 0.25em 0;
				font-size: 1.5em;
			`)
		this.addRule(this.title, `
				font-weight: bold;
				padding: 0.25em 0;
				margin-bottom: 1.5ex;
			`)
		const inputStyle = `
				display: block;
				font-size: 1em;
				padding: 0.4em;
				border-radius: .25em;
				border: 1px solid #ccc;
				line-height: 1;
			`
		this.addRule(this.formInput, inputStyle + `
				margin-bottom: 1em;
				margin-top: 0.5em;
			`)
		this.addRule(this.tableInput, inputStyle + ' width: 100%;')
		this.addRule(this.tableInputSmall, inputStyle + ' display: inline; width: 3em;')
		this.addRule(this.textarea, `
				display: block;
				margin-bottom: 1em;
				font-size: 1em;
				padding: 0.4em;
				border-radius: .25em;
				border: 1px solid #ccc;
				margin-top: 0.5em;
				line-height: 1;
			`)
		const searchInputStyle = `
				display: block;
				padding: 0.4em;
				border-radius: .25em;
				border: 1px solid #ccc;
				line-height: 1;
			`
		this.addRule(this.searchInput, searchInputStyle)
		this.addRule(this.searchInputFiltered, searchInputStyle + `background-color: #28a74540;`)
		this.addRule(this.searchInputNoresults, searchInputStyle + `background-color: #dc354540;`)
		this.addRulePseudo(this.searchInput, ':focus', `border-color: #999;`)
		this.addRulePseudo(this.searchInputFiltered, ':focus', `border-color: #999;`)
		this.addRulePseudo(this.searchInputNoresults, ':focus', `border-color: #999;`)


		this.addRule(this.btnSuccess, btnSuccessStyle + roundCornerStyle)
		this.addRulePseudo(this.btnSuccess, ':active', btnSuccessActiveStyle)
		this.addRulePseudo(this.btnSuccess, ':hover', btnSuccessHoverStyle)
		this.addRulePseudo(this.btnSuccess, ':focus', btnSuccessFocusStyle)

		this.addRule(this.btnDanger, btnDangerStyle + roundCornerStyle)
		this.addRulePseudo(this.btnDanger, ':active', btnDangerActiveStyle)
		this.addRulePseudo(this.btnDanger, ':hover', btnDangerHoverStyle)
		this.addRulePseudo(this.btnDanger, ':focus', btnDangerFocusStyle)

		this.addRule(this.btnPrimary, btnPrimaryStyle + roundCornerStyle)
		this.addRulePseudo(this.btnPrimary, ':active', btnPrimaryActiveStyle)
		this.addRulePseudo(this.btnPrimary, ':hover', btnPrimaryHoverStyle)
		this.addRulePseudo(this.btnPrimary, ':focus', btnPrimaryFocusStyle)

		this.addRule(this.btnSecondary, btnSecondaryStyle + roundCornerStyle)
		this.addRulePseudo(this.btnSecondary, ':active', btnSecondaryActiveStyle)
		this.addRulePseudo(this.btnSecondary, ':hover', btnSecondaryHoverStyle)
		this.addRulePseudo(this.btnSecondary, ':focus', btnSecondaryFocusStyle)

		this.addRule(this.btnLight, btnLightStyle + roundCornerStyle)
		this.addRulePseudo(this.btnLight, ':active', btnLightActiveStyle)
		this.addRulePseudo(this.btnLight, ':hover', btnLightHoverStyle)
		this.addRulePseudo(this.btnLight, ':focus', btnLightFocusStyle)

		this.addRule(this.groupBtnSuccess, btnSuccessStyle)
		this.addRulePseudo(this.groupBtnSuccess, ':active', btnSuccessActiveStyle)
		this.addRulePseudo(this.groupBtnSuccess, ':hover', btnSuccessHoverStyle)
		this.addRulePseudo(this.groupBtnSuccess, ':focus', btnSuccessFocusStyle)

		this.addRule(this.groupBtnDanger, btnDangerStyle)
		this.addRulePseudo(this.groupBtnDanger, ':active', btnDangerActiveStyle)
		this.addRulePseudo(this.groupBtnDanger, ':hover', btnDangerHoverStyle)
		this.addRulePseudo(this.groupBtnDanger, ':focus', btnDangerFocusStyle)

		this.addRule(this.groupBtnPrimary, btnPrimaryStyle)
		this.addRulePseudo(this.groupBtnPrimary, ':active', btnPrimaryActiveStyle)
		this.addRulePseudo(this.groupBtnPrimary, ':hover', btnPrimaryHoverStyle)
		this.addRulePseudo(this.groupBtnPrimary, ':focus', btnPrimaryFocusStyle)

		this.addRule(this.groupBtnSecondary, btnSecondaryStyle)
		this.addRulePseudo(this.groupBtnSecondary, ':active', btnSecondaryActiveStyle)
		this.addRulePseudo(this.groupBtnSecondary, ':hover', btnSecondaryHoverStyle)
		this.addRulePseudo(this.groupBtnSecondary, ':focus', btnSecondaryFocusStyle)

		this.addRule(this.groupBtnLight, btnLightStyle)
		this.addRulePseudo(this.groupBtnLight, ':active', btnLightActiveStyle)
		this.addRulePseudo(this.groupBtnLight, ':hover', btnLightHoverStyle)
		this.addRulePseudo(this.groupBtnLight, ':focus', btnLightFocusStyle)

		for (const v of [this.groupBtnSuccess, this.groupBtnDanger, this.groupBtnPrimary, this.groupBtnSecondary, this.groupBtnLight]) {
			this.addRulePseudo(v, ':first-child', 'border-radius: .25em 0 0 .25em;')
			this.addRulePseudo(v, ':last-child', 'border-radius: 0 .25em .25em 0;')
		}


		const navBtnStyle = `
				padding: 0.75em 1em;
				cursor: pointer;
			`
		const navBtnActiveStyle = navBtnStyle + 'color: white; background-color: ' + primaryColor + ';'
		const navBtnActiveHoverStyle = 'background-color: ' + primaryColor + ';'
		const navBtnInactiveStyle = navBtnStyle
		const navBtnInactiveHoverStyle = `background-color: #ddd;`
		this.addRule(this.navBtnActive, navBtnActiveStyle)
		this.addRulePseudo(this.navBtnActive, ':hover', navBtnActiveHoverStyle)
		this.addRule(this.navBtnInactive, navBtnInactiveStyle)
		this.addRulePseudo(this.navBtnInactive, ':hover', navBtnInactiveHoverStyle)

		const navSearchInactiveStyle = `
				padding: .75em 1em;
			`
		const navSearchActiveStyle = navSearchInactiveStyle + 'background-color: ' + primaryColor + ';'
		this.addRule(this.navSearchInactive, navSearchInactiveStyle)
		this.addRule(this.navSearchActive, navSearchActiveStyle)

		this.addRule(this.cell, 'vertical-align: top; padding: 0.25em;')
		this.addRulePseudo(this.cell, ':first-child', 'padding-left: 0;')
		this.addRulePseudo(this.cell, ':last-child', 'padding-right: 0;')
		this.addRule(this.headerCell, 'vertical-align: top; padding: 0.25em; font-weight: bold; text-align: left;')
		this.addRulePseudo(this.headerCell, ':first-child', 'padding-left: 0;')
		this.addRulePseudo(this.headerCell, ':last-child', 'padding-right: 0;')
		this.addRule(this.dayHeaderCell, 'vertical-align: top; padding: 0.25em; background-color: #eee;')
		this.addRulePseudo(this.dayHeaderCell, ':first-child', 'padding-left: 0;')
		this.addRulePseudo(this.dayHeaderCell, ':last-child', 'padding-right: 0;')

		const spinRotation = this.uniqueName('rotate')
		const spinStyle = `
				display: inline-block;
				animation: ` + spinRotation + ` 0.55s infinite linear;
				text-align: center;
				height: 0.7em;
				width: 0.7em;
				vertical-align: middle;
				font-size: 2em;
				line-height: 1;
			`
		this.addRule(this.spin, spinStyle)
		this.addRulePseudo(this.spin, ':after', 'content: "*";')
		this.addRawRule(`
				@keyframes ` + spinRotation + ` {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(359deg);
					}
				}
			`)

		const typeaheadOptionStyle = `
				padding: 0.25em;
				border-radius: 0.25em;
				cursor: pointer;
			`
		this.addRule(this.typeaheadOption, typeaheadOptionStyle)
		this.addRulePseudo(this.typeaheadOption, ':hover', 'background-color: #eee;')
		this.addRulePseudo(this.typeaheadOption, ':focus', 'background-color: #ddd;')

		const boxStyle = `
				flex: 1;
				flex-direction: column;
				overflow-y: auto;
				display: flex;
				height: 100%;
			`
		this.addRule(this.box, boxStyle)

		const listItemStyle = `
				cursor: pointer;
				padding: .2em .25em;
				margin: .2em .5em;
				border-radius: .25em;
			`
		const listItemSelectedStyle = `
				cursor: pointer;
				padding: .2em 0.5em .2em .25em;
				margin: .2em 0 .2em .5em;
				border-radius: .25em 0 0 .25em;
				background-color: #007bff;
			`
		this.addRule(this.listItem, listItemStyle)
		this.addRulePseudo(this.listItem, ':hover', 'background-color: #eee;')
		this.addRulePseudo(this.listItem, ':focus', 'background-color: #eee;')
		this.addRule(this.listItemSelected, listItemSelectedStyle)
		this.addRule(this.listItemPrimary, '')
		this.addRule(this.listItemSecondary, 'color: #888;')
		this.addRule(this.listItemSelectedPrimary, 'color: white;')
		this.addRule(this.listItemSelectedSecondary, 'color: #ddd;')

		this.addRule(this.boxPadding, boxPaddingStyle)
		this.addRule(this.boxMargin, boxMarginStyle)
		this.addRule(this.boxPaddingLast, boxPaddingLastStyle)
		this.addRule(this.boxMarginLast, boxMarginLastStyle)

		this.addRule(this.checkmarkSuccess, `
				background-color: #28a745;
				color: white;
				display: inline-block;
				height: 1.5em;
				width: 1.5em;
				text-align: center;
				border-radius: 0.75em;
				margin-left: 0.5em;
			`)
		this.addRulePseudo(this.checkmarkSuccess, ':after', 'content: "✓";')
	}

	uniqueName(name: string) {
		return 'timeline-' + name + '-' + this.uniqueID
	}

	uniqueClass(name: string) {
		return { 'class': this.uniqueName(name) }
	}

	addRule(cl: { 'class': string }, style: string) {
		this.addRulePseudo(cl, '', style)
	}

	addRulePseudo(cl: { 'class': string }, pseudo: string, style: string) {
		const selector = '.' + this.baseClassName + '-' + this.uniqueID + ' .' + cl.class + pseudo
		const rule = selector + ' { ' + style + ' }'
		this.addRawRule(rule)
	}

	addRawRule(rule: string) {
		const sheet = this.style.sheet as CSSStyleSheet;
		if (!sheet) {
			throw new Error('no sheet in stylesheet?')
		}
		sheet.insertRule(rule, sheet.insertRule(rule, sheet.cssRules.length))
	}
}

export interface ItemOpener<ItemView> {
	openItem: (key: string) => Promise<ItemView>
}

export interface ItemRower<Item> extends UI {
	key: string	// unique value identifying item
	item: Item
	render: () => void
	markSelected: () => void
	markUnselected: () => void
	matches: (text: string) => boolean
	compare: (o: ItemRower<Item>) => number
}

export interface Selecter<Item, ItemRow extends ItemRower<Item>> {
	selectClick: (itemRow: ItemRow) => void
}

export class List<
	Item,
	ItemRow extends UI & ItemRower<Item>,
	ItemNew extends UI & Focuser & Stater,
	ItemView extends UI & Focuser & Stater,
	> implements UI, Focuser, Stater {
	ui: HTMLElement
	selected?: ItemRow
	rowsAll: ItemRow[]
	rowsFiltered: ItemRow[]
	listBox: HTMLElement
	search: HTMLInputElement
	list: HTMLElement
	detailBox: HTMLElement
	noSelection: HTMLElement
	viewUI?: ItemView
	newUI?: ItemNew

	constructor(
		private app: Rooter & Saver & Loader & Classer & Boxer & StateSaver,
		private title: string,
		items: Item[],
		private rowClass: { new(app: Classer, item: Item, listUI: Selecter<Item, ItemRow>): ItemRow },
		private newClass: () => ItemNew,
		private viewClass: (itemRow: ItemRow) => ItemView,
	) {
		const classes = app.classes

		this.search = dg.input(
			classes.searchInput,
			{ placeholder: 'search...' },
			dg.listener('keyup', ev => {
				const v = this.searchValue()
				this.filter()
				if (v) {
					if (this.rowsFiltered.length > 0) {
						this.search.className = classes.searchInputFiltered.class
					} else {
						this.search.className = classes.searchInputNoresults.class
					}
				} else {
					this.search.className = classes.searchInput.class
				}
			})
		)

		this.rowsAll = items.map(e => {
			return new rowClass(app, e, this)
		})
		this.rowsFiltered = this.rowsAll.map(e => e)
		this.rowsFiltered.sort((a: ItemRow, b: ItemRow) => a.compare(b))
		this.listBox = app.box(
			_style({ 'border-top': '.25em solid #fff' }),
			tabindex0,
			dg.listener('keydown', ev => {
				if (this.rowsFiltered.length === 0) {
					return
				}

				const selectOffset = (offset: number) => {
					ev.preventDefault()
					const index = Math.min(this.rowsFiltered.length - 1, Math.max(0, this.rowsFiltered.findIndex(ir => ir === this.selected) + offset))
					if (index >= 0 && index < this.rowsFiltered.length) {
						this.select(this.rowsFiltered[index])
					}
				}

				switch (ev.key) {
					case 'ArrowUp':
						if (this.selected) {
							selectOffset(-1)
						} else {
							this.select(this.rowsFiltered[this.rowsFiltered.length - 1])
						}
						break
					case 'ArrowDown':
						if (this.selected) {
							selectOffset(1)
						} else {
							this.select(this.rowsFiltered[0])
						}
						break
					case 'Enter':
						const e = this.rowsFiltered.find(ur => ur.ui === document.activeElement)
						if (e) {
							this.selectClick(e)
						}
						break
					default:
						return
				}
				ev.preventDefault()
			}),
			...this.rowsFiltered,
		)
		this.list = app.box(
			_style({ 'border-bottom': '.25em solid #ddd' }),
			div(
				app.classes.boxPadding,
				dg.h1(
					classes.title,
					title,
					' ',
					dg.button(
						classes.btnSuccess,
						_style({ 'font-weight': 'normal' }),
						dg.listener('click', ev => {
							this.deselect(false)
							this.loadNew([])
							app.saveState()
						}),
						'new'
					),
				),
				this.search,
			),
			this.listBox,
		)
		this.noSelection = dg.middle(div('Choose from the list'))
		this.detailBox = app.box()
		const split = new Split(this.list, this.detailBox)
		this.ui = app.box(
			{ ui: 'ItemList' },
			split,
		)
	}

	loadNew(state: State): Promise<void> {
		const newUI = this.newClass()
		this.newUI = newUI
		const p = newUI.loadState(state)
		this.app.load(this.detailBox, () => [{}, Promise.resolve([newUI.ui])], () => newUI.focus())
		return p
	}

	loadState(state: State): Promise<void> {
		let w = state.shift()
		if (w === 'New') {
			return this.loadNew(state)
		} else if (typeof w === 'string' && w.startsWith('=')) {
			w = w.substring(1)
			const row = this.rowsFiltered.find(row => row.key === w)
			if (row) {
				return this.loadItem(state, row)
			}
		}
		dg.children(this.detailBox, this.noSelection)
		return Promise.resolve()
	}

	currentState(): State {
		if (this.newUI) {
			return ['New', ...this.newUI.currentState()]
		} else if (this.selected && this.viewUI) {
			return ['=' + this.selected.key, ...this.viewUI.currentState()]
		} else {
			return []
		}
	}

	focus() {
		if (this.newUI) {
			this.newUI.focus()
		} else if (this.viewUI) {
			this.viewUI.focus()
		} else {
			this.search.focus()
		}
	}

	searchValue() {
		return this.search.value.toLowerCase().trim()
	}

	openItem(itemKey: string): Promise<ItemView> {
		const ir = this.rowsAll.find(ir => ir.key === itemKey)
		if (!ir) {
			return Promise.reject({ message: 'cannot find key "' + itemKey + '" in ' + this.title.toLowerCase() })
		}
		if (!this.rowsFiltered.find(row => row === ir)) {
			this.rowsFiltered.push(ir)
		}
		this.loadItem([], ir)
		this.filter() // for sorting
		const viewUI = this.viewUI
		return new Promise(resolve => {
			resolve(viewUI)
		})
	}

	selectClick(ir: ItemRow) {
		if (this.selected === ir) {
			this.deselect(true)
		} else {
			this.select(ir)
		}
	}

	loadItem(state: State, ir: ItemRow): Promise<void> {
		this.newUI = undefined
		if (this.selected) {
			this.selected.markUnselected()
		}
		this.selected = ir
		this.selected.markSelected()
		this.viewUI = this.viewClass(ir)
		const p = this.viewUI.loadState(state)
		const ui = this.viewUI.ui
		this.app.load(this.detailBox, () => [{}, Promise.resolve([ui])])
		return p
	}

	select(ir: ItemRow) {
		this.loadItem([], ir)
		this.app.saveState()
	}

	deselect(load: boolean) {
		if (this.selected) {
			this.selected.markUnselected()
		}
		this.selected = undefined
		this.viewUI = undefined
		if (load) {
			this.app.load(this.detailBox, () => [{}, Promise.resolve([this.noSelection])])
			this.search.focus()
		}
		this.app.saveState()
	}

	filter() {
		const filter = (ir: ItemRow, text: string) => {
			return ir.matches(text)
		}
		const v = this.searchValue()
		this.rowsFiltered = this.rowsAll.filter(ir => filter(ir, v) || ir == this.selected)
		this.rowsFiltered.sort((a: ItemRow, b: ItemRow) => a.compare(b))
		dg.children(this.listBox, ...this.rowsFiltered)
	}

	addItem(item: Item) {
		const ir = new this.rowClass(this.app, item, this)
		this.rowsAll.push(ir)
		this.rowsFiltered.push(ir)
		this.select(ir)
		this.filter()
	}

	removeItem(ir: ItemRow) {
		this.deselect(true)
		this.rowsAll = this.rowsAll.filter(v => v !== ir)
		this.filter()
	}

	updateItem(ir: ItemRow, item: Item) {
		ir.item = item
		ir.render()
	}
}

export type FieldKind = 'line' | 'email' | 'number' | 'multiline' | 'checkbox' | 'select' | 'multiselect' | 'radio' | 'date'
export interface Field {
	label: string
	name: string
	kind: FieldKind
	required: boolean
	readonly: boolean
	options?: { label: string, value: any }[]
}

export interface FieldValue {
	element: HTMLElement
	value: () => any
	focusable?: HTMLElement
}

const makeFieldValue = (app: Classer, field: Field, value?: any): FieldValue => {
	const required: { required: string } | {} = field.required ? { required: '' } : {}
	const disabled: { disabled: string } | {} = field.readonly ? { disabled: '' } : {}

	switch (field.kind) {
		case 'line': {
			const elem = dg.input(
				app.classes.formInput,
				{ value: typeof value === 'string' ? value : '' },
				required,
				disabled,
			)
			return {
				element: dg.label(field.label, elem),
				value: () => elem.value,
				focusable: elem,
			}
		}
		case 'email': {
			const elem = dg.input(
				app.classes.formInput,
				{ value: typeof value === 'string' ? value : '' },
				required,
				{ type: 'email' },
				disabled,
			)
			return {
				element: dg.label(field.label, elem),
				value: () => elem.value,
				focusable: elem,
			}
		}
		case 'number': {
			const elem = dg.input(
				app.classes.formInput,
				{ value: typeof value === 'number' ? '' + value : '' },
				required,
				{ type: 'number' },
				disabled,
			)
			return {
				element: dg.label(field.label, elem),
				value: () => parseInt(elem.value),
				focusable: elem,
			}
		}
		case 'multiline': {
			const elem = dg.textarea(
				app.classes.textarea,
				required,
				disabled,
				{ rows: '5' },
				typeof value === 'string' ? value : '',
			)
			return {
				element: dg.label(field.label, elem),
				value: () => elem.value,
				focusable: elem,
			}
		}
		case 'checkbox': {
			const elem = dg.input(
				required,
				{ type: 'checkbox' },
				disabled,
			)
			elem.checked = value === true
			return {
				element: dg.label(elem, field.label),
				value: () => elem.checked,
				focusable: elem,
			}
		}
		case 'select':
		case 'multiselect': {
			if (!field.options) {
				throw new Error('field with kind "select" or "multiselect" must have options')
			}
			const values: { [key: string]: any } = {}
			const elem = dg.select(
				// xxx use value
				field.kind === 'multiselect' ? { multiple: '' } : {},
				required,
				disabled,
				...field.options.map((o, index) => {
					values['' + index] = o.value
					return dg.option(
						{ value: '' + index },
						o.label,
					)
				})
			)
			return {
				element: dg.label(field.label, elem),
				value: () => {
					const r: any[] = []
					for (let i = 0; i < elem.selectedOptions.length; i++) {
						r.push(values[elem.selectedOptions[i].value])
					}
					if (field.kind === 'multiselect') {
						return
					}
					return r.length > 0 ? r[0] : null
				},
				focusable: elem,
			}
		}
		case 'radio': {
			if (!field.options) {
				throw new Error('field with kind "radio" must have options')
			}
			const values: { [key: string]: any } = {}
			const inputs: HTMLInputElement[] = []
			return {
				element: div(
					...field.options.map((o, index) => {
						values['' + index] = o.value
						const input = dg.input(
							// xxx use value
							{ value: o.value },
							{ type: 'radio' },
							disabled,
							{ name: o.label },
						)
						inputs.push(input)
						return dg.label(o.value, input)
					}),
				),
				value: () => {
					const r = inputs.filter(e => e.checked).map(e => values[e.value])
					return r.length > 0 ? r[0] : null
				},
				focusable: inputs[0],
			}
		}
		case 'date': {
			const formatDate = (v: string): string => {
				const d = new Date(v)
				return '' + d.getFullYear() + '-' + (1 + d.getMonth()) + '-' + d.getDate()
			}
			const elem = dg.input(
				app.classes.formInput,
				{ value: typeof value === 'string' ? formatDate(value) : '' },
				required,
				disabled,
			)
			return {
				element: dg.label(field.label, elem),
				value: () => new Date(elem.value).toISOString(),
				focusable: elem,
			}
		}
	}
}

export class FormNew<Item> implements UI, Focuser, Stater {
	ui: HTMLElement

	fieldValues: FieldValue[]

	constructor(
		app: Rooter & Saver & Loader & Classer & Boxer,
		objectName: string,
		fields: Field[],
		create: (object: Item) => Promise<void>,
	) {
		const classes = app.classes
		const spinBox = dg.span()
		let fieldset: HTMLFieldSetElement
		this.fieldValues = []
		this.ui = app.box(
			{ ui: 'FormNew' },
			div(
				app.classes.boxPaddingLast,
				dg.h1(
					classes.title,
					'New ' + objectName
				),
				dg.form(
					dg.listener('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(spinBox, fieldset, 'Adding ' + objectName, () => create(object as Item))
					}),
					fieldset = dg.fieldset(
						div(
							...fields.map(f => {
								const fv = makeFieldValue(app, f)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dg.button(
							classes.btnSuccess,
							{ type: 'submit' },
							'Create ' + objectName,
						),
						spinBox,
					),
				),
			),
		)
	}

	focus() {
		for (const fv of this.fieldValues) {
			if (fv.focusable) {
				fv.focusable.focus()
				return
			}
		}
	}

	loadState(state: State): Promise<void> {
		return Promise.resolve()
	}

	currentState(): State {
		return []
	}
}

export class FormEdit<Item, ItemRow extends ItemRower<Item>> implements UI, Focuser, Stater {
	ui: HTMLElement

	fieldValues: FieldValue[]

	constructor(
		app: Rooter & Saver & Loader & Classer & Boxer & StateSaver,
		objectName: string,
		fields: Field[],
		itemRow: ItemRower<Item>,
		save: (object: Item) => Promise<void>,
		remove: (object: Item) => Promise<void>,
	) {
		const classes = app.classes

		const saveSpinBox = dg.span()
		let saveFieldset: HTMLFieldSetElement
		const removeSpinBox = dg.span()
		let removeButton: HTMLButtonElement
		this.fieldValues = []
		this.ui = app.box(
			{ ui: 'FormEdit' },
			div(
				app.classes.boxPaddingLast,
				dg.h1(
					classes.title,
					titleize(objectName),
					' ',
					removeButton = dg.button(
						classes.btnDanger,
						_style({ 'font-weight': 'normal' }),
						dg.listener('click', ev => {
							confirm(app.root, app.classes, 'Sure?', 'Are you sure you want to remove this ' + objectName + '?', 'Yes, remove ' + objectName)
								.then(() => {
									// xxx see if we can make this more typesafe
									const object: any = {}
									this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
									app.save(removeSpinBox, removeButton, 'removing ' + objectName, () => remove(object as Item))
								})
						}),
						'remove'
					),
					removeSpinBox,
				),
				dg.form(
					dg.listener('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(saveSpinBox, saveFieldset, 'saving ' + objectName, () => save(object as Item))
					}),
					saveFieldset = dg.fieldset(
						div(
							...fields.map(f => {
								const item: Item = itemRow.item
								const v: any = (<any>item)[f.name]
								const fv = makeFieldValue(app, f, v)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dg.button(
							classes.btnPrimary,
							{ type: 'submit' },
							'Save ' + objectName,
						),
						saveSpinBox,
					),
				),
			)
		)
	}

	focus() {
		for (const fv of this.fieldValues) {
			if (fv.focusable) {
				fv.focusable.focus()
				return
			}
		}
	}

	loadState(state: State) {
		return Promise.resolve()
	}

	currentState(): State {
		return []
	}
}

export class Tabs implements UI, Focuser, Stater {
	ui: HTMLElement

	selectedBox: HTMLElement
	activeIndex: number
	buttons: HTMLButtonElement[]
	loaded: boolean[]

	constructor(private app: Rooter & Saver & Loader & Classer & Boxer & StateSaver, public tabs: { label: string, name: string, ui: UI & Focuser & Stater }[]) {
		this.activeIndex = -1
		this.buttons = tabs.map((tab, index) =>
			dg.button(
				app.classes.groupBtnLight,
				dg.listener('click', ev => this.select(index)),
				tabs[index].label,
				tabindex0,
			)
		)
		this.loaded = this.buttons.map(() => false)
		this.selectedBox = app.box()
		this.ui = app.box(
			div(
				_style({
					'border-bottom': '1px solid #ccc',
					'text-align': 'center',
				}),
				app.classes.boxPadding,
				...this.buttons,
			),
			this.selectedBox,
		)
	}

	openTab(name: string): Promise<UI & Focuser & Stater> {
		const index = this.tabs.findIndex(tab => tab.name === name)
		if (index < 0) {
			return Promise.reject({ message: 'cannot find tab' })
		}
		return this.loadTab([], index)
			.then(() => this.tabs[index].ui)
	}

	select(index: number) {
		this.loadTab([], index)
		this.app.saveState()
	}

	loadTab(state: State, index: number): Promise<void> {
		if (this.activeIndex >= 0) {
			this.buttons[this.activeIndex].className = this.app.classes.groupBtnLight.class
		}
		this.activeIndex = index
		this.buttons[this.activeIndex].className = this.app.classes.groupBtnPrimary.class
		const ui = this.tabs[this.activeIndex].ui
		this.app.load(this.selectedBox, () => [{}, Promise.resolve([ui.ui])])
		if (this.loaded[index]) {
			return Promise.resolve()
		}
		this.loaded[index] = true
		return ui.loadState(state)
	}

	focus() {
		this.tabs[this.activeIndex].ui.focus()
	}

	loadState(state: State): Promise<void> {
		const w = state.shift()
		if (w) {
			const i = this.tabs.findIndex(tab => tab.name === w)
			if (i >= 0) {
				return this.loadTab(state, i)
			}
		}
		return this.loadTab(state, 0)
	}

	currentState(): State {
		const tab = this.tabs[this.activeIndex]
		return [tab.name, ...tab.ui.currentState()]
	}
}

export const box = (className: string, ...l: dg.ElemArg[]): HTMLElement => {
	const e = dg.makeElement('div', [{ ui: 'box' }, { class: className }, ...l])
	e.style.setProperty('height', '100%') // todo: figure out why this is necessary. same style is in class, but doesn't have the effect this inline style has....
	return e
}
