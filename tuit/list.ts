import { div, _style } from '../dom'
import * as dom from '../dom'
import * as types from './types'
import * as classes from './classes'
import * as attr from './attr'
import * as split from './split'
import * as functions from './functions'

export const rowMarkSelected = (classes: classes.Classes, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = classes.listItemSelected.class
	primary.className = classes.listItemSelectedPrimary.class
	secondary.className = classes.listItemSelectedSecondary.class
}

export const rowMarkUnselected = (classes: classes.Classes, ui: HTMLElement, primary: HTMLElement, secondary: HTMLElement) => {
	ui.className = classes.listItem.class
	primary.className = classes.listItemPrimary.class
	secondary.className = classes.listItemSecondary.class
}


export interface ItemOpener<ItemView> {
	openItem: (key: string) => Promise<ItemView>
}

export interface ItemRower<Item> extends types.UI {
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
	ItemRow extends types.UI & ItemRower<Item>,
	ItemNew extends types.UI & types.Focuser & types.Stater,
	ItemView extends types.UI & types.Focuser & types.Stater,
	> implements types.UI, types.Focuser, types.Stater {
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
		private app: types.Rooter & types.Saver & types.Loader & types.Classer & types.Boxer & types.StateSaver,
		private title: string,
		items: Item[],
		private rowClass: { new(app: types.Classer, item: Item, listUI: Selecter<Item, ItemRow>): ItemRow },
		private newClass: () => ItemNew,
		private viewClass: (itemRow: ItemRow) => ItemView,
	) {
		const classes = app.classes

		this.search = dom.input(
			classes.searchInput,
			{ placeholder: 'search...' },
			dom.listener('keyup', ev => {
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
			attr.tabindex0,
			dom.listener('keydown', ev => {
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
				dom.h1(
					classes.title,
					title,
					' ',
					dom.button(
						classes.btnSuccess,
						_style({ 'font-weight': 'normal' }),
						dom.listener('click', ev => {
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
		this.noSelection = functions.middle(div('Choose from the list'))
		this.detailBox = app.box()
		const splitUI = new split.Split(this.list, this.detailBox)
		this.ui = app.box(
			{ ui: 'ItemList' },
			splitUI,
		)
	}

	loadNew(state: types.State): Promise<void> {
		const newUI = this.newClass()
		this.newUI = newUI
		const p = newUI.loadState(state)
		this.app.load(this.detailBox, () => [{}, Promise.resolve([newUI.ui])], () => newUI.focus())
		return p
	}

	loadState(state: types.State): Promise<void> {
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
		dom.children(this.detailBox, this.noSelection)
		return Promise.resolve()
	}

	currentState(): types.State {
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

	loadItem(state: types.State, ir: ItemRow): Promise<void> {
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
		dom.children(this.listBox, ...this.rowsFiltered)
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
