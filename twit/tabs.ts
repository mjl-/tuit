import { div, _style } from '../domgen'
import * as dg from '../domgen'
import * as types from './types'
import * as attr from './attr'

export class Tabs implements types.UI, types.Focuser, types.Stater {
	ui: HTMLElement

	selectedBox: HTMLElement
	activeIndex: number
	buttons: HTMLButtonElement[]
	loaded: boolean[]

	constructor(private app: types.Rooter & types.Saver & types.Loader & types.Classer & types.Boxer & types.StateSaver, public tabs: { label: string, name: string, ui: types.UI & types.Focuser & types.Stater }[]) {
		this.activeIndex = -1
		this.buttons = tabs.map((tab, index) =>
			dg.button(
				app.classes.groupBtnLight,
				dg.listener('click', ev => this.select(index)),
				tabs[index].label,
				attr.tabindex0,
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

	openTab(name: string): Promise<types.UI & types.Focuser & types.Stater> {
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

	loadTab(state: types.State, index: number): Promise<void> {
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

	loadState(state: types.State): Promise<void> {
		const w = state.shift()
		if (w) {
			const i = this.tabs.findIndex(tab => tab.name === w)
			if (i >= 0) {
				return this.loadTab(state, i)
			}
		}
		return this.loadTab(state, 0)
	}

	currentState(): types.State {
		const tab = this.tabs[this.activeIndex]
		return [tab.name, ...tab.ui.currentState()]
	}
}
