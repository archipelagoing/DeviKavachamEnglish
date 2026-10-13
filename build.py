#!/usr/bin/env python3
"""Build the reading pages and EPUB from the untouched UTF-8 source."""
from pathlib import Path
import argparse
import hashlib
import html
import re
import zipfile
from xml.etree import ElementTree as ET
from guide_content import render_navadurga

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'Devi_Kavacham_English_Only.txt'
SITE_URL = 'https://archipelagoing.github.io/DeviKavachamEnglish/'

def version_assets(document):
    """Refresh changed reader assets without reusing stale browser cache entries."""
    def replace(match):
        digest = hashlib.sha256((ROOT / match[2]).read_bytes()).hexdigest()[:12]
        return f'{match[1]}="{match[2]}?v={digest}"'
    return re.sub(r'(src|href)="(assets/[^"?]+\.(?:css|js))"', replace, document)

def search_metadata(page=''):
    """Keep canonical URLs and the sitemap on the free project-site address."""
    verification = ROOT / 'search-console-verification.txt'
    tag = ''
    if verification.exists():
        token = verification.read_text(encoding='utf-8').strip()
        if not re.fullmatch(r'[A-Za-z0-9_-]+', token):
            raise ValueError('Search Console verification file must contain only the token from the HTML tag.')
        tag = f'<meta name="google-site-verification" content="{token}">'
    return f'<link rel="canonical" href="{SITE_URL}{page}"><link rel="sitemap" type="application/xml" href="sitemap.xml">' + tag

def build_sitemap():
    urls = ['', 'contents.html', 'about.html']
    document = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    document += ''.join(f'  <url><loc>{SITE_URL}{page}</loc></url>\n' for page in urls)
    (ROOT / 'sitemap.xml').write_text(document + '</urlset>\n', encoding='utf-8')

def appearance_settings(full=True):
    colors = '<fieldset><legend>Page color</legend>' + ''.join(f'<label><input type="radio" name="appearance" value="{color}"> {color.title()}</label>' for color in ('light', 'dark', 'sepia')) + '</fieldset>'
    if not full:
        return f'<details id="appearance-settings" class="appearance-settings" hidden><summary>Appearance</summary><div class="appearance-panel">{colors}</div></details>'
    return f'''<details id="appearance-settings" class="appearance-settings" hidden><summary>Appearance</summary><div class="appearance-panel">{colors}<fieldset><legend>Typeface</legend><label><input type="radio" name="typeface" value="serif" checked> Serif</label><label><input type="radio" name="typeface" value="sans"> Sans-serif</label></fieldset><label class="setting-row" for="reading-width">Reading width <select id="reading-width"><option value="narrow">Narrow</option><option value="normal" selected>Normal</option><option value="wide">Wide</option></select></label><label class="setting-row" for="line-spacing">Line spacing <select id="line-spacing"><option value="1.4">Compact</option><option value="1.6" selected>Normal</option><option value="1.8">Spacious</option></select></label><button type="button" id="reset-appearance">Reset appearance</button></div></details>'''

def render_chunk(chunk):
    """Add visual verse boundaries without adding or removing text characters."""
    matches = list(re.finditer(r'^Verse (\d+)\r?$', chunk, re.M))
    if not matches:
        return html.escape(chunk)
    parts = [html.escape(chunk[:matches[0].start()])]
    for i, match in enumerate(matches):
        end = matches[i+1].start() if i+1 < len(matches) else len(chunk)
        remainder = chunk[match.end():end]
        leading = re.match(r'^\r?\n', remainder).group()
        body = remainder[len(leading):]
        trailing = re.search(r'\s*$', body).group()
        body = body[:-len(trailing)] if trailing else body
        suffix = re.search(r' \(' + match[1] + r'\)$', body)
        ending = suffix.group() if suffix else ''
        body = body[:-len(ending)] if ending else body
        parts.append(f'<span class="verse" id="verse-{match[1]}" data-label="(v{match[1]})" data-tone="{'even' if int(match[1]) % 2 == 0 else 'odd'}" aria-label="Verse {match[1]}"><span class="source-marker" aria-hidden="true">{html.escape(match[0] + leading)}</span>{html.escape(body)}<span class="source-marker" aria-hidden="true">{html.escape(ending + trailing)}</span></span>')
    return ''.join(parts)

def site_tabs(active):
    tabs = [('read', 'index.html', 'Read'), ('contents', 'contents.html', 'Contents'), ('about', 'about.html', 'About')]
    links = ''.join(f'<a href="{url}"' + (' data-read data-resume' if key == 'read' else '') + (' aria-current="page"' if key == active else '') + f'>{label}</a>' for key, url, label in tabs)
    return '<nav class="site-tabs" aria-label="Explore Devi Kavacham">' + links + '</nav>'


def build_guides():
    for name, title, description in [
        ('contents', 'Contents · Devi Kavacham', 'Explore the Devi Kavacham by theme, with direct links to its 56 verses.'),
        ('about', 'About · Devi Kavacham', 'Learn about the meaning, protective prayer, and devotional context of the Devi Kavacham.')
    ]:
        content = (ROOT / 'templates' / f'{name}.html').read_text(encoding='utf-8')
        if name == 'contents':
            content = content.replace('<!-- NAVADURGA_CARDS -->', render_navadurga(ROOT, SOURCE.read_text(encoding='utf-8')))
        document = f'''<!doctype html>
<html lang="en" data-edition="reader-view" data-appearance="sepia" data-font="serif"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{description}"><title>{title}</title>{search_metadata(name + '.html')}<link rel="icon" href="assets/lotus.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/reader.css"><link rel="stylesheet" href="assets/appearance.css"><link rel="stylesheet" href="assets/reader-view.css"><link rel="stylesheet" href="assets/guide.css"><script src="assets/site.js" defer></script></head>
<body class="guide-page"><a class="skip-link" href="#guide">Skip to content</a><header class="book-header"><a class="site-title" data-read data-resume href="index.html"><img class="site-logo" src="assets/lotus.svg" alt="" width="24" height="24">Devi Kavacham</a>{site_tabs(name)}{appearance_settings(False)}</header><main id="guide" class="guide-main">{content}</main><footer class="guide-footer"><p>Devi Kavacham · An English reading edition</p><a data-read data-resume href="index.html">Return to reading</a></footer></body></html>'''
        (ROOT / f'{name}.html').write_text(version_assets(document), encoding='utf-8')

def build():
    raw = SOURCE.read_bytes()
    text = raw.decode('utf-8')
    markers = list(re.finditer(r'^Verse (\d+)\r?$', text, re.M))
    if [int(m[1]) for m in markers] != list(range(1, 57)):
        raise ValueError('Expected exactly 56 consecutive Verse headings; source left unchanged.')
    intro = text[:markers[0].start()]
    verses = [text[m.start():markers[i+1].start() if i+1 < 56 else len(text)] for i,m in enumerate(markers)]
    chunks = [intro] + [''.join(verses[i:i+7]) for i in range(0,56,7)]
    assert ''.join(chunks).encode('utf-8') == raw
    titles = ['Opening'] + [f'Verses {i+1}–{i+7}' for i in range(0,56,7)]
    sections = []
    for i, chunk in enumerate(chunks):
        body = render_chunk(chunk)
        sections.append(f'<section class="reading-page" id="page-{i}" aria-labelledby="heading-{i}"><h2 id="heading-{i}" tabindex="-1">{titles[i]}</h2><pre class="source-text">{body}</pre></section>')
    options = ''.join(f'<option value="{i}">{title}</option>' for i,title in enumerate(titles))
    doc = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Devi Kavacham, presented in a quiet reading edition with 56 verses and an EPUB download."><title>Devi Kavacham</title><link rel="icon" href="assets/lotus.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/vendor/tufte.css"><link rel="stylesheet" href="assets/reader.css"><script src="assets/site.js" defer></script><script src="assets/reader.js" defer></script></head>
<body><a class="skip-link" href="#reading">Skip to text</a>
<header class="book-header">
<h1><img class="site-logo" src="assets/lotus.svg" alt="" width="26" height="26">Devi Kavacham</h1>
SITE_TABS
<div class="reader-controls" id="reader-controls" hidden>
<div class="page-controls"><label for="page-select">Go to verses</label><select id="page-select">OPTIONS</select></div>
<div class="text-controls"><div class="text-size-control" role="group" aria-label="Text size"><button type="button" id="smaller" aria-label="Decrease text size">A−</button><button type="button" id="larger" aria-label="Increase text size">A+</button></div></div>
<nav class="epub-controls" id="page-navigation" aria-label="Book navigation" hidden><button type="button" id="epub-previous" data-turn="-1" aria-label="Previous spread" title="Previous spread">‹</button><span id="book-position" aria-live="polite" aria-atomic="true">Opening</span><button type="button" id="epub-next" data-turn="1" aria-label="Next spread" title="Next spread">›</button></nav>
</div>
<details class="book-menu"><summary>More</summary><div class="book-menu-panel"><a href="reader-view.html" id="theme-comparison">Reader View version</a><a href="Devi-Kavacham.epub" download>Download EPUB</a><a href="Devi_Kavacham_English_Only.txt" download>Original text</a><button id="epub-toggle" type="button" hidden>Read EPUB</button></div></details>
</header>
<main id="reading"><p id="reading-notice" role="status" hidden></p>
<article id="html-reader">SECTIONS</article>
<section id="epub-reader" hidden aria-label="EPUB reader"><p id="epub-help" class="reader-help"></p><div id="epub-area" tabindex="0" role="region" aria-label="Book pages" aria-describedby="epub-help"></div><p id="epub-status" role="status" aria-live="polite"></p></section></main>
<footer><p>56 verses · Eight reading pages</p><p>This edition preserves the supplied text.</p><p>Source reference: <a href="https://stotranidhi.com/en/durga-saptasati-devi-kavacham-in-english/">Stotra Nidhi — Devi Kavacham</a>.</p></footer></body></html>'''.replace('OPTIONS',options).replace('SECTIONS','\n'.join(sections)).replace('SITE_TABS', site_tabs('read'))
    doc = doc.replace('<title>Devi Kavacham</title>', '<title>Devi Kavacham English Translation · Read &amp; Download</title>' + search_metadata())
    doc = doc.replace('Devi Kavacham, presented in a quiet reading edition with 56 verses and an EPUB download.', 'Read the complete Devi Kavacham English translation: 56 verses, a guide to the prayer, adjustable reading settings, and a free EPUB download.')
    doc = doc.replace('<script src="assets/site.js" defer>', '<link rel="stylesheet" href="assets/appearance.css"><script src="assets/site.js" defer>')
    doc = doc.replace('<div class="text-controls">', '<div class="text-controls">' + appearance_settings())
    comparison = '<a href="reader-view.html" id="theme-comparison">Reader View version</a>'
    (ROOT/'index.html').write_text(version_assets(doc),encoding='utf-8')
    reader_view = doc.replace('<html lang="en">','<html lang="en" data-edition="reader-view" data-appearance="sepia" data-font="serif">')
    reader_view = reader_view.replace('<link rel="stylesheet" href="assets/vendor/tufte.css">','')
    reader_view = reader_view.replace('<script src="assets/reader.js" defer>', '<link rel="stylesheet" href="assets/reader-view.css"><script src="assets/reader.js" defer>')
    reader_view = reader_view.replace(comparison,'<a href="index.html" id="theme-comparison">Tufte version</a>')
    reader_view = reader_view.replace('Devi Kavacham English Translation · Read &amp; Download', 'Devi Kavacham English Translation · Reader View')
    reader_view = reader_view.replace('<footer>', '<footer><p class="theme-credit">Reader View appearance adapted from <a href="https://github.com/tabreturn/tabreturn.jekyll.theme">tabreturn’s Reader-View theme</a>.</p>')
    (ROOT/'reader-view.html').write_text(version_assets(reader_view),encoding='utf-8')
    css = 'body{font-family:Georgia,"Times New Roman",serif;color:#211e18;background:#fffff8;margin:0;padding:1rem;line-height:1.65}.source-text{font:inherit;white-space:pre-wrap;tab-size:8;overflow-wrap:anywhere;margin:0}.verse{display:block;color:#211e18}.verse[data-tone="even"]{color:#245c45}.verse+.verse{margin-top:.65em}.source-marker{display:none}.verse::before{content:attr(data-label);color:#a04d45;font-size:.78em;font-weight:normal;margin-right:.45em}'
    xhtmls = []
    for i,chunk in enumerate(chunks):
        xhtmls.append('<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>'+titles[i]+'</title><link rel="stylesheet" href="book.css"/></head><body><pre class="source-text">'+render_chunk(chunk)+'</pre></body></html>')
    nav = '<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><title>Contents</title></head><body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>'+''.join(f'<li><a href="page-{i}.xhtml">{title}</a></li>' for i,title in enumerate(titles))+'</ol></nav></body></html>'
    digest = hashlib.sha256(raw).hexdigest()
    opf = '<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">urn:sha256:'+digest+'</dc:identifier><dc:title>Devi Kavacham</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-10-09T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="book.css" media-type="text/css"/>'+''.join(f'<item id="page-{i}" href="page-{i}.xhtml" media-type="application/xhtml+xml"/>' for i in range(9))+'</manifest><spine>'+''.join(f'<itemref idref="page-{i}"/>' for i in range(9))+'</spine></package>'
    with zipfile.ZipFile(ROOT/'Devi-Kavacham.epub','w') as z:
        z.writestr('mimetype','application/epub+zip',compress_type=zipfile.ZIP_STORED)
        z.writestr('META-INF/container.xml','<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
        for name,content in [('EPUB/package.opf',opf),('EPUB/nav.xhtml',nav),('EPUB/book.css',css)]+[(f'EPUB/page-{i}.xhtml',x) for i,x in enumerate(xhtmls)]:
            z.writestr(name,content.encode('utf-8'),compress_type=zipfile.ZIP_DEFLATED)
    build_guides()
    build_sitemap()
    verify(raw,chunks)
    print(f'Built 8 pages × 7 verses, opening, and EPUB. Source SHA-256: {digest}')

def verify(raw=None,chunks=None):
    from html.parser import HTMLParser
    raw = SOURCE.read_bytes() if raw is None else raw
    class Reader(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True); self.inside=False; self.parts=[]
        def handle_starttag(self,tag,attrs):
            if tag=='pre' and dict(attrs).get('class')=='source-text': self.inside=True
        def handle_endtag(self,tag):
            if tag=='pre': self.inside=False
        def handle_data(self,data):
            if self.inside: self.parts.append(data)
    for name in ('index.html','reader-view.html'):
        reader=Reader();reader.feed((ROOT/name).read_text(encoding='utf-8'))
        assert ''.join(reader.parts).encode('utf-8')==raw, f'HTML source text changed in {name}'
    ns={'h':'http://www.w3.org/1999/xhtml'}
    with zipfile.ZipFile(ROOT/'Devi-Kavacham.epub') as z:
        assert z.infolist()[0].filename=='mimetype'
        assert z.infolist()[0].compress_type==zipfile.ZIP_STORED
        extracted=[]
        for i in range(9):
            root=ET.fromstring(z.read(f'EPUB/page-{i}.xhtml'))
            chunk=''.join(root.find('.//h:pre',ns).itertext()); extracted.append(chunk)
            if i: assert len(re.findall(r'^Verse \d+\r?$',chunk,re.M))==7
        assert ''.join(extracted).encode('utf-8')==raw,'EPUB source text changed'
        ET.fromstring(z.read('EPUB/package.opf'));ET.fromstring(z.read('EPUB/nav.xhtml'));ET.fromstring(z.read('META-INF/container.xml'))
    class Metadata(HTMLParser):
        def __init__(self):
            super().__init__(); self.canonicals=[]; self.descriptions=[]
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == 'link' and attrs.get('rel') == 'canonical': self.canonicals.append(attrs.get('href'))
            if tag == 'meta' and attrs.get('name') == 'description': self.descriptions.append(attrs.get('content'))
            if tag == 'meta' and attrs.get('name') == 'robots': assert 'noindex' not in attrs.get('content', '').lower()
    for name in ('index.html', 'reader-view.html', 'contents.html', 'about.html'):
        metadata = Metadata(); metadata.feed((ROOT / name).read_text(encoding='utf-8'))
        expected = SITE_URL + (name if name in ('contents.html', 'about.html') else '')
        assert metadata.canonicals == [expected], f'Unexpected canonical URL in {name}'
        assert len(metadata.descriptions) == 1 and metadata.descriptions[0], f'Missing description in {name}'
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    locations = [element.text for element in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert locations == [SITE_URL, SITE_URL + 'contents.html', SITE_URL + 'about.html'], 'Unexpected sitemap URLs'
    print('Verified: both HTML themes and EPUB preserve the complete source text; each reading page has seven verses. Canonicals, descriptions, and sitemap pass.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    verify() if args.check else build()
