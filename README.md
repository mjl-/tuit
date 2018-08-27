# Tuit

Tuit is a typescript ui toolkit library that helps you create maintainable,
fast, secure web applications.

Concepts that make it different from the popular frameworks:

- Use typescript as possible, including styling. No need for CSS
(or processors), HTML or special DSLs and their compilers. Typesafety
everywhere!
- No virtual DOM and diffing. You create classes that manage their
own DOM and typically export one root DOM element.

Tuit only works in the major evergreens.

## Quickstart

todo: write doc that shows creating a simple app...

## Why

The goals are to create maintainable, small (in generated code
size), fast, secure web applications.

Typescript provides type checking.  this gives us potential for
maintainability: remove classes of (runtime) errors, provide confident
refactoring.

You use the DOM API and a small helper module to manipulate the
DOM. This gives you full power/speed/flexibility of browser layout
engines. There is no automagic virtual dom diffing with potential
slowdowns. You're in full control of state. This keeps the application
small, which makes it fast to load. You do need to know how the DOM
works.

HTML isn't used. HTML would result in either loose coupling (no
integration with typechecked code), or requiring yet another DSL
and compiler. Both aren't worth the trouble.

CSS is used only in limited form: created in typescript, with only
per-class rules. No error-prone cascading. No SASS needed, one DSL
and compiler fewer. You can only reference classes you've created
rules for, again one error source gone. Not loading a full pre-existing
framework keeps the code size small.

The recurring theme is removing entire classes of errors during
development, and removing mechanisms (eg DSLs) with unappealing
cost/benefit ratio.
