/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedError} from './facade/errors';

/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ErrorHandler` prints error messages to the `Console`. To
 * intercept error handling,
 * write a custom exception handler that replaces this default as appropriate for your app.
 *
 * ### Example
 *
 * ```javascript
 *
 * class MyErrorHandler implements ErrorHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * @NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 * @stable
 */
export class ErrorHandler {
  /**
   * @internal
   */
  _console: Console = console;

  /**
   * @internal
   */
  rethrowError: boolean;

  constructor(rethrowError: boolean = true) { this.rethrowError = rethrowError; }

  handleError(error: any): void {
    var originalError = this._findOriginalError(error);
    var originalStack = this._findOriginalStack(error);
    var context = this._findContext(error);

    this._console.error(`EXCEPTION: ${this._extractMessage(error)}`);

    if (originalError) {
      this._console.error(`ORIGINAL EXCEPTION: ${this._extractMessage(originalError)}`);
    }

    if (originalStack) {
      this._console.error('ORIGINAL STACKTRACE:');
      this._console.error(originalStack);
    }

    if (context) {
      this._console.error('ERROR CONTEXT:');
      this._console.error(context);
    }

    // We rethrow exceptions, so operations like 'bootstrap' will result in an error
    // when an error happens. If we do not rethrow, bootstrap will always succeed.
    if (this.rethrowError) throw error;
  }

  /** @internal */
  _extractMessage(error: any): string {
    return error instanceof Error ? error.message : error.toString();
  }

  /** @internal */
  _findContext(error: any): any {
    if (error) {
      return error.context ? error.context :
                             this._findContext((error as WrappedError).originalError);
    } else {
      return null;
    }
  }

  /** @internal */
  _findOriginalError(error: any): any {
    var e = (error as WrappedError).originalError;
    while (e && (e as WrappedError).originalError) {
      e = (e as WrappedError).originalError;
    }

    return e;
  }

  /** @internal */
  _findOriginalStack(error: any): string {
    if (!(error instanceof Error)) return null;

    var e: any = error;
    var stack: string = e.stack;
    while (e instanceof Error && (e as WrappedError).originalError) {
      e = (e as WrappedError).originalError;
      if (e instanceof Error && e.stack) {
        stack = e.stack;
      }
    }

    return stack;
  }
}
