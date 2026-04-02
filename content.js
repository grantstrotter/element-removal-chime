(function () {
    let lastRightClickedElement = null;

    // Capture right-clicked element
    document.addEventListener(
        'contextmenu',
        (e) => {
            lastRightClickedElement = e.target;
        },
        true
    );

    function watchElement(el) {
        console.log('Watching element:', el);
        el.style.outline = '4px solid red';
        el.style.outlineOffset = '-4px';

        let last = el.outerHTML;

        function note(frequency) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = frequency;

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.75, now + 0.05); // attack
            gain.gain.linearRampToValueAtTime(0, now + 0.49); // release

            osc.start(now);
            osc.stop(now + 0.5);

            osc.onended = () => ctx.close();
        }

        function chord() {
            note(500);
            note(600);
            note(800);
        }

        // Page is refreshing, closing, or changing location
        function handleBeforeUnload() {
            chord();
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        const interval = setInterval(() => {
            // Element was removed
            if (!document.contains(el)) {
                chord();
                console.warn('Element removed:', el);

                clearInterval(interval);
                window.removeEventListener('beforeunload', handleBeforeUnload);

                return;
            }
        }, 500);
    }

    // Alt+click support
    document.addEventListener('click', function (e) {
        if (!e.altKey) return;
        watchElement(e.target);
    });

    // Right-click menu support
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'WATCH_ELEMENT') {
            if (lastRightClickedElement) {
                watchElement(lastRightClickedElement);
            } else {
                console.warn('No element captured for right-click');
            }
        }
    });
})();