// Large built-in word list of common English words (3-6 letters)
const WORD_LIST = [
  // 3-letter words
  "ace","act","add","age","ago","aid","aim","air","ale","all","and","ant","any","ape",
  "arc","are","ark","arm","art","ash","ask","ate","awe","axe","aye","bad","bag","ban",
  "bar","bat","bay","bed","beg","bet","bid","big","bit","bog","bow","box","boy","bud",
  "bug","bun","bus","but","buy","cab","can","cap","car","cat","cob","cod","cog","cop",
  "cot","cow","cry","cub","cup","cut","dab","dam","day","den","dew","did","dig","dim",
  "dip","dog","dot","dry","dub","dug","dun","duo","dye","ear","eat","egg","ego","elf",
  "elk","elm","end","era","eve","ewe","eye","fan","far","fat","fax","fay","fed","few",
  "fib","fig","fin","fit","fix","fly","foe","fog","for","fox","fun","fur","gag","gap",
  "gas","gel","gem","get","gig","gnu","god","got","gum","gun","gut","guy","gym","had",
  "ham","has","hat","hay","hem","hen","her","hew","hid","him","hip","his","hit","hob",
  "hoe","hog","hop","hot","how","hub","hug","hum","hut","ice","ill","imp","ink","inn",
  "ion","ire","ivy","jab","jag","jam","jar","jaw","jay","jet","jig","job","jog","joy",
  "jug","jut","keg","kin","kit","lab","lag","lap","law","lay","lea","led","leg","let",
  "lid","lie","lip","lit","log","lot","low","lug","mad","man","map","mar","mat","may",
  "men","met","mix","mob","mod","mop","mud","mug","nab","nag","nap","net","new","nil",
  "nip","nit","nob","nod","nor","not","now","nun","oak","oar","oat","odd","ode","off",
  "oil","old","one","opt","orb","ore","our","out","owe","owl","own","pad","pan","par",
  "pat","paw","pay","pea","peg","pen","pep","pet","pie","pig","pin","pit","ply","pod",
  "pop","pot","pow","pro","pub","pun","pup","pus","put","rag","ram","ran","rap","rat",
  "raw","ray","red","ref","rep","rev","rib","rid","rig","rim","rip","rob","rod","rot",
  "row","rub","rug","rum","run","rut","rye","sad","sag","sap","sat","saw","say","sea",
  "set","sew","she","shy","sin","sip","sir","sit","ski","sky","sly","sob","sod","son",
  "sow","spa","spy","sub","sue","sum","sun","sup","tab","tan","tap","tar","tax","tea",
  "ten","the","tie","tin","tip","toe","ton","too","top","tow","toy","try","tub","tug",
  "two","urn","use","van","vat","via","vow","war","was","wax","way","web","wed","wet",
  "who","wig","win","wit","woe","wok","won","woo","wow","yak","yam","yap","yew","you",
  "zap","zen","zip","zoo",
  // 4-letter words
  "able","ache","acid","acne","acre","acts","adds","ados","ages","aged","aide","aids",
  "aims","airs","airy","akin","also","alto","alum","amid","amok","amps","anal","anew",
  "anna","anon","ante","ants","apex","arch","area","arms","army","arty","ashy","atom",
  "atop","aunt","auto","away","awed","awry","axes","axis","babe","back","bail","bait",
  "bake","bald","bale","ball","balm","band","bane","bang","bank","bare","bark","barn",
  "base","bash","bask","bass","bate","bath","bats","bead","beak","beam","bean","bear",
  "beat","beau","beck","been","beef","beer","bees","beet","bell","belt","bend","bent",
  "best","bias","bide","bile","bill","bind","bird","bite","blah","blam","bled","blew",
  "blob","bloc","blog","blot","blow","blue","blur","boar","boat","body","boil","bold",
  "bolt","bone","book","boom","boon","boor","bore","born","boss","both","bout","brag",
  "bran","brat","brew","brig","brim","brow","buck","buff","bulk","bull","bump","bunk",
  "burg","burn","burp","bush","busy","cage","cake","calf","call","calm","came","cane",
  "cape","card","care","carp","cart","case","cash","cast","cave","cell","cent","chap",
  "char","chat","chef","chew","chip","chop","chow","cite","clad","clam","clap","claw",
  "clay","clip","clod","clog","clop","clot","club","clue","coal","coat","code","coil",
  "coin","cold","cole","colt","come","cone","cook","cool","cope","cord","core","cork",
  "corn","cost","cozy","crab","crew","crop","crow","cube","curb","cure","curl","curt",
  "dame","damp","dare","dark","dart","dash","data","date","dawn","days","daze","dead",
  "deal","dean","dear","deck","deed","deem","deep","dell","demo","deny","desk","dial",
  "dice","diet","dirt","disc","dish","disk","dock","does","dome","done","doom","door",
  "dose","dote","dove","down","drab","drag","draw","dray","drip","drop","drug","drum",
  "dual","dumb","dump","dunk","dusk","dust","duty","each","earn","ease","east","edge",
  "edit","emit","epic","even","ever","evil","exam","exit","expo","face","fact","fade",
  "fail","fair","fake","fall","fame","fang","farm","fast","fate","fawn","faze","feat",
  "feed","feel","feet","fell","felt","fern","fest","feud","file","fill","film","find",
  "fine","fink","fire","firm","fish","fist","fizz","flab","flag","flaw","flea","fled",
  "flew","flex","flip","flit","flog","flop","flow","foam","fold","folk","fond","font",
  "fore","fork","form","fort","foul","four","fowl","free","frog","from","fuel","full",
  "fume","fund","fuse","fuzz","gait","gale","gall","game","gape","garb","gate","gaze",
  "gear","gild","glee","glib","glob","glow","glue","glum","gnat","gone","gong","gore",
  "gout","gown","grab","grad","gray","grew","grey","grid","grim","grin","grip","grit",
  "grow","grub","gulf","gull","gulp","gust","guts","hack","hail","hair","hale","half",
  "hall","halt","hand","hang","hard","hare","hark","harm","harp","hash","haze","hazy",
  "head","heal","heap","heat","heed","heel","held","helm","help","herb","herd","here",
  "hero","hide","high","hike","hill","hint","hire","hive","hoax","hold","hole","home",
  "hone","hood","hoof","hook","hoop","horn","hose","host","hour","hulk","hull","hung",
  "hunt","hurl","hurt","hymn","icon","idea","idle","inch","iron","isle","itch","jade",
  "jail","jest","jive","join","joke","jolt","junk","jury","just","keen","keep","kelp",
  "kill","kind","king","knee","knew","knob","knot","know","lack","lake","lame","lamp",
  "land","lane","lash","last","late","laud","lava","lawn","lazy","lead","leak","lean",
  "leap","lend","lens","lick","life","lift","like","lime","limp","line","link","list",
  "live","load","loam","loan","loft","lone","long","loom","loop","lore","lorn","loss",
  "loud","lout","love","luck","lull","lump","lung","lurk","lure","lust","mace","made",
  "mail","main","make","male","mall","mane","many","mark","mars","mash","mask","mass",
  "mast","mate","math","maze","meal","mean","meat","meek","melt","menu","mere","mesh",
  "mild","mile","mill","mime","mind","mine","mint","miss","mist","moan","moat","mode",
  "mole","molt","monk","mood","moor","more","most","moue","move","much","mule","mull",
  "myth","nail","name","nape","navy","near","neat","neck","need","neon","nest","next",
  "nice","nine","node","none","norm","nose","note","noun","nuke","null","numb","oboe",
  "ogre","once","only","open","oral","oval","oven","over","pace","page","paid","pail",
  "pain","pale","palm","pane","park","part","past","path","pave","peak","peal","pear",
  "peel","peer","perk","pest","pick","pier","pile","pine","ping","pipe","plan","play",
  "plea","plod","plot","plow","plum","plus","poem","poet","pole","poll","polo","pond",
  "pool","poor","pore","pork","port","pose","post","pray","prey","prom","prop","pull",
  "pure","push","quay","quit","quiz","race","rack","rage","raid","rail","rain","rake",
  "ramp","rang","rank","rant","rare","rash","rate","rave","read","real","reap","rear",
  "rely","rend","rent","rest","rice","rich","ride","ring","riot","rise","risk","roam",
  "roar","robe","rock","role","roll","roof","rook","room","rope","rose","rota","rote",
  "rout","rove","rule","ruse","rush","rust","safe","sage","sake","sale","salt","same",
  "sand","sane","sang","sank","sash","save","scan","scar","seal","seam","seep","self",
  "sell","semi","sent","shed","shin","ship","shoe","shop","shot","show","shun","shut",
  "sick","side","sigh","silk","sill","sing","sink","site","size","skew","skin","skip",
  "skit","slam","slap","slat","slay","sled","slew","slid","slim","slip","slit","slob",
  "slop","slot","slow","slue","slum","slur","smug","snag","snap","snip","snob","snug",
  "soak","soar","sock","soft","soil","sole","some","song","sore","sort","soul","soup",
  "sour","span","spar","spin","spit","spot","spud","spur","stab","star","stay","stem",
  "step","stew","stir","stop","stub","stud","stun","such","suit","sulk","sump","sure",
  "surf","swam","swap","swat","sway","swim","tail","tale","talk","tall","tame","taut",
  "team","tear","teem","tell","temp","tend","tent","term","test","text","them","then",
  "they","this","thus","tick","tide","till","time","tiny","tire","toad","toil","told",
  "toll","tomb","tome","tong","took","toot","tore","torn","toss","tour","tuck","tuft",
  "tune","turf","turn","tusk","twin","type","ugly","undo","unit","upon","used","user",
  "vain","vale","vary","vast","veil","vein","very","vest","veto","vice","view","vile",
  "vine","visa","void","volt","vote","wade","wail","wait","wake","walk","wall","wand",
  "wane","want","ward","warm","warn","wart","wash","wasp","wavy","weak","weal","weed",
  "week","well","welt","went","were","west","what","when","whim","whip","whom","wick",
  "wide","wife","wild","will","wimp","wind","wine","wink","wire","wise","wish","with",
  "wolf","wood","wool","word","wore","worm","wove","wrap","wren","writ","yawn","year",
  "yell","your","zeal","zero","zest","zone",
  // 5-letter words
  "abbey","abhor","abide","abler","abode","abort","about","above","abuse","abyss","ached",
  "acorn","acrid","acted","acute","adage","adept","admit","adobe","adore","adorn","adult",
  "after","again","agile","aging","agony","agree","ahead","aided","aisle","alert","algae",
  "alibi","align","alike","alive","allay","alley","allot","allow","aloft","alone","along",
  "aloof","aloud","altar","alter","amber","amend","amiss","ample","angel","anger","angle",
  "angry","angst","anime","annex","annoy","antic","apart","apple","apply","apron","aptly",
  "ardor","argue","arise","armor","arson","artsy","ascot","aside","asset","aster","astor",
  "attic","audio","audit","augur","avail","avert","avid","avoid","awake","award","aware",
  "badly","baker","bandy","banjo","baron","basic","basil","basis","batch","bathe","bayou",
  "beach","beady","beagle","began","begin","being","belle","bench","berry","bezel","birch",
  "bison","black","blade","blame","bland","blank","blast","blaze","bleat","bleed","blend",
  "bless","blind","bliss","block","blood","bloom","blown","board","booze","borax","botch",
  "brain","brake","brand","brave","bravo","brawl","bream","breed","breve","brick","bride",
  "brief","brine","bring","brisk","broth","brown","brute","budge","buggy","build","built",
  "bunch","buxom","buyer","byway","cabal","cable","cache","cadet","candy","canny","cargo",
  "carry","catch","cause","cease","chain","chair","chalk","champ","chant","chaos","charm",
  "chart","chase","cheap","check","cheek","cheer","chess","chest","chief","child","chill",
  "china","choir","chord","chuck","churn","civic","civil","claim","clamp","clang","clank",
  "clash","class","clean","clear","cleft","clench","clerk","click","climb","clink","clock",
  "clone","close","cloth","cloud","clout","coast","comet","comic","coral","could","count",
  "couch","cough","cover","crack","craft","crane","cramp","crash","crass","crave","crawl",
  "creak","cream","creek","creep","crimp","crisp","croak","cross","crown","cruel","crush",
  "crust","curve","cycle","cynic","daily","daisy","dance","datum","daunt","death","debug",
  "debut","delta","dense","depot","depth","derby","depth","devil","digit","dingy","dirty",
  "disco","ditch","ditty","diver","dizzy","dodge","doing","dolly","donor","douse","dowdy",
  "dozen","drank","drape","dread","dream","dregs","dress","dried","drift","drill","drink",
  "drive","drone","drool","drove","drown","dully","dully","dumpy","dunce","dwell","dwelt",
  "eager","eagle","early","earth","easel","eight","elect","elite","ember","emcee","emote",
  "empty","endow","enjoy","ensue","enter","entry","envoy","equip","erode","error","essay",
  "ethos","evade","event","every","exact","exalt","excel","exile","extra","fable","facet",
  "faith","false","fancy","fatal","favor","feast","feign","fence","feral","fiber","fiend",
  "fifth","fifty","fight","finch","first","fjord","fixed","fizzy","flair","flame","flank",
  "flare","flash","flask","flavor","flaw","flick","fling","float","flock","flora","floss",
  "flour","flute","focal","foggy","force","forge","forth","found","foxes","foyer","frame",
  "frank","fraud","fresh","frisk","front","frost","froth","froze","fruit","fully","fungi",
  "funky","funny","gaudy","gavel","gauze","gawky","genre","ghost","girth","given","gizmo",
  "gland","glare","glass","glean","glide","gloss","glued","glued","gnome","goofy","gouge",
  "grace","grade","grant","grasp","grass","grail","grain","grand","graph","grave","graze",
  "greed","greet","grief","grind","groan","groin","groom","grope","gross","grout","grove",
  "gruel","gruff","guard","guise","gusto","gypsy","habit","haste","hatch","haughty","haven",
  "havoc","hazel","heart","heavy","hedge","heist","hence","heron","hitch","holly","honor",
  "horns","hotel","hound","human","humid","humor","hurry","hyena","hyper","icing","ideal",
  "image","imply","inbox","incur","index","infer","infix","inner","input","inter","intro",
  "inure","issue","ivory","jaunt","jelly","jewel","jimmy","jumbo","jumpy","kneel","knife",
  "knock","known","koala","lance","large","laser","latch","later","latin","laugh","layer",
  "learn","leech","level","light","limit","lined","liner","liver","local","lodge","logic",
  "lousy","lover","lower","lucid","lumpy","lunar","lusty","lying","magic","major","maker",
  "manor","manly","maple","march","marry","match","mayor","media","mercy","merit","merry",
  "metal","mealy","micro","might","mimic","minor","minus","mirth","miser","model","moist",
  "money","monks","month","moose","moral","mount","mourn","mouth","mousy","mucky","muddy",
  "multi","murky","music","mussy","nadir","naive","nanny","nasal","nasty","naval","never",
  "nimble","ninja","noise","noisy","north","notch","noted","novel","nurse","nymph","occur",
  "ocean","offer","often","olive","onset","opera","order","organ","other","outdo","outer",
  "outwit","ovoid","oxide","ozone","paddy","paint","pansy","paper","party","pasta","pasty",
  "patsy","pause","peace","peach","penal","penny","perch","peril","perky","petty","phone",
  "photo","piano","pilot","pizza","place","plaid","plain","plane","plank","plant","plaza",
  "plead","pleat","pluck","plume","plump","plunk","plush","point","poker","polar","polka",
  "poppy","porch","pouch","pound","power","press","price","pride","prime","print","prior",
  "privy","probe","prone","proof","prose","proud","prove","prowl","prude","prune","psalm",
  "purer","pushy","queen","query","quest","queue","quick","quiet","quota","quote","rabid",
  "radar","radii","radio","rainy","rally","ranch","range","rapid","ration","reach","ready",
  "realm","rebel","refer","reign","relax","repay","repel","rider","ridge","right","ripen",
  "risen","risky","rivet","robot","rocky","rodeo","rouge","rough","round","rowdy","royal",
  "rugby","ruler","rumor","rural","saber","sadly","salad","salon","sandy","sauce","savor",
  "scale","scalp","scamp","scant","scene","scent","scone","scoop","scope","scout","screw",
  "scrub","scuff","seize","sense","setup","seven","sever","sewn","shade","shady","shaft",
  "shaky","shall","shame","shape","share","shark","sharp","shave","shawl","sheer","shelf",
  "shell","shift","shire","shirk","shorn","short","shove","shown","showy","shred","shrew",
  "shrug","siege","sieve","sight","sigma","silly","since","siren","sixth","sixty","skate",
  "skimp","skull","skunk","slain","slant","slate","slick","slash","sleek","sleep","sleet",
  "slept","sleek","slice","slide","slope","sloth","slump","slung","slunk","smart","smash",
  "smear","smell","smelt","smirk","smite","smith","smoke","snail","snake","snare","snarl",
  "sneak","sneer","sniff","snore","snort","solar","solid","solve","sorry","south","space",
  "spark","spawn","spear","speak","speed","spend","spent","spice","spicy","spill","spine",
  "spite","splat","spook","spoon","sport","spray","spree","squad","squat","squid","stain",
  "stale","stalk","stall","stamp","stand","stare","stark","stash","state","stave","steal",
  "steam","steep","steel","steer","stern","stomp","stony","stood","storm","story","stout",
  "swamp","swear","sweet","swept","swift","swirl","swore","sworn","syrup","tabby","taffy",
  "taint","taken","talon","tangy","taunt","taste","tasty","teach","tease","tenth","terse",
  "their","there","these","thick","thing","think","thorn","those","three","threw","throw",
  "tiger","tight","tilt","timid","tipsy","toast","token","total","touch","tough","tower",
  "toxic","trace","track","trade","trail","train","trait","tramp","trap","trash","tread",
  "treat","trend","trial","tribe","trick","tried","trove","truce","truck","truly","trump",
  "trunk","trust","truth","tuber","tulip","tumor","tuned","turbo","twice","twirl","twist",
  "ultra","under","unfit","unify","unite","until","unzip","urban","usage","usher","usual",
  "utter","vague","valid","valor","valve","valor","vapor","vault","vicar","video","vigor",
  "viral","virus","visit","visor","vista","vital","vivid","vocal","voice","voter","vying",
  "waltz","waste","watch","water","weary","wedge","weigh","weird","weave","whale","wheat",
  "wheel","where","which","while","whirl","white","whole","whose","widen","wider","windy",
  "witty","witch","woman","women","world","worry","worth","would","wound","wreck","wrist",
  "write","wrote","yacht","yearn","yield","young","youth","zebra",
  // 6-letter words
  "abacus","ablaze","aboard","absent","absorb","accept","access","accord","accuse","aching",
  "acquit","active","actual","addend","addled","admire","affirm","afford","afield","afraid",
  "agents","aghast","agility","agleam","agreed","ailment","alarum","albeit","albino","allege",
  "allied","allure","almond","almost","alpine","ambush","amiable","amidst","amount","answer",
  "antics","anyone","anyway","aortic","appeal","appear","appease","append","ardent","around",
  "arouse","arrest","artful","artist","assume","astern","attain","attend","autumn","awoken",
  "babble","badger","baffled","ballot","bamboo","banana","banter","barley","barrel","barter",
  "battle","bawdy","beacon","beamed","beeswax","before","behalf","behave","belief","belted",
  "beside","better","bewail","beyond","bicker","bigger","bikini","binary","biopsy","bishop",
  "bitter","blazed","blazon","blench","blight","border","bottle","bottom","bounce","bouquet",
  "breach","breeze","bridge","bright","broken","browse","bruise","brutal","bribed","buffer",
  "bundle","burden","burrow","butler","button","bypass","cactus","candle","cannon","cannot",
  "carbon","castle","catchy","caught","causal","cavern","cellar","census","center","cereal",
  "charge","chaise","chance","chancy","change","chaste","choice","choose","chronic","chunk",
  "cipher","circle","circus","classy","clause","clever","client","clique","cloned","closet",
  "cobalt","coerce","column","combat","comedy","commit","corner","cotton","cowboy","crazed",
  "credit","crisis","critic","crunch","crying","cursor","custom","cutoff","dagger","damage",
  "dancer","daring","darken","darling","dawdle","deadly","decode","desert","devour","differ",
  "direct","doctor","domain","donkey","double","dredge","driver","drivel","dungeon","during",
  "empire","enable","encore","endure","engage","entire","enzyme","errand","escape","ethical",
  "evolve","exceed","exclaim","excuse","exempt","exhaust","extend","famine","famous","faults",
  "feline","fender","fennel","fierce","figure","filter","finger","finery","finish","fiscal",
  "fissure","fizzing","flagon","fledge","flight","flinch","floral","flower","fluffy","follow",
  "fooled","forced","forest","forget","formal","fossil","foster","framed","frenzy","fright",
  "frozen","fungal","fusion","future","galley","garden","garlic","gather","genius","gibber",
  "giggle","glacial","gloomy","goblin","golden","govern","gravel","greasy","grieve","grovel",
  "gurgle","hammer","handle","hansom","happen","harbor","hardly","healer","health","herald",
  "hermit","hollow","homage","honest","hunger","hunter","hustle","ignite","immune","impact",
  "import","impure","income","insane","insist","intent","invest","island","itself","jewels",
  "jiggle","jingle","jostle","jungle","kidnap","kitten","knight","leader","legend","linear",
  "liquid","listen","locate","loosen","losing","loving","mangle","manner","market","mellow",
  "member","mental","meteor","method","middle","mirror","modern","modest","moment","morsel",
  "mortal","muffin","murder","muscle","mutual","mystic","narrow","nature","neatly","nephew",
  "nestle","noodle","notice","oblong","obtain","openly","outlaw","output","pebble","pellet",
  "pencil","person","pickle","pillow","pistol","pirate","player","plunge","poetic","poison",
  "portal","potato","prefer","pretty","profit","proper","puddle","purple","puzzle","radish",
  "raffle","raisin","random","rattle","recipe","reckon","reduce","reform","refund","region",
  "repair","repeal","repeat","rescue","result","return","reveal","riddle","ritual","robust",
  "rocket","rodent","roughly","rubber","rumble","saddle","salute","sample","savage","scheme",
  "screen","search","secret","sector","select","settle","shield","signal","silent","silver",
  "simple","single","sister","sketch","sleepy","slogan","smooth","snobbish","social","socket",
  "soften","source","speech","spider","spirit","spread","spring","squash","stable","stroll",
  "statue","stride","string","stroke","strong","struck","studio","stupid","subtle","suffer",
  "sunset","supply","surely","survey","switch","symbol","tangle","target","teapot","temple",
  "tender","tennis","terrace","thatch","theory","though","throne","ticket","tinker","tiptoe",
  "toilet","tomato","torque","touchy","trance","travel","treble","tremor","tribal","triple",
  "triumph","trophy","tunnel","turnip","turtle","unwind","upbeat","useful","valley","vanish",
  "velvet","vessel","victim","vision","wander","warmth","wealth","weapon","weekly","wicket",
  "wickle","wisdom","wonder","wrists","worthy","yellow","zigzag",
];

// Build a Set for O(1) lookups
const WORD_SET = new Set(WORD_LIST.map(w => w.toLowerCase()));

export function isValidWord(word) {
  if (!word || word.length < 3) return false;
  return WORD_SET.has(word.toLowerCase());
}

/**
 * canFormWord: checks if the board has the required letters.
 * Bottom-up search: prefers letters closer to the bottom of the board.
 * grid is a 14×8 array (rows × cols) of null or {letter, color}
 */
export function canFormWord(word, grid) {
  if (!word || word.length < 3) return false;
  const letters = word.toUpperCase().split('');
  const ROWS = grid.length;
  const COLS = grid[0].length;

  // Collect all letter positions, sorted bottom-up (highest row index first)
  const available = [];
  for (let row = ROWS - 1; row >= 0; row--) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) {
        available.push({ letter: grid[row][col].letter, row, col });
      }
    }
  }

  // Try to match each letter of the word greedily using bottom-most available
  const usedIndices = new Set();
  for (const needed of letters) {
    let found = false;
    for (let i = 0; i < available.length; i++) {
      if (!usedIndices.has(i) && available[i].letter === needed) {
        usedIndices.add(i);
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/**
 * findWordCells: returns the cells (bottom-up) that form the word.
 * Returns array of {row, col} in the order they were consumed.
 */
export function findWordCells(word, grid) {
  if (!word) return [];
  const letters = word.toUpperCase().split('');
  const ROWS = grid.length;
  const COLS = grid[0].length;

  // Collect all letter positions, sorted bottom-up
  const available = [];
  for (let row = ROWS - 1; row >= 0; row--) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) {
        available.push({ letter: grid[row][col].letter, row, col, idx: available.length });
      }
    }
  }

  const usedIndices = new Set();
  const cells = [];
  for (const needed of letters) {
    for (let i = 0; i < available.length; i++) {
      if (!usedIndices.has(i) && available[i].letter === needed) {
        usedIndices.add(i);
        cells.push({ row: available[i].row, col: available[i].col });
        break;
      }
    }
  }
  return cells;
}
