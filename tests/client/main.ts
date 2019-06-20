/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Frontend from '@singleware/frontend';

import { Handler } from './handler';

/**
 * Test application class.
 */
@Class.Describe()
class Application extends Frontend.Main {
  /**
   * Global title settings.
   */
  @Class.Private()
  private static title = <Frontend.Title>{
    text: 'Singleware',
    separator: ' - ',
    prefix: true
  };

  /**
   * Service instance.
   */
  @Class.Private()
  private service = new Frontend.Services.Client({});

  /**
   * Default constructor.
   */
  constructor() {
    super({ title: Application.title });
    this.addService(this.service);
    this.addHandler(Handler);
    this.start();
  }
}

// Start application.
new Application();
