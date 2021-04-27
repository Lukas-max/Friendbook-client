import { ElementRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IntersectionObserverService {

    constructor() { }

    createAndObserve(element: ElementRef): Observable<boolean> {
        return new Observable(observer => {
            const intersectionObserver = new IntersectionObserver(entries => {
                observer.next(entries);
            });

            intersectionObserver.observe(element.nativeElement);
            return () => { intersectionObserver.disconnect(); };
        }).pipe(
            mergeMap((entries: IntersectionObserverEntry[]) => entries),
            map(entry => entry.isIntersecting),
            distinctUntilChanged()
        );
    }
}