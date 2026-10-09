#!/usr/bin/env python3
"""Export two PDF/EPUB layouts from one editable Word document (stdlib only)."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import html
import json
import re
import shutil
import subprocess
import zipfile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent
MASTER = ROOT / 'Devi-Kavacham-editable.docx'
SOURCE = ROOT / 'Devi_Kavacham_English_Only.txt'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': W}
HIGHLIGHTS = {'yellow':'FFFF00','green':'00FF00','cyan':'00FFFF','magenta':'FF00FF','blue':'0000FF','red':'FF0000','darkBlue':'000080','darkCyan':'008080','darkGreen':'008000','darkMagenta':'800080','darkRed':'800000','darkYellow':'808000','darkGray':'808080','lightGray':'C0C0C0','black':'000000','white':'FFFFFF'}

def create_master():
    if MASTER.exists():
        return
    text = SOURCE.read_bytes().decode('utf-8')
    paragraphs = []
    for i, line in enumerate(text.split('\n')):
        props = '<w:b/>' if re.fullmatch(r'Verse \d+', line) else ''
        style = '<w:pPr><w:pStyle w:val="Title"/></w:pPr>' if i == 0 else ''
        paragraphs.append(f'<w:p>{style}<w:r><w:rPr>{props}</w:rPr><w:t xml:space="preserve">{html.escape(line)}</w:t></w:r></w:p>')
    document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="{W}"><w:body>'+''.join(paragraphs)+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/></w:sectPr></w:body></w:document>'
    styles = f'<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="{W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="32"/><w:b/></w:rPr></w:style></w:styles>'
    with zipfile.ZipFile(MASTER,'w',compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
        z.writestr('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
        z.writestr('word/_rels/document.xml.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
        z.writestr('word/document.xml',document)
        z.writestr('word/styles.xml',styles)
    print(f'Created {MASTER.name}; future exports will never overwrite it.')

def read_master(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    body = root.find('w:body', NS)
    if body.find('w:tbl', NS) is not None:
        raise ValueError('Keep the master as paragraphs; tables are not supported by this exporter.')
    tokens = []
    paragraphs = list(body.findall('w:p', NS))
    for i, paragraph in enumerate(paragraphs):
        for run in paragraph.iter(f'{{{W}}}r'):
            properties = run.find('w:rPr', NS)
            def value(name):
                element = properties.find(f'w:{name}', NS) if properties is not None else None
                return None if element is None else element.get(f'{{{W}}}val', 'true')
            style = {}
            for name, key in [('b','bold'),('i','italic')]:
                v = value(name)
                if v is not None and v not in ('0','false','off'): style[key] = True
            if value('u') not in (None,'none','0','false'): style['underline'] = True
            color = value('color')
            if color and re.fullmatch(r'[0-9a-fA-F]{6}',color): style['color'] = '#'+color
            highlight = HIGHLIGHTS.get(value('highlight'))
            shading = properties.find('w:shd',NS) if properties is not None else None
            fill = shading.get(f'{{{W}}}fill') if shading is not None else None
            if not highlight and fill and re.fullmatch(r'[0-9a-fA-F]{6}',fill): highlight = fill
            if highlight: style['background'] = '#'+highlight
            parts = []
            for child in run:
                if child.tag == f'{{{W}}}t': parts.append(child.text or '')
                elif child.tag in (f'{{{W}}}br',f'{{{W}}}cr'): parts.append('\n')
                elif child.tag == f'{{{W}}}tab': parts.append('\t')
            if parts: tokens.append((''.join(parts),style))
        if i+1 < len(paragraphs): tokens.append(('\n',{}))
    text = ''.join(t[0] for t in tokens)
    indexed = []; offset = 0
    for content,style in tokens:
        indexed.append((offset,offset+len(content),content,style)); offset += len(content)
    return text,indexed

def render_range(tokens,start,end):
    result = []
    for a,b,content,style in tokens:
        if b <= start or a >= end: continue
        fragment = html.escape(content[max(start-a,0):min(end-a,b-a)])
        if style.get('bold'): fragment = '<strong>'+fragment+'</strong>'
        if style.get('italic'): fragment = '<em>'+fragment+'</em>'
        css = []
        if style.get('underline'): css.append('text-decoration:underline')
        if style.get('color'): css.append('color:'+style['color'])
        if style.get('background'): css.append('background-color:'+style['background'])
        if css: fragment = '<span style="'+';'.join(css)+'">'+fragment+'</span>'
        result.append(fragment)
    return ''.join(result)

def render_verse(tokens,marker,end):
    return f'<span class="verse" id="verse-{marker[1]}"><span class="verse-label">'+render_range(tokens,marker.start(),marker.end())+'</span>'+render_range(tokens,marker.end(),end)+'</span>'

BOOK_CSS = 'body{font-family:Georgia,"Times New Roman",serif;color:#211e18;background:#fffff8;margin:0;padding:1rem;line-height:1.4}.source-text{font:inherit;white-space:pre-wrap;tab-size:8;overflow-wrap:anywhere;margin:0}.verse{display:block}.verse+.verse{border-top:1px solid #d8d2c5;padding-top:.4em}.verse-label{font-variant:small-caps}strong{font-weight:bold}'

def export_epub(path,pages,titles,text):
    modified = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    digest = hashlib.sha256((text+path.stem).encode('utf-8')).hexdigest()
    documents = ['<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>'+title+'</title><link rel="stylesheet" href="book.css"/></head><body><pre class="source-text">'+page+'</pre></body></html>' for page,title in zip(pages,titles)]
    nav = '<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><title>Contents</title></head><body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>'+''.join(f'<li><a href="page-{i}.xhtml">{title}</a></li>' for i,title in enumerate(titles))+'</ol></nav></body></html>'
    opf = '<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">urn:sha256:'+digest+'</dc:identifier><dc:title>Devi Kavacham — '+str(len(pages))+' sections</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">'+modified+'</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="book.css" media-type="text/css"/>'+''.join(f'<item id="page-{i}" href="page-{i}.xhtml" media-type="application/xhtml+xml"/>' for i in range(len(pages)))+'</manifest><spine>'+''.join(f'<itemref idref="page-{i}"/>' for i in range(len(pages)))+'</spine></package>'
    with zipfile.ZipFile(path,'w') as z:
        z.writestr('mimetype','application/epub+zip',compress_type=zipfile.ZIP_STORED)
        z.writestr('META-INF/container.xml','<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
        for name,content in [('EPUB/package.opf',opf),('EPUB/nav.xhtml',nav),('EPUB/book.css',BOOK_CSS)]+[(f'EPUB/page-{i}.xhtml',doc) for i,doc in enumerate(documents)]:
            z.writestr(name,content.encode('utf-8'),compress_type=zipfile.ZIP_DEFLATED)
    with zipfile.ZipFile(path) as z:
        restored = ''.join(''.join(ET.fromstring(z.read(f'EPUB/page-{i}.xhtml')).find('.//{http://www.w3.org/1999/xhtml}pre').itertext()) for i in range(len(pages)))
        if restored != text: raise ValueError(f'Text changed in {path.name}')

def print_html(path,pages,titles):
    style = '''@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#eee;font-family:Georgia,"Times New Roman",serif;color:#211e18}.sheet{width:210mm;height:297mm;padding:12mm 14mm;break-after:page;background:#fff;position:relative;font-size:12pt;line-height:1.3}.sheet:last-child{break-after:auto}.source-text{font:inherit;white-space:pre-wrap;tab-size:8;margin:0;overflow-wrap:anywhere}.verse{display:block}.verse+.verse{border-top:1px solid #d8d2c5;padding-top:.3em}.verse-label{font-variant:small-caps}.folio{position:absolute;bottom:5mm;left:14mm;right:14mm;font-size:8pt;color:#666;display:flex;justify-content:space-between}@media screen{.sheet{margin:1rem auto;box-shadow:0 0 4px #aaa}}'''
    script = '''window.fitPages=()=>{const results=[];for(const sheet of document.querySelectorAll('.sheet')){let size=13;const pre=sheet.querySelector('pre');const available=sheet.clientHeight-parseFloat(getComputedStyle(sheet).paddingTop)-parseFloat(getComputedStyle(sheet).paddingBottom);do{sheet.style.fontSize=size+'pt';if(pre.getBoundingClientRect().height<=available)break;size-=.25;}while(size>=10);if(size<10)throw Error('Text overflows a fixed page. Reduce added text or use a larger paper size.');results.push(size);}return results;};window.addEventListener('load',window.fitPages);'''
    path.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Devi Kavacham</title><style>'+style+'</style></head><body>'+''.join(f'<section class="sheet"><pre class="source-text">{page}</pre><div class="folio"><span>{title}</span><span>{i+1} / {len(pages)}</span></div></section>' for i,(page,title) in enumerate(zip(pages,titles)))+'<script>'+script+'</script></body></html>',encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--docx',type=Path,default=MASTER)
    parser.add_argument('--no-pdf',action='store_true',help='Generate EPUBs and print HTML without launching Chrome')
    args = parser.parse_args()
    if args.docx == MASTER: create_master()
    text,tokens = read_master(args.docx)
    markers = list(re.finditer(r'^Verse (\d+)\r?$',text,re.M))
    if [int(m[1]) for m in markers] != list(range(1,57)):
        raise ValueError('The editable document must retain the 56 consecutive Verse N headings.')
    output = ROOT/'exports';output.mkdir(exist_ok=True)
    manifest = []
    for count in (7,8):
        pages = [];titles = []
        for start in range(0,56,count):
            end = start+count
            body = render_range(tokens,0,markers[0].start()) if start == 0 else ''
            for i in range(start,end): body += render_verse(tokens,markers[i],markers[i+1].start() if i+1<56 else len(text))
            pages.append(body);titles.append(f'Verses {start+1}–{end}')
        stem = f'Devi-Kavacham-{len(pages)}-pages-{count}-verses'
        export_epub(output/(stem+'.epub'),pages,titles,text)
        print_html(output/(stem+'.html'),pages,titles)
        manifest.append({'html':str(output/(stem+'.html')),'pdf':str(output/(stem+'.pdf')),'pages':len(pages),'verses_per_page':count})
    # Preserve an exact text snapshot of the editable master for auditing exports.
    (output/'edited-text.txt').write_bytes(text.encode('utf-8'))
    original = SOURCE.read_bytes().decode('utf-8')
    print('DOCX text matches the original TXT exactly.' if text == original else 'The master contains text edits; exports reproduce the edited master. Original TXT is untouched.')
    print('Verified both EPUBs against the editable master, including whitespace.')
    if not args.no_pdf:
        node = shutil.which('node')
        if not node: raise RuntimeError('PDF export needs Node.js 22+ and Chrome. EPUBs and print HTML are already generated.')
        subprocess.run([node,str(ROOT/'export_pdfs.mjs'),json.dumps(manifest)],check=True)
    print('Exports written to',output)

if __name__ == '__main__': main()
