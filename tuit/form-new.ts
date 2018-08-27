import { div, _style } from '../dom'
import * as dom from '../dom'
import * as types from './types'
import * as form from './form'

export class FormNew<Item> implements types.UI, types.Focuser, types.Stater {
	ui: HTMLElement

	fieldValues: form.FieldValue[]

	constructor(
		app: types.Rooter & types.Saver & types.Loader & types.Classer & types.Boxer,
		objectName: string,
		fields: form.Field[],
		create: (object: Item) => Promise<void>,
	) {
		const classes = app.classes
		const spinBox = dom.span()
		let fieldset: HTMLFieldSetElement
		this.fieldValues = []
		this.ui = app.box(
			{ ui: 'FormNew' },
			div(
				app.classes.boxPaddingLast,
				dom.h1(
					classes.title,
					'New ' + objectName
				),
				dom.form(
					dom.listener('submit', ev => {
						ev.preventDefault()
						// xxx see if we can make this more typesafe
						const object: any = {}
						this.fieldValues.forEach((fv, index) => object[fields[index].name] = fv.value())
						app.save(spinBox, fieldset, 'Adding ' + objectName, () => create(object as Item))
					}),
					fieldset = dom.fieldset(
						div(
							...fields.map(f => {
								const fv = form.makeFieldValue(app, f)
								this.fieldValues.push(fv)
								return fv.element
							}),
						),
						dom.button(
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

	loadState(state: types.State): Promise<void> {
		return Promise.resolve()
	}

	currentState(): types.State {
		return []
	}
}
