#!/usr/bin/env python3
"""Build the browser rules file and the JS parity fixtures."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

import lettris_engine as game  # noqa: E402

DICTIONARY_PATH = ROOT / "node_modules" / "an-array-of-english-words" / "index.json"
FREQUENCY_PATH = Path(__file__).resolve().parent / "data" / "en_frequency.txt"
THREE_LETTER_PATH = Path(__file__).resolve().parent / "data" / "three_letter.txt"
PLACES_SCRIPT = Path(__file__).resolve().parent / "load_places.mjs"
RULES_PATH = ROOT / "src" / "generated" / "rules.json"
FIXTURES_PATH = Path(__file__).resolve().parent / "fixtures" / "parity.json"


def load_dictionary():
    raw = json.loads(DICTIONARY_PATH.read_text(encoding="utf-8"))
    return [word.lower() for word in raw if isinstance(word, str)]


def load_places():
    """City and country names from the installed word-list packages."""
    raw = subprocess.check_output(
        ["node", str(PLACES_SCRIPT), str(game.MIN_CITY_POPULATION)],
        cwd=ROOT,
        text=True,
    )
    payload = json.loads(raw)
    return game.place_names(payload["cities"], payload["countries"])


def parity_cases(payload):
    """Cases the JS port must reproduce exactly."""
    difficulties = payload["difficulties"]
    words = set(payload["words"])
    cases = []

    def add(fn, expect, **fields):
        cases.append({"fn": fn, "expect": expect, **fields})

    for length, combo in (
        (3, 1), (3, 2), (3, 3), (3, 4), (3, 6),
        (4, 1), (5, 2), (8, 4),
    ):
        add("calculateScore", game.calculate_score(length, combo), length=length, combo=combo)

    for difficulty_id in game.DIFFICULTY_ORDER:
        difficulty = game.DIFFICULTIES[difficulty_id]
        for level in (1, 2, 5, 30):
            add(
                "fallInterval",
                game.fall_interval(level, difficulty),
                difficultyId=difficulty_id,
                level=level,
            )
        for found in (0, 1, 2, 3, 4, 8):
            add(
                "levelForWords",
                game.level_for_words(found, difficulty.words_per_level),
                difficultyId=difficulty_id,
                wordsFound=found,
            )

    # Dry window forces a vowel on easy. A vowel already in the window does not.
    add(
        "chooseLetter",
        game.choose_letter(["B", "C", "D"], game.DIFFICULTIES["easy"], 0.99),
        difficultyId="easy",
        recent=["B", "C", "D"],
        roll=0.99,
    )
    add(
        "chooseLetter",
        game.choose_letter(["E", "T", "A"], game.DIFFICULTIES["easy"], 0.99),
        difficultyId="easy",
        recent=["E", "T", "A"],
        roll=0.99,
    )
    add(
        "chooseLetter",
        game.choose_letter(["B", "C", "D"], game.DIFFICULTIES["hard"], 0),
        difficultyId="hard",
        recent=["B", "C", "D"],
        roll=0,
    )
    add(
        "chooseLetter",
        game.choose_letter([], game.DIFFICULTIES["medium"], 0.5),
        difficultyId="medium",
        recent=[],
        roll=0.5,
    )

    open_grid = [[None, None, None] for _ in range(4)]
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(open_grid, game.DIFFICULTIES["medium"], 0.5),
        difficultyId="medium",
        grid=open_grid,
        roll=0.5,
    )

    # Col 0 is full, col 1 can only hold a lock-in, col 2 has room to fall.
    tight = [
        ["A", None, None],
        ["B", "C", None],
        ["D", "E", None],
        ["F", "G", None],
    ]
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(tight, game.DIFFICULTIES["hard"], 0.9),
        difficultyId="hard",
        grid=tight,
        roll=0.9,
    )
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(tight, game.DIFFICULTIES["easy"], 0),
        difficultyId="easy",
        grid=tight,
        roll=0,
    )

    full = [["Z"] * 3 for _ in range(4)]
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(full, game.DIFFICULTIES["medium"], 0.2),
        difficultyId="medium",
        grid=full,
        roll=0.2,
    )

    # Two open columns. Bias changes which roll 0.6 selects.
    biased = [
        [None, None],
        [None, None],
        [None, "A"],
        [None, "B"],
    ]
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(biased, game.DIFFICULTIES["easy"], 0.6),
        difficultyId="easy",
        grid=biased,
        roll=0.6,
    )
    add(
        "chooseSpawnColumn",
        game.choose_spawn_column(biased, game.DIFFICULTIES["hard"], 0.6),
        difficultyId="hard",
        grid=biased,
        roll=0.6,
    )

    word_grid = [
        ["C", "A", "T"],
        ["C", None, None],
    ]
    add("findWordCells", game.find_word_cells("cat", word_grid), word="cat", grid=word_grid)
    add("findWordCells", game.find_word_cells("cc", word_grid), word="cc", grid=word_grid)
    add("findWordCells", game.find_word_cells("ccc", word_grid), word="ccc", grid=word_grid)
    add("findWordCells", game.find_word_cells("", word_grid), word="", grid=word_grid)

    holey = [
        ["A", None, {"letter": "e", "color": "#fff"}],
        [None, None, None],
        ["B", "c", None],
        [None, None, None],
    ]
    add("applyGravity", game.apply_gravity(holey), grid=holey)

    for word, difficulty_id in (
        ("cat", "easy"),
        ("cat", "hard"),
        ("stone", "hard"),
        ("the", "medium"),
        ("mom", "easy"),
        ("vein", "medium"),
        ("rome", "hard"),
        ("zzzzz", "easy"),
        ("no", "easy"),
        ("", "medium"),
    ):
        difficulty = game.DIFFICULTIES[difficulty_id]
        add(
            "isValidWord",
            game.is_valid_word(word, difficulty, words),
            word=word,
            difficultyId=difficulty_id,
        )

    # Touch the dumped difficulty table so a renamed field fails parity too.
    add("difficultyCount", len(difficulties), count=len(difficulties))

    for challenge_id in game.CHALLENGE_ORDER:
        challenge = game.CHALLENGES[challenge_id]
        add("challenge", challenge.as_json(), challengeId=challenge_id)
        for words_found, elapsed_ms, topped_out in (
            (0, 0, False),
            (10, 1000, False),
            (29, 50_000, False),
            (29, 50_000, True),
            (30, 50_000, False),
            (30, 50_000, True),
            (4, 179_999, False),
            (4, 180_000, False),
            (4, 40_000, True),
        ):
            add(
                "sessionResult",
                game.session_result(challenge, words_found, elapsed_ms, topped_out),
                challengeId=challenge_id,
                words=words_found,
                elapsedMs=elapsed_ms,
                toppedOut=topped_out,
            )
    return cases


def main():
    ranked = game.load_ranked_words(FREQUENCY_PATH)
    three_letter = [
        line.strip().lower()
        for line in THREE_LETTER_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    words = game.build_word_list(load_dictionary(), ranked, three_letter, load_places())
    payload = game.build_payload(words)
    RULES_PATH.parent.mkdir(parents=True, exist_ok=True)
    FIXTURES_PATH.parent.mkdir(parents=True, exist_ok=True)
    RULES_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    fixtures = parity_cases(payload)
    FIXTURES_PATH.write_text(json.dumps(fixtures, indent=2) + "\n", encoding="utf-8")
    print(f"words {len(words)}")
    for difficulty_id in game.DIFFICULTY_ORDER:
        spec = payload["difficulties"][difficulty_id]
        print(
            f"{difficulty_id}: {spec['minWordLength']}-{spec['maxWordLength']} letters, "
            f"{spec['startSpeed']}ms, bias {spec['columnBias']}"
        )
    print(f"wrote {RULES_PATH.relative_to(ROOT)}")
    print(f"wrote {FIXTURES_PATH.relative_to(ROOT)} ({len(fixtures)} cases)")


if __name__ == "__main__":
    main()
