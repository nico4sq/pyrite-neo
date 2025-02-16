export function stripHtml(html)
{
    return html.replace(/<[^>]*>?/gm, '');
}

export function decodeHtml(html)
{
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

export function addLoadingState(element)
{
    element.classList.add('is--loading');
}

export function removeLoadingState(element)
{
    element.classList.remove('is--loading');
}