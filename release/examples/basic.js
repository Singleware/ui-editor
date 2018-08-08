"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic editor template.
 */
const Editor = require("../source");
const DOM = require("@singleware/jsx");
const editor = (DOM.create(Editor.Template, null,
    DOM.create("button", { slot: "toolbar" }, "Bold"),
    DOM.create("button", { slot: "toolbar" }, "Italic"),
    DOM.create("button", { slot: "toolbar" }, "Stroke"),
    DOM.create("div", { slot: "content" }, "Primary content slot."),
    DOM.create("div", { slot: "content" }, "Secondary content slot")));
