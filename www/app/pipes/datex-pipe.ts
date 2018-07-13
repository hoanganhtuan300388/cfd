import { Pipe, PipeTransform } from '@angular/core';

@Pipe ({ name: 'datex', pure: true })

export class DatexPipe implements PipeTransform {

  transform(value) {
    if (value) {
      let year = value.getFullYear();
      let month = value.getMonth() + 1;
      let day = value.getDate();
      let time = value.toLocaleTimeString();

      return year + "/" + month + "/" + day + " " + time;
    }
    return value;
  }
}