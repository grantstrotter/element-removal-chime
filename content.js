(function () {
    const MENU_MAX_WIDTH = 375;
    const MENU_EDGE_MARGIN = 10;

    const THEMES = {
        light: {
            background: '#ffffff',
            border: '#cccccc',
            text: '#000000',
            hover: '#eeeeee',
            shadow: 'rgba(0, 0, 0, 0.2)',
        },
        dark: {
            background: '#1e1e1e',
            border: '#444444',
            text: '#e0e0e0',
            hover: '#2e2e2e',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    };

    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEMES.dark
        : THEMES.light;
    
    let lastRightClick = {
        element: null,
        x: 0,
        y: 0,
    }
    let activeMenu = null;

    // Capture right-clicked element and position
    document.addEventListener(
        'contextmenu',
        (e) => {
            lastRightClick.element = e.target;
            lastRightClick.x = e.clientX;
            lastRightClick.y = e.clientY;
        },
        true
    );

    function buildAncestorList(el) {
        const elements = [];
        let current = el;
        while (current && elements.length < 7) {
            elements.push(current);
            current = current.parentElement;
        }
        return elements.reverse();
    }

    function formatLabel(el) {
        let label = el.tagName.toLowerCase();
        if (el.id) label += ` #${el.id}`;
        for (const cls of el.classList) {
            label += ` .${cls}`;
        }
        return label;
    }

    function dismissMenu() {
        if (activeMenu) {
            activeMenu.remove();
            activeMenu = null;
        }
    }

    function showAncestorMenu(elements, x, y) {
        dismissMenu();

        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            z-index: 2147483647;
            visibility: hidden;
            background: ${theme.background};
            border: 1px solid ${theme.border};
            color: ${theme.text};
            font: 13px monospace;
            box-shadow: 2px 2px 12px ${theme.shadow};
            width: ${MENU_MAX_WIDTH}px;
            box-sizing: border-box;
            border-radius: 8px;
            overflow: hidden;
        `;

        const heading = document.createElement('div');
        heading.textContent = 'Choose the element to watch';
        heading.style.cssText = `
            padding: 8px 12px 6px;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid ${theme.border};
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        `;
        menu.appendChild(heading);

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const isClicked = i === elements.length - 1;
            const label = formatLabel(el);
            const row = document.createElement('div');
            row.title = (isClicked ? 'Clicked: ' : '') + label;
            if (isClicked) {
                const strong = document.createElement('strong');
                strong.textContent = 'Clicked: ';
                row.appendChild(strong);
            }
            row.appendChild(document.createTextNode(label));
            row.style.cssText = `
                padding: 4px 12px;
                padding-left: calc(12px + ${i}ch);
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            `;
            row.addEventListener('mouseenter', () => row.style.background = theme.hover);
            row.addEventListener('mouseleave', () => row.style.background = '');
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                dismissMenu();
                watchElement(el);
            });
            menu.appendChild(row);
        }

        document.body.appendChild(menu);
        activeMenu = menu;

        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        console.log({
            x, innerWidth: window.innerWidth, menuWidth, MENU_EDGE_MARGIN
        });
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const left = Math.min(x, viewportWidth - menuWidth - MENU_EDGE_MARGIN);
        const top = Math.min(y, viewportHeight - menuHeight - MENU_EDGE_MARGIN);
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.visibility = 'visible';

        // Dismiss on outside click
        document.addEventListener('mousedown', function onOutsideClick(e) {
            if (!menu.contains(e.target)) {
                dismissMenu();
                document.removeEventListener('mousedown', onOutsideClick);
            }
        });

        // Dismiss on Escape
        document.addEventListener('keydown', function onEscape(e) {
            if (e.key === 'Escape') {
                dismissMenu();
                document.removeEventListener('keydown', onEscape);
            }
        });
    }

    function watchElement(el) {
        console.log('Watching element:', el);
        el.style.outline = '4px solid red';
        el.style.outlineOffset = '-4px';

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

    // Right-click menu support
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'WATCH_ELEMENT') {
            if (lastRightClick.element) {
                const ancestors = buildAncestorList(lastRightClick.element);
                showAncestorMenu(ancestors, lastRightClick.x, lastRightClick.y);
            } else {
                console.warn('No element captured for right-click');
            }
        }
    });
})();
