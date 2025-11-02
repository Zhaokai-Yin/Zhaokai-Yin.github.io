

// 使用显式的相对路径，避免在某些环境下 fetch 路径解析错误
const content_dir = './contents/'
const config_file = 'config.yml'
// Sections must match the ids used in index.html and the markdown filenames in contents/
const section_names = ['home', 'papers', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    (function loadConfig() {
        const url = content_dir + config_file;
        console.log('[site] loading config:', url);
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Config fetch failed: ${response.status} ${response.statusText}`);
                return response.text();
            })
            .then(text => {
                const yml = jsyaml.load(text);
                Object.keys(yml).forEach(key => {
                    try {
                        const el = document.getElementById(key);
                        if (el) el.innerHTML = yml[key];
                        else console.log('[site] Unknown id for config key:', key, yml[key]);
                    } catch (err) {
                        console.log('[site] error applying config key:', key, err);
                    }
                })
            })
            .catch(error => console.error('[site] loadConfig error:', error));
    })();


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        const url = content_dir + name + '.md';
        console.log('[site] fetching section:', name, url);
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                const container = document.getElementById(name + '-md');
                if (container) {
                    container.innerHTML = html;
                } else {
                    console.warn('[site] missing container for section:', name + '-md');
                }
            })
            .then(() => {
                // MathJax
                if (window.MathJax && MathJax.typeset) MathJax.typeset();
            })
            .catch(error => console.error('[site] load section error:', error));
    })

}); 
