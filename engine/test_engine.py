#!/usr/bin/env python3
"""Rules tests. Run from the repo root: python3 engine/test_engine.py"""

from __future__ import annotations

import json
from datetime import date
import random
import sys
import unittest
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import lettris_engine as game  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
RULES_PATH = ROOT / "src" / "generated" / "rules.json"


def letters_of(word):
    return Counter(word.upper())


class ScoringTest(unittest.TestCase):
    def test_length_and_combo_use_integer_math(self):
        self.assertEqual(game.calculate_score(3, 1), 90)
        self.assertEqual(game.calculate_score(3, 2), 135)
        self.assertEqual(game.calculate_score(3, 3), 180)
        self.assertEqual(game.calculate_score(4, 4), 400)
        self.assertEqual(game.calculate_score(8, 6), 1600)
        self.assertEqual(game.calculate_score(5, 1, 1), 250)
        self.assertEqual(game.calculate_score(5, 1, 2), 500)
        self.assertEqual(game.calculate_score(5, 1, 3), 750)
        self.assertGreater(
            game.calculate_score(4, 1, game.DIFFICULTIES["hard"].score_multiplier),
            game.calculate_score(4, 1, game.DIFFICULTIES["easy"].score_multiplier),
        )
        self.assertEqual(game.calculate_score(3, 1, 1, 1), 90)
        self.assertEqual(game.calculate_score(3, 1, 1, 2), 45)
        self.assertEqual(game.calculate_score(3, 1, 1, 3), 22)
        self.assertEqual(game.calculate_score(3, 1, 1, 4), 22)
        self.assertEqual(game.calculate_score(4, 2, 2, 2), 240)

    def test_speed_ramps_and_then_holds(self):
        easy = game.DIFFICULTIES["easy"]
        self.assertEqual(game.fall_interval(1, easy), easy.start_speed)
        self.assertGreater(game.fall_interval(1, easy), game.fall_interval(1, game.DIFFICULTIES["medium"]))
        self.assertGreater(
            game.fall_interval(1, game.DIFFICULTIES["medium"]),
            game.fall_interval(1, game.DIFFICULTIES["hard"]),
        )
        self.assertEqual(game.fall_interval(99, easy), easy.min_speed)

    def test_level_tracks_words_cleared(self):
        self.assertEqual(game.level_for_words(0, 3), 1)
        self.assertEqual(game.level_for_words(2, 3), 1)
        self.assertEqual(game.level_for_words(3, 3), 2)
        self.assertEqual(game.level_for_words(4, 4), 2)


class BoardTest(unittest.TestCase):
    def test_gravity_closes_holes_without_reordering(self):
        grid = [
            ["A", None],
            [None, {"letter": "e", "color": "#fff"}],
            ["B", None],
            [None, "c"],
        ]
        settled = game.apply_gravity(grid)
        self.assertEqual([row[0] for row in settled], [None, None, "A", "B"])
        self.assertEqual(settled[2][1], {"letter": "e", "color": "#fff"})
        self.assertEqual(settled[3][1], "c")

    def test_word_cells_prefer_lower_rows_and_do_not_reuse(self):
        grid = [
            ["C", "A", "T"],
            ["C", None, None],
        ]
        self.assertEqual(
            game.find_word_cells("cat", grid),
            [{"row": 1, "col": 0}, {"row": 0, "col": 1}, {"row": 0, "col": 2}],
        )
        self.assertEqual(
            game.find_word_cells("CC", grid),
            [{"row": 1, "col": 0}, {"row": 0, "col": 0}],
        )
        self.assertIsNone(game.find_word_cells("ccc", grid))
        self.assertIsNone(game.find_word_cells("dog", grid))

    def test_spawn_skips_a_full_column_and_a_one_cell_trap(self):
        grid = [
            ["A", None, None],
            ["B", "C", None],
            ["D", "E", None],
            ["F", "G", None],
        ]
        for difficulty_id in game.DIFFICULTY_ORDER:
            column = game.choose_spawn_column(grid, game.DIFFICULTIES[difficulty_id], 0.9)
            self.assertEqual(column, 2)

    def test_spawn_returns_none_only_when_the_board_is_blocked(self):
        full = [["Z", "Z"], ["Y", "Y"]]
        self.assertIsNone(game.choose_spawn_column(full, game.DIFFICULTIES["medium"], 0.2))
        almost = [["Z", None], ["Y", "Y"]]
        self.assertEqual(
            game.choose_spawn_column(almost, game.DIFFICULTIES["hard"], 0),
            1,
        )

    def test_easy_prefers_the_emptier_column(self):
        # Col 0 has 4 empty cells, col 1 has 2. Both can accept a fall.
        grid = [
            [None, None],
            [None, None],
            [None, "A"],
            [None, "B"],
        ]
        easy = game.DIFFICULTIES["easy"]
        hard = game.DIFFICULTIES["hard"]
        # roll 0.6 lands in the second half, so a fair coin picks column 1.
        # Easy weights the open column 16-to-4, so the same roll stays on column 0.
        self.assertEqual(game.choose_spawn_column(grid, hard, 0.6), 1)
        self.assertEqual(game.choose_spawn_column(grid, easy, 0.6), 0)

    def test_dry_window_deals_a_vowel_on_easy_only(self):
        dry = ["B", "C", "D"]
        self.assertIn(game.choose_letter(dry, game.DIFFICULTIES["easy"], 0.99), game.VOWELS)
        # Hard's window is 6, so three consonants are still a normal deal.
        self.assertEqual(game.choose_letter(dry, game.DIFFICULTIES["hard"], 0), "E")
        self.assertNotIn(
            game.choose_letter(["E", "T", "A"], game.DIFFICULTIES["easy"], 0.99),
            game.VOWELS,
        )

    def test_a_clear_deals_toward_a_different_word(self):
        easy = game.DIFFICULTIES["easy"]
        medium = game.DIFFICULTIES["medium"]
        hard = game.DIFFICULTIES["hard"]
        words = ["cat", "car", "cart", "cast", "coat", "cats", "card", "dogs", "carts", "stone"]
        common = set(words)
        # Clearing cat raises the extra letter of cart, cast, coat, and cats.
        self.assertEqual(game.branch_letters("", "CAT", easy, words, common), "sor")
        # Letters still on the board win. T would rebuild cat, so it stays put.
        self.assertEqual(game.branch_letters("ca", "cat", easy, words, common), "r")
        # D is in the cleared word, so card does not ask for another D.
        self.assertEqual(game.branch_letters("car", "dog", easy, words, common), "t")
        self.assertNotIn("s", game.branch_letters("car", "dog", easy, words, common))
        # Easy stays on short common words. Hard and medium can open a longer one.
        longer = ["carts", "stone"]
        self.assertEqual(game.branch_letters("cart", "drum", easy, longer, set(longer)), "")
        self.assertEqual(game.branch_letters("cart", "drum", hard, longer, set(longer)), "s")
        self.assertEqual(game.branch_letters("ston", "drum", easy, longer, set(longer)), "")
        self.assertEqual(game.branch_letters("ston", "drum", medium, longer, set(longer)), "e")
        self.assertEqual(game.branch_letters("", "cat", easy, ["cat", "cart"], {"cat"}), "")
        roll = 62 / 115
        self.assertEqual(game.choose_letter([], medium, roll), "R")
        self.assertEqual(game.choose_letter([], medium, roll, branch="s"), "S")
        self.assertIn(
            game.choose_letter(["B", "C", "D"], easy, 0.99, branch="rst"),
            game.VOWELS,
        )


class DictionaryTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        payload = json.loads(RULES_PATH.read_text(encoding="utf-8"))
        cls.payload = payload
        cls.words = set(payload["words"])

    def test_generated_rules_match_the_engine(self):
        self.assertEqual(self.payload["rows"], game.ROWS)
        self.assertEqual(self.payload["cols"], game.COLS)
        self.assertEqual(self.payload["order"], list(game.DIFFICULTY_ORDER))
        self.assertEqual(len(self.payload["dailyWords"]), game.DAILY_POOL_SIZE)
        self.assertEqual(self.payload["branchDrops"], game.BRANCH_DROPS)
        self.assertEqual(self.payload["difficulties"]["easy"]["branchMinLength"], 3)
        self.assertEqual(self.payload["difficulties"]["easy"]["branchMaxLength"], 4)
        self.assertEqual(self.payload["difficulties"]["hard"]["branchMinLength"], 5)
        self.assertTrue(self.payload["commonWords"])
        opened = game.branch_letters("", "cat", game.DIFFICULTIES["easy"], self.words, set(self.payload["commonWords"]))
        self.assertGreaterEqual(len(opened), 1)
        self.assertLessEqual(len(opened), game.BRANCH_LETTER_LIMIT)
        self.assertTrue(set(opened).isdisjoint("cat"))
        self.assertTrue(all(len(word) == 4 and word in self.words for word in self.payload["dailyWords"]))
        self.assertEqual(
            game.daily_word(self.payload["dailyWords"], 2026, 10, 31),
            self.payload["dailyWords"][date(2026, 10, 31).toordinal() % game.DAILY_POOL_SIZE],
        )
        for difficulty_id in game.DIFFICULTY_ORDER:
            self.assertEqual(
                self.payload["difficulties"][difficulty_id],
                game.DIFFICULTIES[difficulty_id].as_json(),
            )

    def test_word_list_accepts_real_words_and_places(self):
        self.assertGreater(len(self.words), 90_000)
        self.assertLess(len(self.words), 500_000)
        for word in ("cat", "stone", "the", "letter", "queue", "quiz", "mom", "mum", "vein", "rome", "italy", "gin", "cue", "did", "git", "zen", "soy", "veg", "dont", "doesnt", "monday", "saturday", "wednesday", "september"):
            self.assertIn(word, self.words)
        for word in ("nth", "aah", "aahed", "john", "gonna", "cuz", "lol", "dvd", "gues", "bein", "alway", "empt"):
            self.assertNotIn(word, self.words)
        for word in ("guest", "guess", "hell", "boar", "forgo", "vein"):
            self.assertIn(word, self.words)
        self.assertTrue(all(game.usable_word(word) for word in self.words))

    def test_contractions_clear_as_letters(self):
        words = set(game.build_word_list(["stone", "gin", "cat"], [], ["cat", "gin"]))
        self.assertIn("gin", words)
        self.assertIn("dont", words)
        self.assertIn("doesnt", words)
        self.assertIn("monday", words)
        self.assertIn("wednesday", words)
        self.assertIn("zen", words)
        self.assertNotIn("don't", words)
        self.assertNotIn("lol", words)

    def test_hard_rejects_three_letter_words(self):
        words = self.words
        self.assertTrue(game.is_valid_word("cat", game.DIFFICULTIES["easy"], words))
        self.assertTrue(game.is_valid_word("cat", game.DIFFICULTIES["medium"], words))
        self.assertFalse(game.is_valid_word("cat", game.DIFFICULTIES["hard"], words))
        self.assertFalse(game.is_valid_word("the", game.DIFFICULTIES["hard"], words))
        self.assertTrue(game.is_valid_word("stone", game.DIFFICULTIES["hard"], words))
        self.assertTrue(game.is_valid_word("gin", game.DIFFICULTIES["easy"], words))
        self.assertTrue(game.is_valid_word("gin", game.DIFFICULTIES["medium"], words))
        self.assertFalse(game.is_valid_word("gin", game.DIFFICULTIES["hard"], words))
        self.assertTrue(game.is_valid_word("dont", game.DIFFICULTIES["hard"], words))
        self.assertFalse(game.is_valid_word("no", game.DIFFICULTIES["easy"], words))
        self.assertFalse(game.is_valid_word("notaword", game.DIFFICULTIES["medium"], words))

    def test_deals_stay_spellable(self):
        words = [word.upper() for word in self.words]
        four_letter = [word for word in words if len(word) >= 4]

        def spellable(dealt, bank):
            available = Counter(dealt)
            for word in bank:
                needed = letters_of(word)
                if all(available[letter] >= count for letter, count in needed.items()):
                    return True
            return False

        def trial(difficulty, count, bank, seed):
            rng = random.Random(seed)
            hits = 0
            for _ in range(count):
                recent = []
                dealt = []
                for _step in range(20):
                    letter = game.choose_letter(recent, difficulty, rng.random())
                    recent.append(letter)
                    dealt.append(letter)
                if spellable(dealt, bank):
                    hits += 1
            return hits

        easy_hits = trial(game.DIFFICULTIES["easy"], 30, words, 1)
        hard_hits = trial(game.DIFFICULTIES["hard"], 30, four_letter, 2)
        self.assertGreaterEqual(easy_hits, 27)
        self.assertGreaterEqual(hard_hits, 12)


class PlaceNameTest(unittest.TestCase):
    def test_places_stay_one_word(self):
        self.assertEqual(game.plain_place_name("Rome"), "rome")
        self.assertEqual(game.plain_place_name("Malmö"), "malmo")
        self.assertIsNone(game.plain_place_name("New York"))
        self.assertIsNone(game.plain_place_name("São Paulo"))
        self.assertEqual(game.plain_place_name("Afghanistan"), "afghanistan")


class ChallengeTest(unittest.TestCase):
    def test_challenges_keep_their_goals(self):
        self.assertEqual(game.CHALLENGE_ORDER, ("survival", "words", "timed", "daily"))
        self.assertEqual(game.CHALLENGES["words"].target_words, 60)
        self.assertEqual(game.CHALLENGES["words"].rank_by, "scoreTime")
        self.assertEqual(game.CHALLENGES["timed"].limit_ms, 180_000)
        self.assertEqual(game.CHALLENGES["timed"].rank_by, "score")
        self.assertEqual(game.CHALLENGES["survival"].rank_by, "score")
        self.assertEqual(game.CHALLENGES["survival"].locked_difficulty, "easy")
        self.assertTrue(game.CHALLENGES["survival"].hide_difficulty)
        self.assertEqual(game.CHALLENGES["survival"].word_gates, ((5, 4), (10, 5)))
        daily = game.CHALLENGES["daily"]
        self.assertEqual(daily.limit_ms, 180_000)
        self.assertEqual(daily.rank_by, "collects")
        self.assertEqual(daily.locked_difficulty, "medium")
        self.assertEqual(date(1970, 1, 1).toordinal(), game.UNIX_EPOCH_ORDINAL)

    def test_survival_speeds_up_faster_and_asks_for_longer_words(self):
        survival = game.CHALLENGES["survival"]
        easy = game.DIFFICULTIES["easy"]
        self.assertLess(game.fall_interval(1, easy, survival), game.fall_interval(1, easy))
        self.assertLess(game.fall_interval(15, easy, survival), game.fall_interval(1, easy, survival))
        self.assertLess(game.fall_interval(15, easy, survival), game.fall_interval(15, easy))
        self.assertEqual(game.min_word_length(easy, 4, survival), 3)
        self.assertEqual(game.min_word_length(easy, 5, survival), 4)
        self.assertEqual(game.min_word_length(easy, 9, survival), 4)
        self.assertEqual(game.min_word_length(easy, 10, survival), 5)
        self.assertTrue(game.is_valid_word("cat", easy, {"cat"}, 3))
        self.assertFalse(game.is_valid_word("cat", easy, {"cat"}, 4))
        self.assertFalse(game.is_valid_word("cats", easy, {"cats"}, 5))
        self.assertTrue(game.is_valid_word("stone", easy, {"stone"}, 5))

    def test_survival_ends_only_when_the_board_fills(self):
        survival = game.CHALLENGES["survival"]
        playing = game.session_result(survival, 40, 999_999, False)
        self.assertFalse(playing["over"])
        ended = game.session_result(survival, 40, 999_999, True)
        self.assertEqual(ended["reason"], "topout")
        self.assertTrue(ended["ranks"])
        self.assertFalse(ended["cleared"])

    def test_sixty_words_ranks_only_a_finished_clear(self):
        words = game.CHALLENGES["words"]
        self.assertFalse(game.session_result(words, 59, 50_000, False)["over"])
        missed = game.session_result(words, 59, 50_000, True)
        self.assertEqual(missed["reason"], "topout")
        self.assertFalse(missed["ranks"])
        cleared = game.session_result(words, 60, 50_000, True)
        self.assertEqual(cleared["reason"], "target")
        self.assertTrue(cleared["cleared"])
        self.assertTrue(cleared["ranks"])

    def test_three_minutes_ranks_the_score_even_if_the_board_fills(self):
        timed = game.CHALLENGES["timed"]
        self.assertFalse(game.session_result(timed, 10, 179_999, False)["over"])
        done = game.session_result(timed, 10, 180_000, False)
        self.assertEqual(done["reason"], "time")
        self.assertTrue(done["cleared"])
        self.assertTrue(done["ranks"])
        early = game.session_result(timed, 4, 40_000, True)
        self.assertEqual(early["reason"], "topout")
        self.assertFalse(early["cleared"])
        self.assertTrue(early["ranks"])

    def test_daily_word_is_stable_and_the_run_ranks_by_collects(self):
        pool = ["able", "bake", "cake", "date"]
        self.assertEqual(game.daily_word(pool, 2026, 10, 31), game.daily_word(pool, 2026, 10, 31))
        self.assertNotEqual(game.daily_word(pool, 2026, 10, 31), game.daily_word(pool, 2026, 11, 1))
        seed = game.daily_seed(2026, 10, 31)
        self.assertEqual(seed, game.daily_seed(2026, 10, 31))
        self.assertNotEqual(seed, game.daily_seed(2026, 11, 1))
        first = [game.create_rolls(seed)() for _ in range(1)]
        again = game.create_rolls(seed)()
        self.assertEqual(first[0], again)
        daily = game.CHALLENGES["daily"]
        self.assertFalse(game.session_result(daily, 3, 179_999, False)["over"])
        done = game.session_result(daily, 3, 180_000, False)
        self.assertEqual(done["reason"], "time")
        self.assertTrue(done["ranks"])
        early = game.session_result(daily, 1, 20_000, True)
        self.assertEqual(early["reason"], "topout")
        self.assertTrue(early["ranks"])

    def test_daily_deals_todays_letters_at_the_same_weight(self):
        medium = game.DIFFICULTIES["medium"]
        rolls = [index / 400 for index in range(400)]
        plain = Counter(game.choose_letter([], medium, roll) for roll in rolls)
        favored = Counter(game.choose_letter([], medium, roll, "mode") for roll in rolls)
        counts = [favored[letter] for letter in "MODE"]
        self.assertLessEqual(max(counts) - min(counts), 2)
        self.assertGreater(favored["D"], plain["D"] * 2)
        outside = sum(count for letter, count in favored.items() if letter not in "MODE")
        self.assertGreater(outside, 0)
        doubled = Counter(game.choose_letter([], medium, roll, "book") for roll in rolls)
        self.assertGreater(doubled["O"], doubled["B"])


if __name__ == "__main__":
    unittest.main()
