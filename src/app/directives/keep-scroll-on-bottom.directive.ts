import { Directive, ElementRef } from "@angular/core";

@Directive({
    selector: "[appKeepScrollOnBottom]",
})
export class KeepScrollOnBottomDirective {
    constructor(el: ElementRef) {
        el.nativeElement.style.backgroundColor = "yellow";
    }
}
