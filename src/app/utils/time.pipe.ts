import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'time'
})
export class TimePipe implements PipeTransform {

    transform(value: number) {
        const base = new Date(value);
        const date = base.toLocaleDateString();
        return date + ' ' + base.getHours() + ':' + base.getMinutes();
    }

}