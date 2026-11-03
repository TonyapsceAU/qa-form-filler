// export const browserApi = globalThis.browser || globalThis.chrome;
const browserApi = globalThis.browser || globalThis.chrome;
function getBrowserName(){
    const ua = navigator.userAgent;

    if (ua.includes("Edg/")){
        return "Edge";
    }

    if (ua.includes("Chrome")){
        return "Chrome";
    }

    return "Unknown";
}