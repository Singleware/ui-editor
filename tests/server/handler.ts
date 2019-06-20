/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Backend from '@singleware/backend';

/**
 * Default handler class.
 */
@Class.Describe()
export class Handler extends Backend.Handlers.File.Default {
  /**
   * Exception response processor.
   * @param match Matched route.
   */
  @Backend.Processor({ path: '#', exact: false, environment: { methods: '*' } })
  @Class.Public()
  public async exceptionResponse(match: Backend.Types.Match): Promise<void> {
    await super.exceptionResponse(match);
  }

  /**
   * Default response processor.
   * @param match Matched route.
   */
  @Backend.Processor({ path: '/', exact: false, environment: { methods: '*' } })
  @Class.Public()
  public async defaultResponse(match: Backend.Types.Match): Promise<void> {
    await super.defaultResponse(match);
  }
}
