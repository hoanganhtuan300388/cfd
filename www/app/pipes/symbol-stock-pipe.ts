import { Pipe, PipeTransform } from '@angular/core';

@Pipe ({ name: 'SymbolStockPipe', pure: true })

export class SymbolStockPipe implements PipeTransform {

  // Transform is the new "return function(value, args)" in Angular 1.x
  transform(value, args?) {

    if (args) {
      // ES6 array destructuring
      return value.filter((item) => item.securityCode.startsWith(args));
    }

    return value;
  }
}