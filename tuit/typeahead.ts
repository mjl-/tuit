import { div, _style } from '../dom'
import * as dom from '../dom'
import * as types from './types'
import * as attr from './attr'
import * as classes from './classes'
import * as popover from './popover'

export class TypeaheadOption implements types.UI {
	ui: HTMLElement

	constructor(classes: classes.Classes, public value: string, typeahead: Typeahead) {
		this.ui = div(
			classes.typeaheadOption,
			_style({ padding: '0.25em' }),
			attr.tabindex0,
			value,
			dom.listener('click', ev => typeahead.selected(this)),
			dom.listener('keydown', ev => {
				if (ev.key === 'Enter') {
					ev.preventDefault()
					typeahead.selected(this)
				}
			}),
			dom.listener('blur', ev => typeahead.checkFocus()),
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

export class Typeahead implements types.UI {
	ui: HTMLElement

	private popoverBox: HTMLElement
	private optionsAll: TypeaheadOption[]
	private optionsFiltered: TypeaheadOption[]
	private input: HTMLInputElement
	private optionsBox: HTMLElement
	private popover: popover.Popover

	constructor(
		private classes: classes.Classes,
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
		this.popover = new popover.Popover(classes, this.optionsBox)
		this.input = dom.input(
			inputClass,
			{ value: value },
			dom.listener('focus', ev => {
				this.focused()
				this.input.className = inputFocusedClass.class
				this.filter(true)
			}),
			dom.listener('blur', ev => this.checkFocus()),
			dom.listener('keydown', ev => {
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
			dom.listener('keyup', ev => {
				this.filter(true)
			}),
		)
		this.ui = dom.div(
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
			dom.children(this.popoverBox)
		} else if (this.popoverBox.childElementCount > 0 || ensure) {
			dom.children(this.optionsBox, ...this.optionsFiltered)
			dom.children(this.popoverBox, this.popover)
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
			dom.children(this.popoverBox)
			this.blurred()
		}, 0)
	}
}
