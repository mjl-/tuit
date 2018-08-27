import * as dom from '../dom'
import * as classes from './classes'

export interface Rooter {
	root: HTMLElement
}

export type StateWord = (string | StateArray)
export type State = StateWord[]
export interface StateArray extends Array<StateWord> { }

// Most UIs are "Staters": they can load a state and return their current state.
// The state comes from the location.hash. UIs that deal with state should call StateSaver.saveState when their state has changed.
export interface Stater {
	loadState: (state: State) => Promise<void>	// Called (at most) once, usually right after creation of the UI. The promise must always resolve, after any child UIs have resolved.
	currentState: () => State	// Return current state, including state of the children.
}

export interface StateSaver {
	// UIs must call this function after user interaction. eg after selecting a new item from the list, opening a different tab.
	// But only if those interactions cause the state to change.
	saveState: () => void
}

export interface Saver {
	save: (spinBox: HTMLElement, disabler: { disabled: boolean } | null, msg: string, fn: () => Promise<void>) => void
}

export interface Loader {
	load: (elem: HTMLElement, fn: () => [Aborter, Promise<HTMLElement[]>], loaded?: () => void) => void
}

export interface Classer {
	classes: classes.Classes
}

export interface UI {
	ui: HTMLElement
}

export const isUI = (v: any): v is UI => {
	return 'ui' in v && v.ui instanceof HTMLElement
}

export interface Focuser {
	focus(): void
}

export interface Aborter {
	abort?: () => void
}

export interface Boxer {
	box: (...l: dom.ElemArg[]) => HTMLElement
}
