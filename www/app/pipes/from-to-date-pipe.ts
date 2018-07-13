import { Pipe, PipeTransform } from '@angular/core';

@Pipe ({ name: 'FromToDatePipe', pure: true })

export class FromToDatePipe implements PipeTransform {
  transform(value, fromDate?: any, toDate?: any) {
    if (fromDate && toDate) {
      let from: string = fromDate.toString();
      let to: string = toDate.toString();
      if(from.length == 10 && to.length == 10) {
        from = from.slice(0, 4) + from.slice(5, 7) + from.slice(-2);
        to = to.slice(0, 4) + to.slice(5, 7) + to.slice(-2);
        return value.filter((item) => (Number(item.validity) >= Number(from)) && (Number(item.validity) <= Number(to) && item.validity!="99999999"));
      }
    }
    else if (fromDate) {
      let from: string = fromDate.toString();
      if(from.length == 10) {
        from = from.slice(0, 4) + from.slice(5, 7) + from.slice(-2);
        return value.filter((item) => (Number(item.validity) >= Number(from) && item.validity!="99999999"));
      }
    }
    else if (toDate) {
      let to: string = toDate.toString();
      if(to.length == 10) {
        to = to.slice(0, 4) + to.slice(5, 7) + to.slice(-2);
        return value.filter((item) => (Number(item.validity) <= Number(to) && item.validity!="99999999"));
      }
    }
    return value;
  }    
}