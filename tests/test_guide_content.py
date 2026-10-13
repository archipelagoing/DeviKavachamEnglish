"""Check that contextual deity links identify names rather than substrings."""
import json
from pathlib import Path
import unittest

from guide_content import entity_verses

ROOT = Path(__file__).resolve().parents[1]


class EntityLinkingTests(unittest.TestCase):
    def setUp(self):
        self.entities = json.loads((ROOT / 'content/navadurga.json').read_text())

    def test_links_to_the_supplied_hymn(self):
        matches = entity_verses((ROOT / 'Devi_Kavacham_English_Only.txt').read_text(), self.entities)
        self.assertEqual([matches[e['id']][0] for e in self.entities], [3, 3, 3, 3, 4, 4, 4, 4, 5])
        self.assertEqual(matches['kalaratri'], [4, 34])
        # Verse 51 names a class of spirits, not the Navadurga form.
        self.assertEqual(matches['kushmanda'], [3])

    def test_spelling_and_diacritic_variants(self):
        source = 'Verse 3\nSHAILAPUTRI, Brahmacharini, Chandraghanta, Kushmanda.\nVerse 4\nSkandamata, Katyayani, Kalratri, Mahagauri.\nVerse 5\nSiddhidhatri.'
        matches = entity_verses(source, self.entities)
        self.assertTrue(all(matches[e['id']] for e in self.entities))

    def test_do_not_match_longer_words_or_spirits(self):
        source = 'Verse 51\nKuṣmāṇḍas, NotShailaputri, Mahagaurish, and Kalaratrism.'
        matches = entity_verses(source, self.entities)
        self.assertTrue(all(not verses for verses in matches.values()))


if __name__ == '__main__':
    unittest.main()
