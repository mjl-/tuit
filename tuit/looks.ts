import * as CSS from '../node_modules/csstype/index'

export class Style {
	readonly propsList: CSS.Properties[]
	pseudoStyles: { name: string, propsList: CSS.Properties[] }[]

	constructor(readonly sheet: CSSStyleSheet, private readonly selectorPrefix: string, readonly className: string, ...styles: (Style | CSS.Properties)[]) {
		this.propsList = []
		this.pseudoStyles = []
		for (const style of styles) {
			if (style instanceof Style) {
				for (const props of style.propsList) {
					this.propsList.push(props)
				}
			} else {
				this.propsList.push(style)
			}
		}

		this.add('.' + className, this.propsList)
	}

	pseudo(pseudo: string, ...propsList: CSS.Properties[]): this {
		this.add('.' + this.className + pseudo, propsList)
		this.pseudoStyles.push({ name: pseudo, propsList: propsList })
		return this
	}

	private add(selector: string, propsList: CSS.Properties[]) {
		const selectorText = this.selectorPrefix + selector
		const index = this.sheet.cssRules.length
		this.sheet.insertRule(selectorText + ' {}', index)
		const st = (this.sheet.cssRules[index] as CSSStyleRule).style as any // xxx
		for (const props of propsList) {
			for (const key in <object>props) {
				st[key] = (<any>props)[key] // xxx probably not always correct, eg for array values
			}
		}
	}
}

export class Looks {
	uniqueID: string
	selectorPrefix: string

	header: Style
	title: Style
	formInput: Style
	textarea: Style
	tableInput: Style
	tableInputSmall: Style
	searchInput: Style
	searchInputFiltered: Style
	searchInputNoresults: Style
	btnSuccess: Style
	btnDanger: Style
	btnPrimary: Style
	btnSecondary: Style
	btnLight: Style
	groupBtnSuccess: Style
	groupBtnDanger: Style
	groupBtnPrimary: Style
	groupBtnSecondary: Style
	groupBtnLight: Style
	navBtnActive: Style
	navBtnInactive: Style
	navSearchActive: Style
	navSearchInactive: Style
	cell: Style
	headerCell: Style
	dayHeaderCell: Style
	spin: Style
	typeaheadOption: Style
	box: Style
	listItem: Style
	listItemSelected: Style
	listItemPrimary: Style
	listItemSecondary: Style
	listItemSelectedPrimary: Style
	listItemSelectedSecondary: Style
	boxPadding: Style
	boxMargin: Style
	boxPaddingLast: Style
	boxMarginLast: Style
	checkmarkSuccess: Style

	constructor(private style: HTMLStyleElement, private baseClassName: string) {
		this.uniqueID = ('' + Math.random()).substring(2, 10)
		this.selectorPrefix = '.' + this.baseClassName + '-' + this.uniqueID + ' '


		const addResetRule = (selector: string, props: CSS.Properties) => {
			const sheet = style.sheet as CSSStyleSheet
			const selectorText = this.selectorPrefix + selector
			const index = sheet.cssRules.length
			sheet.insertRule(selectorText + '{}', index)
			const st = (sheet.cssRules[index] as CSSStyleRule).style as { [k: string]: any }
			for (const key in <object>props) {
				st[key] = <any>((<any>props)[key])
			}
		}

		addResetRule('', {
			lineHeight: '1.5',
			fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe types.UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe types.UI Emoji","Segoe types.UI Symbol"',
			fontSize: '15px',
		})
		addResetRule('*', {
			margin: '0',
			padding: '0',
			border: '0',
			fontSize: '100%',
			font: 'inherit',
			verticalAlign: 'baseline',
			boxSizing: 'border-box',
		})
		addResetRule('ol', { listStyle: 'none' })
		addResetRule('ul', { listStyle: 'none' })
		addResetRule('table', {
			borderCollapse: 'collapse',
			borderSpacing: '0',
		})


		const createLooks = (className: string, ...styles: (Style | CSS.Properties)[]): Style => {
			return this.createLooks(className, ...styles)
		}

		const copyLooks = (className: string, fromStyle: Style): Style => {
			const r = this.createLooks(className, ...fromStyle.propsList)
			for (const tup of fromStyle.pseudoStyles) {
				r.pseudo(tup.name, ...tup.propsList)
			}
			return r
		}

		this.header = createLooks('header', {
			fontWeight: 'normal',
			padding: '0.25em 0',
			fontSize: '1.5em',
		})
		this.title = createLooks('title', {
			fontWeight: 'bold',
			padding: '0.25em 0',
			marginBottom: '1.5ex',
		})

		const roundCornerStyle = { borderRadius: '.25em' }


		const inputStyle = {
			display: 'block',
			fontSize: '1em',
			padding: '0.4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			lineHeight: '1',
		}
		this.formInput = createLooks('form-input', inputStyle, {
			marginBottom: '1em',
			marginTop: '0.5em',
		})
		this.tableInput = createLooks('table-input', inputStyle, {
			width: '100%'
		})
		this.tableInputSmall = createLooks('table-input-small', inputStyle, {
			display: 'inline',
			width: '3em',
		})
		this.textarea = createLooks('textarea', {
			display: 'block',
			marginBottom: '1em',
			fontSize: '1em',
			padding: '0.4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			marginTop: '0.5em',
			lineHeight: '1',
		})

		this.searchInput = createLooks('search-input', {
			display: 'block',
			padding: '0.4em',
			borderRadius: '.25em',
			border: '1px solid #ccc',
			lineHeight: '1',
		})
		this.searchInputFiltered = createLooks('search-input-filtered', this.searchInput, { backgroundColor: '#28a74540' })
		this.searchInputNoresults = createLooks('search-input-noresults', this.searchInput, { backgroundColor: '#dc354540' })
		for (const c of [this.searchInput, this.searchInputFiltered, this.searchInputNoresults]) {
			c.pseudo(':focus', { borderColor: '#999' })
		}


		const btnStyle = {
			fontSize: '1em',
			border: 'none',
			padding: '0em 0.6em 0.15em',
			cursor: 'pointer',
		}

		const successColor = '#28a745'
		const dangerColor = '#dc3545'
		const primaryColor = '#007bff'
		const secondaryColor = '#6c757d'
		const lightColor = '#f8f9fa'

		this.btnSuccess = createLooks('btn-success', btnStyle, roundCornerStyle, {
			color: '#fff',
			backgroundColor: successColor,
			borderColor: successColor,
		})
			.pseudo(':active', {
				backgroundColor: '#1e7e34',
				borderColor: '#1c7430',
			})
			.pseudo(':hover', {
				backgroundColor: '#218838',
				borderColor: '#1e7e34',
			})
			.pseudo(':focus', {
				boxShadow: '0 0 0 0.2em rgba(40,167,69,.5)',
			})


		this.btnDanger = createLooks('btn-danger', btnStyle, roundCornerStyle, {
			color: '#fff',
			backgroundColor: dangerColor,
			borderColor: dangerColor,
		})
			.pseudo(':active', {
				backgroundColor: '#bd2130',
				borderColor: '#b21f2d',
			})
			.pseudo(':hover', {
				backgroundColor: '#c82333',
				borderColor: '#bd2130',
			})
			.pseudo(':focus', {
				boxShadow: '0 0 0 0.2em rgba(220,53,69,.5)',
			})

		this.btnPrimary = createLooks('btn-primary', btnStyle, roundCornerStyle, {
			color: '#fff',
			backgroundColor: primaryColor,
			borderColor: primaryColor,
		})
			.pseudo(':active', {
				backgroundColor: '#0062cc',
				borderColor: '#005cbf',
			})
			.pseudo(':hover', {
				backgroundColor: '#0069d9',
				borderColor: '#0062cc',
			})
			.pseudo(':focus', {
				boxShadow: '0 0 0 0.2em rgba(0,123,255,.5)',
			})

		this.btnSecondary = createLooks('btn-secondary', btnStyle, roundCornerStyle, {
			color: '#fff',
			backgroundColor: secondaryColor,
			borderColor: secondaryColor,
		})
			.pseudo(':active', {
				backgroundColor: '#545b62',
				borderColor: '#4e555b',
			})
			.pseudo(':hover', {
				backgroundColor: '#5a6268',
				borderColor: '#545b62',
			})
			.pseudo(':focus', {
				boxShadow: '0 0 0 0.2em rgba(108,117,125,.5)',
			})

		this.btnLight = createLooks('btn-light', btnStyle, roundCornerStyle, {
			color: '#212529',
			backgroundColor: lightColor,
			borderColor: lightColor,
		})
			.pseudo(':active', {
				backgroundColor: '#dae0e5',
				borderColor: '#d3d9df',
			})
			.pseudo(':hover', {
				backgroundColor: '#e2e6ea',
				borderColor: '#dae0e5',
			})
			.pseudo(':focus', {
				boxShadow: '0 0 0 .2rem rgba(248,249,250,.5)',
			})


		this.groupBtnSuccess = copyLooks('group-btn-success', this.btnSuccess)
		this.groupBtnDanger = copyLooks('group-btn-danger', this.btnDanger)
		this.groupBtnPrimary = copyLooks('group-btn-primary', this.btnPrimary)
		this.groupBtnSecondary = copyLooks('group-btn-secondary', this.btnSecondary)
		this.groupBtnLight = copyLooks('group-btn-light', this.btnLight)
		for (const v of [this.groupBtnSuccess, this.groupBtnDanger, this.groupBtnPrimary, this.groupBtnSecondary, this.groupBtnLight]) {
			v.pseudo(':first-child', { borderRadius: '.25em 0 0 .25em' })
			v.pseudo(':last-child', { borderRadius: '0 .25em .25em 0' })
		}


		this.navBtnInactive = createLooks('nav-btn-inactive', {
			padding: '0.75em 1em',
			cursor: 'pointer',
		})
			.pseudo(':hover', { backgroundColor: '#ddd' })
		this.navBtnActive = createLooks('nav-btn-active', this.navBtnInactive, {
			color: 'white',
			backgroundColor: primaryColor,
		})

		this.navSearchInactive = createLooks('nav-search-inactive', { padding: '.75em 1em' })
		this.navSearchActive = createLooks('nav-search-active', this.navSearchInactive, { backgroundColor: primaryColor })


		this.cell = createLooks('cell', {
			verticalAlign: 'top',
			padding: '.25em',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })
		this.headerCell = createLooks('header-cell', {
			verticalAlign: 'top',
			padding: '.25em',
			fontWeight: 'bold',
			textAlign: 'left',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })

		this.dayHeaderCell = createLooks('day-header-cell', {
			verticalAlign: 'top',
			padding: '.25em',
			backgroundColor: '#eee',
		})
			.pseudo(':first-child', { paddingLeft: 0 })
			.pseudo(':last-child', { paddingRight: 0 })


		const spinRotation = this.uniqueName('rotate')
		this.spin = createLooks('spin', {
			display: 'inline-block',
			animation: spinRotation + ' 0.55s infinite linear',
			textAlign: 'center',
			height: '.7em',
			width: '.7em',
			verticalAlign: 'middle',
			fontSize: '2em',
			lineHeight: '1',
		})
			.pseudo(':after', { content: '"*"' })

		// xxx include in Style?
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


		this.typeaheadOption = createLooks('typeahead-option', {
			padding: '.25em',
			borderRadius: '.25em',
			cursor: 'pointer',
		})
			.pseudo(':hover', { backgroundColor: '#eee' })
			.pseudo(':focus', { backgroundColor: '#ddd' })

		this.box = createLooks('box', {
			flex: '1',
			flexDirection: 'column',
			overflowY: 'auto',
			display: 'flex',
			height: '100%',
		})

		this.listItem = createLooks('list-item', {
			cursor: 'pointer',
			padding: '.2em .25em',
			margin: '.2em .5em',
			borderRadius: '.25em',
		})
			.pseudo(':hover', { backgroundColor: '#eee' })
			.pseudo(':focus', { backgroundColor: '#eee' })
		this.listItemSelected = createLooks('listen-item-selected', {
			cursor: 'pointer',
			padding: '.2em 0.5em .2em .25em',
			margin: '.2em 0 .2em .5em',
			borderRadius: '.25em 0 0 .25em',
			backgroundColor: '#007bff',
		})

		this.listItemPrimary = createLooks('list-item-primar', {})
		this.listItemSecondary = createLooks('list-item-secondary', { color: '#888' })
		this.listItemSelectedPrimary = createLooks('list-item-selected-primary', { color: 'white' })
		this.listItemSelectedSecondary = createLooks('list-item-selected-primary', { color: '#ddd' })

		this.boxPadding = createLooks('box-padding', { padding: '0.25em 0.5em' })
		this.boxMargin = createLooks('box-margin', { margin: '0.25em 0.5em' })
		this.boxPaddingLast = createLooks('box-padding', { padding: '0.25em 0.5em 1em 0.5em' })
		this.boxMarginLast = createLooks('box-margin', { margin: '0.25em 0.5em 1em 0.5em' })

		this.checkmarkSuccess = createLooks('checkmark-success', {
			backgroundColor: '#28a745',
			color: 'white',
			display: 'inline-block',
			height: '1.5em',
			width: '1.5em',
			textAlign: 'center',
			borderRadius: '.75em',
			marginLeft: '.5em',
		})
			.pseudo(':after', { content: '"✓"' })
	}

	createLooks(className: string, ...styles: (Style | CSS.Properties)[]): Style {
		className = className + '-' + this.uniqueID + '-' + this.baseClassName
		return new Style(this.style.sheet as CSSStyleSheet, this.selectorPrefix, className, ...styles)
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
		const sheet = this.style.sheet as CSSStyleSheet
		if (!sheet) {
			throw new Error('no sheet in stylesheet?')
		}
		sheet.insertRule(rule, sheet.insertRule(rule, sheet.cssRules.length))
	}
}
