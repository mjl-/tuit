import { div, _style } from '../domgen'
import * as dg from '../domgen'
import * as types from './types'

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

export const makeFieldValue = (app: types.Classer, field: Field, value?: any): FieldValue => {
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
