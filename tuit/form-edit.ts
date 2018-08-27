import * as dom from '../dom'
import * as types from './types'
import * as list from './list'
import * as functions from './functions'
import * as confirm from './confirm'
import * as form from './form'

export class FormEdit<Item, ItemRow extends list.ItemRower<Item>> implements types.UI, types.Stater {
	root: HTMLElement

	fieldValues: form.FieldValue[]

	constructor(
		app: dom.Rooter & types.Saver & types.Loader & types.Classer & types.Boxer & types.StateSaver,
		objectName: string,
		fields: form.Field[],
		itemRow: list.ItemRower<Item>,
		save: (object: Item) => Promise<void>,
		remove: (object: Item) => Promise<void>,
	) {
		const classes = app.classes

		const saveSpinBox = dom.span()
		let saveFieldset: HTMLFieldSetElement
		const removeSpinBox = dom.span()
		let removeButton: HTMLButtonElement
		this.fieldValues = []
		this.root = app.box(
			{ ui: 'FormEdit' },
			dom.div(
				app.classes.boxPaddingLast,
				dom.h1(
					classes.title,
					functions.titleize(objectName),
					' ',
					removeButton = dom.button(
						classes.btnDanger,
						dom._style({ 'font-weight': 'normal' }),
						dom.listener('click', ev => {
							confirm.confirm(app.root, app.classes, 'Sure?', 'Are you sure you want to remove this ' + objectName + '?', 'Yes, remove ' + objectName)
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
				dom.form(
					dom.listener('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(saveSpinBox, saveFieldset, 'saving ' + objectName, () => save(object as Item))
					}),
					saveFieldset = dom.fieldset(
						dom.div(
							...fields.map(f => {
								const item: Item = itemRow.item
								const v: any = (<any>item)[f.name]
								const fv = form.makeFieldValue(app, f, v)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dom.button(
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

	loadState(state: types.State) {
		return Promise.resolve()
	}

	currentState(): types.State {
		return []
	}
}
