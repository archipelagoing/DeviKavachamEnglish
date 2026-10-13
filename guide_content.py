"""Build reviewed deity cards and link names to the unchanged hymn.

Dictionary-based entity linking: normalize Unicode/diacritics, tokenize, and
match curated aliases to full tokens. This does not generate mythology or infer
that similarly named spirits are the same deity. No network/API is needed.
"""
import html
import json
import re
import unicodedata


def tokens(text):
    normalized = ''.join(c for c in unicodedata.normalize('NFKD', text.casefold()) if not unicodedata.combining(c))
    return re.findall(r'[^\W\d_]+', normalized)


def entity_verses(source, entities):
    headings = list(re.finditer(r'^Verse (\d+)\r?$', source, re.M))
    result = {entity['id']: [] for entity in entities}
    for i, heading in enumerate(headings):
        end = headings[i + 1].start() if i + 1 < len(headings) else len(source)
        words = tokens(source[heading.end():end])
        for entity in entities:
            for alias in entity['aliases']:
                name = tokens(alias)
                if any(words[j:j + len(name)] == name for j in range(len(words) - len(name) + 1)):
                    result[entity['id']].append(int(heading[1]))
                    break
    return result


def render_navadurga(root, source):
    entities = json.loads((root / 'content/navadurga.json').read_text(encoding='utf-8'))
    media = {image['id']: image for image in json.loads((root / 'assets/navadurga/media.json').read_text(encoding='utf-8'))}
    matches = entity_verses(source, entities)
    if len(entities) != 9 or len({e['id'] for e in entities}) != 9:
        raise ValueError('The Navadurga guide must contain nine distinct forms.')
    cards = []
    for order, entity in enumerate(entities, 1):
        image = media[entity['id']]
        if not (root / image['path']).is_file():
            raise ValueError(f'Missing Navadurga image: {image["path"]}')
        verses = matches[entity['id']]
        if not any(3 <= verse <= 5 for verse in verses):
            raise ValueError(f'No introductory verse found for {entity["name"]}. Check the source and aliases.')
        links = ' '.join(f'<a data-read href="index.html#verse-{verse}">{"Read" if i == 0 else "Also"} verse {verse} <span aria-hidden="true">↗</span></a>' for i, verse in enumerate(verses))
        e = {key: html.escape(str(value), quote=True) for key, value in entity.items() if isinstance(value, str)}
        m = {key: html.escape(str(value), quote=True) for key, value in image.items()}
        cards.append(f'''<article class="deity-card" id="{e['id']}" aria-labelledby="name-{e['id']}">
<header class="deity-heading"><p class="deity-number">{order:02d} / 09</p><h3 id="name-{e['id']}">{e['name']}</h3><p class="deity-meaning">{e['meaning']}</p></header>
<figure><img src="{m['path']}" alt="{e['alt']}" width="{m['width']}" height="{m['height']}" loading="lazy" decoding="async"><figcaption><a href="{m['source']}">{m['caption']}</a> {m['author']} · <a href="{m['license_url']}">{m['license']}</a>.</figcaption></figure>
<div class="deity-copy"><p>{e['story']}</p><nav class="deity-links" aria-label="More about {e['name']}">{links}<a href="{e['wikipedia']}">Read on Wikipedia <span aria-hidden="true">↗</span></a></nav></div>
</article>''')
    return '<div class="navadurga-cards">' + '\n'.join(cards) + '</div>'
