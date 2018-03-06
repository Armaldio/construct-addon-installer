// list page

console.log('C2 addon installer is watching this page!');

let addons = $('.addonRender');

$(addons).each((index, addon) => {
    let button       = document.createElement('a');
    button.className = 'button';
    let text         = document.createTextNode('Install');
    button.appendChild(text);

    $(button).css('margin-top', '5px');
    $(button).css('font-size', '0.85rem');
    $(button).css('padding', '5px 15px');

    let url     = $(addon).find('.top .name').attr('href').replace(/(.*)\/construct-2\/addons\//, '');
    button.href = 'addoninstaller://' + url;

    if (window.location.href.includes('construct-2/addons'))
        $(addon).append(button);
});

// details page
let downloadHeader = $('.infoCol h2:nth-child(1)');
let downloadButton = downloadHeader.next().next();
let iconURL        = chrome.extension.getURL('icons/border-48.png');
if (window.location.href.includes('construct-2/addons')) {
    $('.infoCol').first().html(`<div id="install-button">
    <!--<h2 class="nbm">Install</h2>
    <div class="tiSpacer"></div>-->
    <a href="addoninstaller://${window.location.href.replace(/https?:\/\/(www\.)?construct\.net\/(.*)construct-2\/addons\//, '')}" class="button" style="width: 100%; text-align: center;"><img height="28px" style="border: 0; float: left;" src="${iconURL}"><span>INSTALL NOW</span></a>
    <div class="tiSpacer"></div>
</div>
${$('.infoCol').first().html()}`);
}

// every link
$('a').each(function (index, element) {
    let regexp = /https?:\/\/(www\.)?construct\.net\/(.*)construct-2\/addons\//;
    let link   = $(element).attr('href');
    if (link !== undefined && link !== null) {
        if (link.match(regexp)) {
            $(element).after(
                `
                <a class="install-button" href="addoninstaller://${link.replace(regexp, '')}">Install now</a>
                `
            );
        }
    }
});