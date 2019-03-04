# UI-Editor

Custom HTML element to be used as a WYSIWYG editor, this custom element provides a simple way to edit rich texts using the latest browser technologies.

### State Attributes

| Name    | Description                                                                        |
| ------- | ---------------------------------------------------------------------------------- |
| empty   | Automatically assigned when there is content into the editor                       |
| invalid | Automatically assigned when the editor content is required but there is no content |

### Properties

| Name              | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| empty             | Get the empty state from the editor                                   |
| name              | Get and set the editor name                                           |
| value             | Get and set the editor content                                        |
| defaultValue      | Get and set tje editor default value                                  |
| required          | Get and set the required state                                        |
| readOnly          | Get and set the readOnly state                                        |
| disabled          | Get and set the disabled state                                        |
| preserveSelection | Get and set the preserve selection state.                             |
| paragraphType     | Get and set the paragraph tag name                                    |
| deniedTags        | Get and set the denied tag list                                       |
| orientation       | Get and set the editor orientation mode. Use: `row` or `column` value |
| selectedRange     | Get the current selection range                                       |
| selectedText      | Get the current selection text                                        |
| selectedHTML      | Get the current selection HTML                                        |
| selectedStyles    | Get the current selection styles                                      |

### Methods

| Name                | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| setRemovalState     | Change the removal state of an element.                                       |
| setRenderingState   | Change the rendering state of an element.                                     |
| clearSelection      | Removes any active selection in the editor content                            |
| focus               | Move the focus to the content child into the editor                           |
| reset               | Reset the content child into the editor to its initial value                  |
| checkValidity       | Check whether the editor content is valid                                     |
| formatAction        | Formats the specified tag for the selection or insertion point                |
| fontNameAction      | Change the font name for the selection or at the insertion point              |
| fontSizeAction      | Change the font size for the selection or at the insertion point              |
| fontColorAction     | Change the font color for the selection or at the insertion point             |
| lineHeightAction    | Change line height for the selection or at the insertion point                |
| undoAction          | Undoes the last executed command                                              |
| redoAction          | Redoes the previous undo command                                              |
| boldAction          | Toggles bold on/off for the selection or at the insertion point               |
| italicAction        | Toggles italics on/off for the selection or at the insertion point            |
| underlineAction     | Toggles underline on/off for the selection or at the insertion point          |
| strikeThroughAction | Toggles strikeThrough on/off for the selection or at the insertion point      |
| unorderedListAction | Creates a bulleted unordered list for the selection or at the insertion point |
| orderedListAction   | Creates a numbered ordered list for the selection or at the insertion point   |
| alignLeftAction     | Justifies the selection or insertion point to the left                        |
| alignCenterAction   | Justifies the selection or insertion point to the center                      |
| alignRightAction    | Justifies the selection or insertion point to the right                       |
| alignJustifyAction  | Justifies the selection or insertion point                                    |
| outdentAction       | Outdents the line containing the selection or insertion point                 |
| indentAction        | Indents the line containing the selection or insertion point                  |
| cutAction           | Removes the current selection and copies it to the clipboard                  |
| copyAction          | Copies the current selection to the clipboard                                 |
| pasteAction         | Pastes the clipboard contents at the insertion point                          |

### Slots

| Name    | Description                                               |
| ------- | --------------------------------------------------------- |
| toolbar | Element to contain all toolbar controls                   |
| content | Element to contain all editor data (rich text, html, etc) |

### Events

| Name   | Description                                            |
| ------ | ------------------------------------------------------ |
| change | Dispatched when the content into the editor is changed |

## Install

Using npm:

```sh
npm i @singleware/ui-editor
```

## License

[MIT &copy; Silas B. Domingos](https://balmante.eti.br)
