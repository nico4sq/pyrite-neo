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