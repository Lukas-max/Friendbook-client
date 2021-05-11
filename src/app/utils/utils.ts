
export class Utils {


    static decodeBase64(base64: string) {
        const atb = atob(base64);
        const len = atb.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = atb.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    }

    static scroll(element: HTMLElement, timeout: number) {
        setTimeout(() => element.scrollIntoView(), timeout);
    }
}