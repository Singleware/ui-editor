/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Backend from '@singleware/backend';

import { Handler } from './handler';

/**
 * Test application class.
 */
@Class.Describe()
class Application extends Backend.Main {
  /**
   * Global settings for the handler.
   */
  @Class.Private()
  private static settings = {
    strictType: true,
    baseDirectory: './tests/public/',
    indexFile: `index.html`,
    types: {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      jpg: 'image/jpeg',
      png: 'image/png',
      svg: 'text/html+svg',
      woff: 'application/font-woff',
      woff2: 'font/woff2',
      eot: 'application/vnd.ms-fontobject',
      ttf: 'application/font-sfnt'
    }
  };

  /**
   * Logger instance.
   */
  @Class.Private()
  private logger = new Backend.Loggers.Console();

  /**
   * Service instance.
   */
  @Class.Private()
  private service = new Backend.Services.Server({
    port: 8080,
    debug: true
  });

  /**
   * Default constructor.
   */
  constructor() {
    super({});
    this.addLogger(this.logger);
    this.addService(this.service);
    this.addHandler(Handler, Application.settings);
    this.start();
  }
}

// Start application.
new Application();
