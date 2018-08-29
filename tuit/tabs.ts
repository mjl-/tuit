import * as dom from '../dom'
import * as types from './types'
import * as attr from './attr'

const tabsBoxStyle: dom.CSSProperties = {
	borderBottom: '1px solid #ccc',
	textAlign: 'center',
}

export class Tabs implements types.UI, types.Stater {
	root: HTMLElement

	selectedBox: HTMLElement
	activeIndex: number
	buttons: HTMLButtonElement[]
	loaded: boolean[]

	constructor(private app: dom.Rooter & types.Saver & types.Loader & types.Looker & types.Boxer & types.StateSaver, public tabs: { label: string, name: string, ui: types.UI & types.Focuser & types.Stater }[]) {
		const looksTabsBox = app.ensureLooks('tabs-box', tabsBoxStyle)

		this.activeIndex = -1
		this.buttons = tabs.map((tab, index) =>
			dom.button(
				app.looks.groupBtnLight,
				dom.listen('click', ev => this.select(index)),
				tabs[index].label,
				attr.tabindex0,
			)
		)
		this.loaded = this.buttons.map(() => false)
		this.selectedBox = app.box()
		this.root = app.box(
			dom.div(
				looksTabsBox,
				dom.div(
					app.looks.boxPadding,
					...this.buttons,
				),
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
			this.buttons[this.activeIndex].className = this.app.looks.groupBtnLight.className
		}
		this.activeIndex = index
		this.buttons[this.activeIndex].className = this.app.looks.groupBtnPrimary.className
		const ui = this.tabs[this.activeIndex].ui
		this.app.load(this.selectedBox, () => [{}, Promise.resolve([ui.root])])
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
