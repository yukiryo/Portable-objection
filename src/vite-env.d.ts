/// <reference types="vite/client" />
/// <reference types="react" />

declare global {
    // Git info injected by Vite at build time
    const __COMMIT_HASH__: string;
    const __COMMIT_FULL_HASH__: string;
    const __COMMIT_DATE__: string;
    const __DEV_MODE__: boolean;

    namespace JSX {
        interface IntrinsicElements {
            'meting-js': any;
        }
    }
}

export { };

