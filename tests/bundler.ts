/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Bundler from '@singleware/bundler';

Bundler.compile({
  output: './tests/public/index.js',
  sources: [
    {
      name: '@singleware/frontend',
      path: './node_modules/@singleware/frontend',
      package: true
    },
    {
      name: '@singleware/ui-select',
      path: './node_modules/@singleware/ui-select',
      package: true
    },
    {
      name: '@singleware/ui-fieldset',
      path: './node_modules/@singleware/ui-fieldset',
      package: true
    },
    {
      name: '@singleware/ui-field',
      path: './node_modules/@singleware/ui-field',
      package: true
    },
    {
      name: '@singleware/ui-form',
      path: './node_modules/@singleware/ui-form',
      package: true
    },
    {
      name: '@module',
      path: './',
      package: true
    },
    {
      name: '@client',
      path: './release/tests/client'
    }
  ]
});
