
(function () {
    'use strict';

    var css = [
        '.page-loader-overlay{position:fixed;inset:0;background:linear-gradient(135deg,#f8f9ff 0%,#eef1ff 50%,#f0e6ff 100%);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 1s cubic-bezier(.4,0,.2,1),visibility 1s cubic-bezier(.4,0,.2,1)}',
        '.page-loader-overlay.hidden{opacity:0;visibility:hidden;pointer-events:none}',
        '.preloader-content{display:flex;flex-direction:column;align-items:center;gap:1.5rem}',
        '.page-loader-overlay .loader{width:56px;aspect-ratio:1;display:grid;border:4px solid #0000;border-radius:50%;border-color:#e0e0e0 #0000;animation:preloaderSpin 5s infinite linear}',
        '.page-loader-overlay .loader::before,.page-loader-overlay .loader::after{content:"";grid-area:1/1;margin:2px;border:inherit;border-radius:50%}',
        '.page-loader-overlay .loader::before{border-color:#f03355 #0000;animation:preloaderSpin .5s infinite linear reverse}',
        '.page-loader-overlay .loader::after{margin:8px;border-color:#7380ec #0000;animation:preloaderSpin .75s infinite linear}',
        '.preloader-text{color:#555;font-family:"Poppins",sans-serif;font-size:.9rem;font-weight:500;letter-spacing:.5px;margin:0}',
        '.dot-animation{display:inline-block;animation:dotPulse 1.4s infinite steps(4,end);width:1.5em;text-align:left;overflow:hidden;vertical-align:bottom}',
        '@keyframes preloaderSpin{100%{transform:rotate(1turn)}}',
        '@keyframes dotPulse{0%{width:0}25%{width:.5em}50%{width:1em}75%{width:1.5em}100%{width:0}}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'preloader-styles';
    style.textContent = css;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'page-loader-overlay';
    overlay.id = 'pageLoader';
    overlay.innerHTML =
        '<div class="preloader-content">' +
            '<div class="loader"></div>' +
            '<p class="preloader-text">Loading<span class="dot-animation">...</span></p>' +
        '</div>';

    if (document.body.firstChild) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.body.appendChild(overlay);
    }

    function hidePreloader() {
        if (overlay.classList.contains('hidden')) return;
        setTimeout(function () {
            overlay.classList.add('hidden');

            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

                var s = document.getElementById('preloader-styles');
                if (s && s.parentNode) s.parentNode.removeChild(s);
            }, 1200);
        }, 400);
    }

    window.addEventListener('load', hidePreloader);

    setTimeout(function () {
        hidePreloader();
    }, 12000);

    window.hidePageLoader = hidePreloader;
})();
