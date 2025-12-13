/// <reference types="vite/client" />
/// <reference types="react" />

// Git info injected by Vite at build time
declare const __COMMIT_HASH__: string;
declare const __COMMIT_FULL_HASH__: string;
declare const __COMMIT_DATE__: string;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'meting-js': any;
        }
    }
}

export { };
