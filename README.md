twit - minimalist typed web ui toolkit

# todo

- split twit.ts into multiple files
- list: mention there are no items if that's the case
- list: remember the UI's that were created. need to invalidate on change of the object.
- find a way to make this somewhat responsive. eg splits turning vertical and fixed-size when below certain screen width. turn lists of items into tables when the space allows.
- implement date-picker
- more standard components. tables, with search, file uploads, quick forms, etc. look at bootstrap, semantic-ui and material design for inspiration.
- turn more components into ts ui? like button.
- more demo's. like a mail client, sql client.
- show proper errors on invalid forms, eg missing required fields.
- add possibility to add form validation function that results in clear error messages.
- expand form fields with help explanation.
- think about how to use icons. web fonts are nice but too big. can we convert font to something in js? eg svg, or drawn on canvas. then we need a build tool that generates the file with just what we need, and we include that in the ts build.
