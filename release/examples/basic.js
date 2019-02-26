"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 *
 * The proposal of this example is to show how to use the basic editor template.
 */
const Editor = require("../source");
const JSX = require("@singleware/jsx");
const editor = (JSX.create(Editor.Component, null,
    JSX.create("button", { slot: "toolbar" }, "Bold"),
    JSX.create("button", { slot: "toolbar" }, "Italic"),
    JSX.create("button", { slot: "toolbar" }, "Stroke"),
    JSX.create("div", { slot: "content" }, "Content slot.")));
