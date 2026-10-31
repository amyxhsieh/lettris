"""Lettris rules.

This module is the source of truth for dictionary quality, difficulty,
letter deals, spawning, word clears, and scoring. The browser plays a
checked port of these functions (src/utils/engine.js).
"""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from datetime import date


ROWS = 13
COLS = 8
VOWELS = frozenset("AEIOU")
FREQUENCY_CUTOFF = 10000
# Cities below this are small enough that a random letter run should not clear them.
MIN_CITY_POPULATION = 100_000
# One common 4-letter word per calendar day, then the list repeats.
DAILY_POOL_SIZE = 366
# Each letter in today's word is raised to this weight, once per copy in the word.
# A light letter such as D is then dealt as often as E. The rest of the bag stays.
DAILY_LETTER_WEIGHT = 16
# After a clear, the next few drops lean toward a different word.
# The bonus is added on top of the difficulty bag, and only to letters that bag can deal.
BRANCH_DROPS = 6
BRANCH_LETTER_LIMIT = 3
BRANCH_BONUS = 6
# Python date.toordinal() for 1970-01-01. The browser adds this to UTC day counts.
UNIX_EPOCH_ORDINAL = 719163

# Common three-letter words the dictionary leaves out. Codes such as "dvd" stay out.
SHORT_WORDS = frozenset({
    "zen", "dna", "eww",
})

# Day and month names the dictionary leaves out.
CALENDAR_WORDS = frozenset({
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "january", "february", "april", "june", "july", "september", "october", "december",
})

# The board has no apostrophe, so a contraction clears as its letters.
# "don't" is typed DONT. Forms that are already dictionary words are included
# again on purpose; take() keeps one copy.
CONTRACTIONS = frozenset({
    "dont", "doesnt", "didnt", "isnt", "arent", "wasnt", "werent",
    "hasnt", "havent", "hadnt", "couldnt", "wouldnt", "shouldnt", "mustnt",
    "cant", "wont", "lets", "thats", "whats", "theres", "theyre", "youre",
    "heres", "wheres", "hows", "shes", "hes", "its",
    "ive", "youve", "weve", "theyve", "youd", "theyd", "youll", "theyll",
    "oclock", "yall", "aint",
})

# Chopped-off common words. "gues" is not a word; "guest" and "guess" are.
# A real word that happens to begin another word (hell, boar, forgo) stays out of this set.
FRAGMENT_WORDS = frozenset({
    "aahed", "aahing", "aahs",
    "actin", "agen", "alway", "anyon", "artis",
    "beaut", "bein", "borde", "boun", "brin",
    "carbo", "carr", "chang", "commo", "cour", "cours", "crim", "cuzzes", "cuzzie",
    "delt", "deman",
    "empt",
    "femal", "fille", "finis", "fores", "forme",
    "gamin", "goog", "gree", "guar", "gues", "guid",
    "heigh", "hond", "hors", "hote", "huma",
    "kell", "kerne", "kore",
    "lase", "lati", "lear", "leve", "loca", "longe", "lowe", "lowes",
    "menta", "metho", "mille", "mino", "moder", "mous",
    "neve", "norma",
    "orang",
    "pape", "phon", "phot", "pian", "pleas", "porta", "proo", "puls",
    "rais", "rathe", "regar", "relie", "revie",
    "sain", "sant", "savin", "scop", "selle", "sens", "shir", "signa", "slee", "smit", "smoot", "soli", "sout", "supe", "swee",
    "takin", "teste", "thir", "trave", "trie",
    "unde",
    "vali",
    "wast", "wate", "whee",
})

# Spoken fillers and given names that ride along in frequency lists.
# Real words that are also names (mark, rose, grace, march) stay out of this set.
BLOCKED_WORDS = frozenset({
    "yeah", "okay", "gonna", "wanna", "kinda", "gotta",
    "john", "mary", "jane", "mike", "paul", "anna", "eric", "emma", "jake",
    "luke", "jean", "carl", "chad", "brad", "craig", "cole", "jesus", "james",
    "henry", "peter", "laura", "kelly", "nancy", "betty", "donna", "carol",
    "maria", "jimmy", "bobby", "johnny",
})

# English-like bags. Easy leans on letters that start common words.
# Hard flattens the bag so Q, J, X, and Z show up often enough to matter.
EASY_WEIGHTS = (
    ("E", 18), ("A", 12), ("O", 10), ("I", 10), ("U", 5),
    ("T", 8), ("N", 7), ("S", 6), ("R", 6), ("H", 5),
    ("L", 5), ("D", 4), ("C", 3), ("M", 3), ("Y", 3),
    ("F", 2), ("G", 2), ("P", 2), ("B", 2), ("W", 2),
    ("K", 1), ("V", 1),
)
MEDIUM_WEIGHTS = (
    ("E", 12), ("A", 8), ("O", 8), ("I", 7), ("U", 4),
    ("T", 9), ("N", 7), ("S", 6), ("R", 6), ("H", 6),
    ("L", 4), ("D", 4), ("C", 4), ("M", 4), ("Y", 3),
    ("F", 3), ("G", 3), ("P", 3), ("B", 3), ("W", 3),
    ("K", 2), ("V", 2), ("J", 1), ("X", 1), ("Q", 1), ("Z", 1),
)
HARD_WEIGHTS = (
    ("E", 6), ("A", 5), ("O", 5), ("I", 5), ("U", 4),
    ("T", 5), ("N", 5), ("S", 4), ("R", 4), ("H", 4),
    ("L", 4), ("D", 4), ("C", 4), ("M", 3), ("Y", 3),
    ("F", 3), ("G", 3), ("P", 3), ("B", 3), ("W", 3),
    ("K", 3), ("V", 3), ("J", 3), ("X", 2), ("Q", 2), ("Z", 2),
)


@dataclass(frozen=True)
class Difficulty:
    id: str
    label: str
    tagline: str
    min_word_length: int
    max_word_length: int
    start_speed: int
    min_speed: int
    speed_step: int
    words_per_level: int
    combo_window_ms: int
    vowel_window: int
    min_vowels_in_window: int
    column_bias: int
    score_multiplier: int
    letter_weights: tuple
    branch_min_length: int
    branch_max_length: int
    branch_common: bool

    def as_json(self):
        return {
            "id": self.id,
            "label": self.label,
            "tagline": self.tagline,
            "minWordLength": self.min_word_length,
            "maxWordLength": self.max_word_length,
            "startSpeed": self.start_speed,
            "minSpeed": self.min_speed,
            "speedStep": self.speed_step,
            "wordsPerLevel": self.words_per_level,
            "comboWindowMs": self.combo_window_ms,
            "vowelWindow": self.vowel_window,
            "minVowelsInWindow": self.min_vowels_in_window,
            "columnBias": self.column_bias,
            "scoreMultiplier": self.score_multiplier,
            "letterWeights": [list(pair) for pair in self.letter_weights],
            "branchMinLength": self.branch_min_length,
            "branchMaxLength": self.branch_max_length,
            "branchCommon": self.branch_common,
        }


DIFFICULTIES = {
    "easy": Difficulty(
        id="easy",
        label="EASY",
        tagline="Slow drops, common letters, 3-letter words",
        min_word_length=3,
        max_word_length=ROWS * COLS,
        start_speed=620,
        min_speed=360,
        speed_step=20,
        words_per_level=4,
        combo_window_ms=7000,
        vowel_window=3,
        min_vowels_in_window=1,
        column_bias=2,
        score_multiplier=1,
        letter_weights=EASY_WEIGHTS,
        branch_min_length=3,
        branch_max_length=4,
        branch_common=True,
    ),
    "medium": Difficulty(
        id="medium",
        label="MEDIUM",
        tagline="The regular pace, with a normal letter mix",
        min_word_length=3,
        max_word_length=ROWS * COLS,
        start_speed=320,
        min_speed=150,
        speed_step=30,
        words_per_level=3,
        combo_window_ms=5000,
        vowel_window=4,
        min_vowels_in_window=1,
        column_bias=1,
        score_multiplier=2,
        letter_weights=MEDIUM_WEIGHTS,
        branch_min_length=3,
        branch_max_length=6,
        branch_common=True,
    ),
    "hard": Difficulty(
        id="hard",
        label="HARD",
        tagline="Rarer letters, words from 4 letters",
        min_word_length=4,
        max_word_length=ROWS * COLS,
        start_speed=300,
        min_speed=140,
        speed_step=16,
        words_per_level=2,
        combo_window_ms=2800,
        vowel_window=6,
        min_vowels_in_window=1,
        column_bias=1,
        score_multiplier=3,
        letter_weights=HARD_WEIGHTS,
        branch_min_length=5,
        branch_max_length=8,
        branch_common=True,
    ),
}

DIFFICULTY_ORDER = ("easy", "medium", "hard")


@dataclass(frozen=True)
class Challenge:
    id: str
    label: str
    tagline: str
    goal: str
    target_words: int | None
    limit_ms: int | None
    rank_by: str
    locked_difficulty: str | None = None

    def as_json(self):
        return {
            "id": self.id,
            "label": self.label,
            "tagline": self.tagline,
            "goal": self.goal,
            "targetWords": self.target_words,
            "limitMs": self.limit_ms,
            "rankBy": self.rank_by,
            "lockedDifficulty": self.locked_difficulty,
        }


# Difficulty is how letters fall. A challenge is how the run ends.
CHALLENGES = {
    "survival": Challenge(
        id="survival",
        label="SURVIVAL",
        tagline="Play until the board fills",
        goal="survival",
        target_words=None,
        limit_ms=None,
        rank_by="score",
    ),
    "words": Challenge(
        id="words",
        label="50 WORDS",
        tagline="Clear 50 words for the highest score",
        goal="words",
        target_words=50,
        limit_ms=None,
        rank_by="score",
    ),
    "timed": Challenge(
        id="timed",
        label="3 MINUTES",
        tagline="Score as much as you can before the clock ends",
        goal="time",
        target_words=None,
        limit_ms=180_000,
        rank_by="score",
    ),
    "daily": Challenge(
        id="daily",
        label="DAILY",
        tagline="Clear today's word the most times",
        goal="daily",
        target_words=None,
        limit_ms=180_000,
        rank_by="collects",
        locked_difficulty="medium",
    ),
}

CHALLENGE_ORDER = ("survival", "words", "timed", "daily")


def session_result(challenge, words, elapsed_ms, topped_out):
    """Whether this run is over, whether the goal was met, and why.

    `reason` is "topout", "target", "time", or None.
    A failed 50-word run stays off the board. A timed run that fills
    early still ranks, because that contest is the score. Daily ends the
    same way and ranks by how many times today's word was cleared.
    """
    if challenge.goal == "survival":
        if topped_out:
            return _result(True, False, "topout", True)
        return _result(False, False, None, False)

    if challenge.goal == "words":
        if words >= challenge.target_words:
            return _result(True, True, "target", True)
        if topped_out:
            return _result(True, False, "topout", False)
        return _result(False, False, None, False)

    if challenge.goal == "time" or challenge.goal == "daily":
        if elapsed_ms >= challenge.limit_ms:
            return _result(True, True, "time", True)
        if topped_out:
            return _result(True, False, "topout", True)
        return _result(False, False, None, False)

    raise ValueError(challenge.goal)


def _result(over, cleared, reason, ranks):
    return {"over": over, "cleared": cleared, "reason": reason, "ranks": ranks}


def _u32(value):
    return value & 0xFFFFFFFF


def _imul(left, right):
    """Low 32 bits of a 32-bit multiply. The bits match JavaScript Math.imul."""
    left = _u32(left)
    right = _u32(right)
    left_hi, left_lo = left >> 16, left & 0xFFFF
    right_hi, right_lo = right >> 16, right & 0xFFFF
    return _u32(left_lo * right_lo + _u32((left_hi * right_lo + left_lo * right_hi) << 16))


def create_rolls(seed):
    """Mulberry32. Each call is a float in [0, 1), the same stream in the browser.

    Daily deals letters from this stream so every player sees the same sequence.
    """
    state = _u32(seed)

    def roll():
        nonlocal state
        state = _u32(state + 0x6D2B79F5)
        mixed = _imul(state ^ (state >> 15), state | 1)
        mixed = _u32(mixed + _imul(mixed ^ (mixed >> 7), mixed | 61)) ^ mixed
        mixed = _u32(mixed ^ (mixed >> 14))
        return mixed / 4294967296

    return roll


def build_daily_pool(ranked, words, size=DAILY_POOL_SIZE):
    """Common 4-letter words in frequency order.

    A calendar day picks one entry. The pool stays in this order so the
    same date keeps the same word.
    """
    known = set(words)
    pool = []
    for word in ranked:
        if len(word) != 4 or word not in known:
            continue
        pool.append(word)
        if len(pool) == size:
            return pool
    raise ValueError("daily pool is short")


def daily_word(pool, year, month, day):
    if not pool:
        raise ValueError("empty daily pool")
    return pool[date(year, month, day).toordinal() % len(pool)]


def daily_seed(year, month, day):
    """FNV-1a of the UTC date. The letter stream for that day starts here."""
    text = f"{year:04d}-{month:02d}-{day:02d}"
    hash_value = 2166136261
    for character in text:
        hash_value ^= ord(character)
        hash_value = _u32(hash_value * 16777619)
    return hash_value


def weighted_pick(items, weights, roll):
    """Pick one item. `roll` is a float in [0, 1]."""
    if not items:
        raise ValueError("empty pool")
    total = sum(weights)
    if total <= 0:
        raise ValueError("weights must be positive")
    cursor = roll * total
    for item, weight in zip(items, weights):
        cursor -= weight
        if cursor <= 0:
            return item
    return items[-1]


def combo_parts(combo):
    """Multiplier as a reduced-enough fraction so scoring stays integral.

    1 → 1, 2 → 3/2, 3 → 2, 4+ → 5/2.
    """
    if combo >= 4:
        return 5, 2
    if combo == 3:
        return 2, 1
    if combo == 2:
        return 3, 2
    return 1, 1


def repeat_parts(times):
    """How many times this word has been cleared in the run.

    The first clear is full. The second is half. The third and after is a quarter.
    """
    if times <= 1:
        return 1, 1
    if times == 2:
        return 1, 2
    return 1, 4


def calculate_score(word_length, combo, multiplier=1, times=1):
    combo_numerator, combo_denominator = combo_parts(combo)
    repeat_numerator, repeat_denominator = repeat_parts(times)
    return (
        word_length * word_length * 10 * combo_numerator * multiplier * repeat_numerator
    ) // (combo_denominator * repeat_denominator)


def fall_interval(level, difficulty):
    raw = difficulty.start_speed - (level - 1) * difficulty.speed_step
    return max(difficulty.min_speed, raw)


def level_for_words(words_found, words_per_level):
    if words_per_level <= 0:
        raise ValueError("words_per_level")
    return words_found // words_per_level + 1


def cell_letter(cell):
    if cell is None:
        return None
    if isinstance(cell, str):
        return cell.upper() if cell else None
    if isinstance(cell, dict) and cell.get("letter"):
        return str(cell["letter"]).upper()
    return None


def apply_gravity(grid):
    """Drop every letter to the bottom of its column, preserving order."""
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    settled = [[None for _ in range(cols)] for _ in range(rows)]
    for col in range(cols):
        stack = [grid[row][col] for row in range(rows) if cell_letter(grid[row][col])]
        start = rows - len(stack)
        for index, cell in enumerate(stack):
            settled[start + index][col] = cell
    return settled


def column_room(grid, col):
    """Empty cells at the top of a column, before the first letter."""
    room = 0
    for row in range(len(grid)):
        if cell_letter(grid[row][col]) is None:
            room += 1
        else:
            break
    return room


def choose_spawn_column(grid, difficulty, roll):
    """Column for the next letter, or None when every column is blocked.

    A column with only the top cell free would lock on the next tick.
    Those columns are used only when nowhere else can accept a falling letter.
    """
    rooms = [column_room(grid, col) for col in range(len(grid[0]))]
    comfortable = [col for col, room in enumerate(rooms) if room >= 2]
    candidates = comfortable or [col for col, room in enumerate(rooms) if room >= 1]
    if not candidates:
        return None
    if difficulty.column_bias <= 1:
        weights = [1] * len(candidates)
    else:
        weights = [rooms[col] ** difficulty.column_bias for col in candidates]
    return weighted_pick(candidates, weights, roll)


def choose_letter(recent, difficulty, roll, favored="", branch=""):
    """Next letter. Forces a vowel when the recent window is too dry.

    `favored` is today's word on a daily run. Each of its letters is
    raised to the same weight, once per copy, so a light letter is dealt
    as often as a common one. Letters outside the word keep their weights.
    `branch` is the missing letters of a different word. Each one gets a
    small bonus for the next few drops. The vowel rescue still wins.
    """
    history = [letter.upper() for letter in recent]
    window = history[-difficulty.vowel_window :]
    vowel_count = sum(1 for letter in window if letter in VOWELS)
    pool = difficulty.letter_weights
    if (
        difficulty.min_vowels_in_window > 0
        and len(history) >= difficulty.vowel_window
        and vowel_count < difficulty.min_vowels_in_window
    ):
        pool = tuple(pair for pair in pool if pair[0] in VOWELS)
    counts = {}
    for letter in favored.upper():
        if letter.isalpha():
            counts[letter] = counts.get(letter, 0) + 1
    boost = {letter.upper() for letter in branch if letter.isalpha()}
    items = [letter for letter, _weight in pool]
    weights = []
    for letter, weight in pool:
        if letter in boost:
            weight += BRANCH_BONUS
        copies = counts.get(letter, 0)
        if copies:
            weight = max(weight, DAILY_LETTER_WEIGHT * copies)
        weights.append(weight)
    return weighted_pick(items, weights, roll)


def _letter_counts(text):
    counts = [0] * 26
    for character in text or "":
        letter = character.lower()
        if "a" <= letter <= "z":
            counts[ord(letter) - 97] += 1
    return counts


def _one_short(word, have):
    """The single letter `word` still needs, or None."""
    need = [0] * 26
    for character in word:
        need[ord(character) - 97] += 1
    missing = None
    extra = 0
    for index, count in enumerate(need):
        if count > have[index]:
            extra += count - have[index]
            if extra > 1:
                return None
            missing = index
    if extra != 1:
        return None
    return chr(ord("a") + missing)


def _branch_hits(words, have, blocked, bag, difficulty, common, cleared, exact_length=None):
    hits = {}
    minimum = difficulty.branch_min_length
    maximum = difficulty.branch_max_length
    for word in words:
        length = len(word)
        if length < minimum or length > maximum or word == cleared:
            continue
        if exact_length is not None and length != exact_length:
            continue
        if difficulty.branch_common and common is not None and word not in common:
            continue
        missing = _one_short(word, have)
        if missing is None or missing in blocked or missing not in bag:
            continue
        hits[missing] = hits.get(missing, 0) + 1
    return hits


def _pick_branch(hits):
    ranked = sorted(hits, key=lambda letter: (-hits[letter], letter))
    return "".join(ranked[:BRANCH_LETTER_LIMIT])


def branch_letters(board_letters, cleared, difficulty, words, common=None):
    """Letters that finish a different word from the one just cleared.

    A candidate word already has every letter but one on the board. That
    missing letter is raised. Letters of the cleared word stay put, so the
    same word is not rebuilt. When the board is one letter from nothing,
    the cleared word itself is extended by one new letter.
    """
    cleared = "".join(character for character in str(cleared or "").lower() if "a" <= character <= "z")
    blocked = set(cleared)
    bag = {letter.lower() for letter, _weight in difficulty.letter_weights}
    hits = _branch_hits(
        words,
        _letter_counts(board_letters),
        blocked,
        bag,
        difficulty,
        common,
        cleared,
    )
    if hits:
        return _pick_branch(hits)
    if not cleared:
        return ""
    # One added letter, and every letter of the cleared word stays in it.
    return _pick_branch(_branch_hits(
        words,
        _letter_counts(cleared),
        blocked,
        bag,
        difficulty,
        common,
        cleared,
        len(cleared) + 1,
    ))


def common_branch_words(ranked, words, cutoff=FREQUENCY_CUTOFF):
    """Common words the branch can aim at, in frequency order."""
    known = set(words)
    return [
        word for word in ranked[:cutoff]
        if 3 <= len(word) <= 8 and word in known
    ]


def find_word_cells(word, grid):
    """Cells that spell `word`, or None.

    Each cell is used once. Lower rows are taken first, and within a row
    the leftmost cell is taken first, so clears pull from the stack bottom.
    """
    if not word:
        return None
    needed = [letter.upper() for letter in word]
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    available = []
    for row in range(rows - 1, -1, -1):
        for col in range(cols):
            letter = cell_letter(grid[row][col])
            if letter:
                available.append((letter, row, col))

    used = set()
    cells = []
    for letter in needed:
        found = None
        for index, (candidate, row, col) in enumerate(available):
            if index in used or candidate != letter:
                continue
            found = index
            cells.append({"row": row, "col": col})
            break
        if found is None:
            return None
        used.add(found)
    return cells


def is_valid_word(word, difficulty, words):
    if not isinstance(word, str) or not word.isalpha():
        return False
    normalized = word.lower()
    if not (difficulty.min_word_length <= len(normalized) <= difficulty.max_word_length):
        return False
    return normalized in words


def usable_word(word):
    """Structural filter shared by every difficulty."""
    if not word.isalpha() or not word.islower():
        return False
    if len(word) < 3 or len(word) > ROWS * COLS:
        return False
    if not any(character in "aeiouy" for character in word):
        return False
    return not any(word[index] == word[index + 1] == word[index + 2] for index in range(len(word) - 2))


def plain_place_name(name):
    """A place clears only as one word of at least 3 letters.

    "Rome" and "Malmö" pass. "New York" and "São Paulo" do not, because a
    clear is letters with no space. Accents fold to ASCII.
    """
    if not isinstance(name, str):
        return None
    if any(character.isspace() or character in "-'’." for character in name):
        return None
    folded = unicodedata.normalize("NFKD", name)
    folded = "".join(character for character in folded if not unicodedata.combining(character))
    folded = folded.lower()
    if folded.isalpha() and 3 <= len(folded) <= ROWS * COLS:
        return folded
    return None


def place_names(cities, countries):
    names = []
    for name in list(cities) + list(countries):
        token = plain_place_name(name)
        if token:
            names.append(token)
    return names


def build_word_list(dictionary, ranked, three_letter, places=(), cutoff=FREQUENCY_CUTOFF):
    """Words a player can clear.

    Words of four letters or more come from the English dictionary, so an
    uncommon word like "vein" still clears. There is no shorter cap than the
    board itself. A chopped piece of a longer word does not, so "gues" stays
    out while "guest" and "guess" clear. Three-letter words stay on the curated
    list, plus common dictionary words such as "mom" when the frequency list
    also contains them.
    A few common short words the dictionary omits, such as "zen", are added too.
    That leaves codes such as "dvd" out. Contractions join as letters only,
    so "don't" clears as "dont". Day and month names the dictionary omits
    are added too. Place names arrive separately, already limited to one word.
    """
    known = {entry.lower() for entry in dictionary if isinstance(entry, str) and entry.isalpha()}
    common = {word.lower() for word in ranked[:cutoff]}
    chosen = set()

    def take(word):
        if word in BLOCKED_WORDS or word in FRAGMENT_WORDS or not usable_word(word):
            return
        chosen.add(word)

    for word in three_letter:
        word = word.lower()
        if len(word) == 3 and word in known:
            take(word)
    for word in common:
        if len(word) == 3 and word in known:
            take(word)
    for word in known:
        if len(word) >= 4:
            take(word)
    for word in places:
        take(word.lower())
    for word in CONTRACTIONS:
        take(word)
    for word in CALENDAR_WORDS:
        take(word)
    for word in SHORT_WORDS:
        take(word)
    return sorted(chosen)


def build_payload(words, daily_words, common_words=()):
    return {
        "rows": ROWS,
        "cols": COLS,
        "order": list(DIFFICULTY_ORDER),
        "words": words,
        "dailyWords": list(daily_words),
        "commonWords": list(common_words),
        "branchDrops": BRANCH_DROPS,
        "difficulties": {
            difficulty_id: DIFFICULTIES[difficulty_id].as_json()
            for difficulty_id in DIFFICULTY_ORDER
        },
        "challengeOrder": list(CHALLENGE_ORDER),
        "challenges": {
            challenge_id: CHALLENGES[challenge_id].as_json()
            for challenge_id in CHALLENGE_ORDER
        },
    }


def load_ranked_words(path):
    ranked = []
    seen = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        word = line.split()[0].lower()
        if not word.isalpha() or word in seen:
            continue
        seen.add(word)
        ranked.append(word)
    return ranked
