/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic editor template.
 */
import * as Editor from '../source';
import * as DOM from '@singleware/jsx';

const editor = (
  <Editor.Template>
    <button slot="toolbar">Bold</button>
    <button slot="toolbar">Italic</button>
    <button slot="toolbar">Stroke</button>
    <div slot="content">Primary content slot.</div>
    <div slot="content">Secondary content slot</div>
  </Editor.Template>
) as Editor.Element;
