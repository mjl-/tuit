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
	font-family: -apple-system,BlinkMacSystemFont,"Segoe types.UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe types.UI Emoji","Segoe types.UI Symbol";
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
		const sheet = this.style.sheet as CSSStyleSheet
		if (!sheet) {
			throw new Error('no sheet in stylesheet?')
		}
		sheet.insertRule(rule, sheet.insertRule(rule, sheet.cssRules.length))
	}
}
