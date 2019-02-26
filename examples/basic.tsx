/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic editor template.
 */
import * as Editor from '../source';
import * as JSX from '@singleware/jsx';

const editor = (
  <Editor.Component>
    <button slot="toolbar">Bold</button>
    <button slot="toolbar">Italic</button>
    <button slot="toolbar">Stroke</button>
    <div slot="content">Content slot.</div>
  </Editor.Component>
) as Editor.Element;
