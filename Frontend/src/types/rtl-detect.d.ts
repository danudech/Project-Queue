declare module 'rtl-detect' {
    export function isRtl(lang: string): boolean | undefined;
    export function getLangDir(lang: string): 'rtl' | 'ltr';
    const content: any;
    export default content;
}