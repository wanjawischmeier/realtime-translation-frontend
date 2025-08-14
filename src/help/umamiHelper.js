export default function trackUmami(keyword, options) {
    try {
        umami.track(keyword, options);
    } catch (error) {
        // TODO: error handling
    }
}