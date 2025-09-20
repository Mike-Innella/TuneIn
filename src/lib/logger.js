export const isDev = () => process.env.NODE_ENV === 'development';
export const log = (...args) => isDev() && console.log(...args);
export const warn = (...args) => isDev() && console.warn(...args);
export const error = (...args) => isDev() && console.error(...args);