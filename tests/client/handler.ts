/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Frontend from '@singleware/frontend';

import { View } from './view';

/**
 * Component test, handler class.
 */
@Class.Describe()
export class Handler extends Class.Null {
  /**
   * Component test route.
   * @param match Matched route.
   */
  @Frontend.Processor({ path: '/' })
  @Class.Public()
  public async indexAction(match: Frontend.Match): Promise<void> {
    match.detail.output.content = new View({});
  }
}
