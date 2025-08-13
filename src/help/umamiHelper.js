export default function trackUmami(keyword, options) {
    try {
        umami.track(keyword, options);
    } catch (error) {
        
    }
}