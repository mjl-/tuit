import { div, _style } from '../domgen'
import * as dg from '../domgen'
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
								const fv = form.makeFieldValue(app, f)
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

	loadState(state: types.State): Promise<void> {
		return Promise.resolve()
	}

	currentState(): types.State {
		return []
	}
}
