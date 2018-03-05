// list page

console.log('C2 addon installer is watching this page!');

let addons = $('.addonRender');

$(addons).each((index, addon) => {
    let button       = document.createElement('a');
    button.className = 'button';
    var text         = document.createTextNode('Install');
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
let downloadButton = $('div.col.infoCol > h2:nth-child(1)').next().next();
let dlLink         = downloadButton.attr('href');
if (window.location.href.includes('construct-2/addons')) {
    $('div.col.infoCol > h2:nth-child(1)').before(`
    <h2 class="nbm">Install</h2>
    <div class="tiSpacer"></div>
    <a href="addoninstaller://${window.location.href.replace(/https?:\/\/(www\.)?construct\.net\/(.*)construct-2\/addons\//, '')}" class="button" style="width: 100%; text-align: center;">${downloadButton.text()}</a>
`);
}

$('a').each(function (index, element) {
    let regexp = /https?:\/\/(www\.)?construct\.net\/(.*)construct-2\/addons\//;
    let link = $(element).attr('href');
    if (link !== undefined && link !== null) {
        //<a href="addoninstaller://${window.location.href.replace(/https?:\/\/(www\.)?construct.net\/(.*)\/construct-2\/addons\//, '')}" class="button" style="width: 100%; text-align: center;">${downloadButton.text()}</a>
        if (link.match(regexp))
        {
            console.log(link);
            $(element).after(
                `
                <a class="install-button" href="addoninstaller://${link.replace(regexp, "")}">Install now</a>
                `
            )
        }
    }
});