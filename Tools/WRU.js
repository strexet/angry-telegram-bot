class WRU {

  constructor() {
    this.delimiter = 'w';
    this.toWRU = {
      "а": "a",
      "б": "b",
      "в": "v",
      "г": "g",
      "д": "d",
      "е": "e",
      "ё": "io",
      "ж": "j",
      "з": "z",
      "и": "i",
      "й": "ii",
      "к": "k",
      "л": "l",
      "м": "m",
      "н": "n",
      "о": "o",
      "п": "p",
      "р": "r",
      "с": "s",
      "т": "t",
      "у": "u",
      "ф": "f",
      "х": "h",
      "ц": "c",
      "ч": "ch",
      "ш": "sh",
      "щ": "shch",
      "ъ": "ie",
      "ы": "y",
      "ь": "ng",
      "э": "ne",
      "ю": "iu",
      "я": "ia",

      "А": "A",
      "Б": "B",
      "В": "V",
      "Г": "G",
      "Д": "D",
      "Е": "E",
      "Ё": "IO",
      "Ж": "J",
      "З": "Z",
      "И": "I",
      "Й": "II",
      "К": "K",
      "Л": "L",
      "М": "M",
      "Н": "N",
      "О": "O",
      "П": "P",
      "Р": "R",
      "С": "S",
      "Т": "T",
      "У": "U",
      "Ф": "F",
      "Х": "H",
      "Ц": "C",
      "Ч": "CH",
      "Ш": "SH",
      "Щ": "SHCH",
      "Ъ": "IE",
      "Ы": "Y",
      "Ь": "NG",
      "Э": "NE",
      "Ю": "IU",
      "Я": "IA"
    };
    this.fromWRU = {
      "a": "а",
      "b": "б",
      "v": "в",
      "g": "г",
      "d": "д",
      "e": "е",
      "io": "ё",
      "j": "ж",
      "z": "з",
      "i": "и",
      "ii": "й",
      "k": "к",
      "l": "л",
      "m": "м",
      "n": "н",
      "o": "о",
      "p": "п",
      "r": "р",
      "s": "с",
      "t": "т",
      "u": "у",
      "f": "ф",
      "h": "х",
      "c": "ц",
      "ch": "ч",
      "sh": "ш",
      "shch": "щ",
      "ie": "ъ",
      "y": "ы",
      "ng": "ь",
      "ne": "э",
      "iu": "ю",
      "ia": "я",

      "A": "А",
      "B": "Б",
      "V": "В",
      "G": "Г",
      "D": "Д",
      "E": "Е",
      "IO": "Ё",
      "J": "Ж",
      "Z": "З",
      "I": "И",
      "II": "Й",
      "K": "К",
      "L": "Л",
      "M": "М",
      "N": "Н",
      "O": "О",
      "P": "П",
      "R": "Р",
      "S": "С",
      "T": "Т",
      "U": "У",
      "F": "Ф",
      "H": "Х",
      "C": "Ц",
      "CH": "Ч",
      "SH": "Ш",
      "SHCH": "Щ",
      "IE": "Ъ",
      "Y": "Ы",
      "NG": "Ь",
      "NE": "Э",
      "IU": "Ю",
      "IA": "Я"
    };
  }
}

WRU.prototype.strToWru = function(str) {
  let WRUarr = [];
  let wordArr = str.trim().split(/\s/);
  let isQuestion = false;

  for (let i = 0; i < wordArr.length; i++) {
    let charArr = wordArr[i].split('');

    if (charArr[charArr.length - 1] == '?') {
      isQuestion = true;
      charArr.length = charArr.length - 1;
    }

    for (let j = 0; j < charArr.length; j++) {
      if (charArr[j] in this.toWRU){
        charArr[j] = this.toWRU[charArr[j]];
      }
    }

    let WRUword = charArr.join(delimiter);

    WRUarr.push(WRUword);
  }

  let result = WRUarr.join(' ');
  if (isQuestion) {
    result += ' questionmark';
  }

  return result;
}

WRU.prototype.WruToStr = function(wru) {
  let normalWords = [];
  let WRUwords = wru.trim().split(/\s/);
  for (let i = 0; i < WRUwords.length; i++) {
    let charArr = WRUwords[i].split(delimiter);

    for (let j = 0; j < charArr.length; j++) {
      if (charArr[j] in this.fromWRU){
        charArr[j] = this.fromWRU[charArr[j]];
      }
    }

    let normalWord = charArr.join('');
    normalWords.push(normalWord);
  }

  return normalWords.join(' ');
}


module.exports = new WRU();
