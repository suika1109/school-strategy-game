const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const customcanvas = document.getElementById("customCanvas");
const customctx = customcanvas.getContext("2d");

const StartBtn = document.getElementById("StartBtn");
const ContinueBtn = document.getElementById("ContinueBtn");

const attackSound = new Audio("ken.mp3");
// グローバルスコープで画像を定義
const ps4IconImage = new Image();
ps4IconImage.src = "ps4.avif"; // 後で正しいパスに変更
const SwitchIconImage = new Image();
SwitchIconImage.src = "switch.webp"; // 後で正しいパスに変更
const ps5IconImage = new Image();
ps5IconImage.src = "ps5.png"; // 後で正しいパスに変更
const Switch2IconImage = new Image();
Switch2IconImage.src = "switch2.jpg"; // 後で正しいパスに変更
const FacebookIconImage = new Image();
FacebookIconImage.src = "facebook.webp"; // 後で正しいパスに変更
const TwitterIconImage = new Image();
TwitterIconImage.src = "twitter.jpg"; // 後で正しいパスに変更
const InstagramIconImage = new Image();
InstagramIconImage.src = "instagram.webp"; // 後で正しいパスに変更
const LINEIconImage = new Image();
LINEIconImage.src = "line.jpg"; // 後で正しいパスに変更

const bgm = new Audio("maou.mp3");
bgm.loop = true;        // ループ再生
bgm.volume = 0.2;       // 音量（0.0〜1.0）
let bgmStarted = false;

const TILE_SIZE = 60;
const ROWS = 9;
const COLS = 9;

const removedPieces = {}; // { type: [{ piece, row, col }, ...] }

const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

let selected = null;
let validMoves = [];
let currentPlayer = 1;
let AI_LEVEL = 4; // ← 1〜4で設定
let lastSelectedPiece = null;
let playerUpgrades = {}; // グローバルに保存（例：{ 'pawn': { hp: +2, atk: +1 }, ... }）
let clearedStages = [];  // クリアしたステージIDや名前を保存
let unclearedStages = []; // クリアできなかったステージIDや名前を保存
let stageId = 1;
let selectedCustomPiece = null;
let turnCount = 1;
let stageActCount = 1;
let exp = 0;

const stages = [
    //1年前期
    { id: 1, name: "細目", unlockCondition: () => true, level: "☆☆☆☆☆☆☆☆☆☆" },
    { id: 2, name: "誉子", unlockCondition: () => true, level: "★☆☆☆☆☆☆☆☆☆" },
    { id: 3, name: "藤文", unlockCondition: () => true, level: "★☆☆☆☆☆☆☆☆☆" },
    { id: 4, name: "忍座", unlockCondition: () => true, level: "★★☆☆☆☆☆☆☆☆" },
    { id: 5, name: "腹堕", unlockCondition: () => true, level: "★★☆☆☆☆☆☆☆☆" },
    // 1年後期
    {
        id: 6, name: "細目",
        unlockCondition: () => {
            const firstGroup = [1, 2, 3, 4, 5];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★☆☆☆☆☆☆☆☆☆"
    },
    {
        id: 7, name: "岸辺",
        unlockCondition: () => {
            const firstGroup = [1, 2, 3, 4, 5];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★☆☆☆☆☆☆☆☆"
    },
    {
        id: 8, name: "葵根",
        unlockCondition: () => {
            const firstGroup = [1, 2, 3, 4, 5];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★☆☆☆☆☆☆☆"
    },
    {
        id: 9, name: "馬貰",
        unlockCondition: () => {
            const firstGroup = [1, 2, 3, 4, 5];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★☆☆☆☆☆☆☆"
    },
    {
        id: 10, name: "忍座",
        unlockCondition: () => {
            const firstGroup = [1, 2, 3, 4, 5];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★☆☆☆☆"
    },
    //2年前期
    {
        id: 11, name: "岸辺",
        unlockCondition: () => {
            const firstGroup = [6, 7, 8, 9, 10];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★☆☆☆☆☆☆☆"
    },
    {
        id: 12, name: "高田",
        unlockCondition: () => {
            const firstGroup = [6, 7, 8, 9, 10];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★☆☆☆☆☆☆"
    },
    {
        id: 13, name: "葱氏",
        unlockCondition: () => {
            const firstGroup = [6, 7, 8, 9, 10];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★☆☆☆☆☆"
    },
    {
        id: 14, name: "鷲野",
        unlockCondition: () => {
            const firstGroup = [6, 7, 8, 9, 10];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★☆☆☆☆☆"
    },
    {
        id: 15, name: "林麻",
        unlockCondition: () => {
            const firstGroup = [6, 7, 8, 9, 10];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★☆☆☆"
    },
    //2年後期
    {
        id: 16, name: "檜山",
        unlockCondition: () => {
            const firstGroup = [11, 12, 13, 14, 15];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★☆☆☆☆"
    },
    {
        id: 17, name: "坂上",
        unlockCondition: () => {
            const firstGroup = [11, 12, 13, 14, 15];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★☆☆☆"
    },
    {
        id: 18, name: "小澤",
        unlockCondition: () => {
            const firstGroup = [11, 12, 13, 14, 15];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★☆☆☆"
    },
    {
        id: 19, name: "暑目",
        unlockCondition: () => {
            const firstGroup = [11, 12, 13, 14, 15];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★☆☆"
    },
    {
        id: 20, name: "崖",
        unlockCondition: () => {
            const firstGroup = [11, 12, 13, 14, 15];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★★☆"
    },
    //3年前期
    {
        id: 21, name: "康一",
        unlockCondition: () => {
            const firstGroup = [16, 17, 18, 19, 20];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★☆☆"
    },
    {
        id: 22, name: "木門",
        unlockCondition: () => {
            const firstGroup = [16, 17, 18, 19, 20];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★☆☆"
    },
    {
        id: 23, name: "非出来",
        unlockCondition: () => {
            const firstGroup = [16, 17, 18, 19, 20];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★☆☆"
    },
    {
        id: 24, name: "暑目",
        unlockCondition: () => {
            const firstGroup = [16, 17, 18, 19, 20];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★★☆"
    },
    {
        id: 25, name: "坂上",
        unlockCondition: () => {
            const firstGroup = [16, 17, 18, 19, 20];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★★☆"
    },
    {
        id: 26, name: "忍座",
        unlockCondition: () => {
            const firstGroup = [21, 22, 23, 24, 25];
            return firstGroup.every(id =>
                clearedStages.includes(id) || unclearedStages.includes(id)
            );
        }, level: "★★★★★★★★★★"
    },
];

// 駒の定義
const PieceType = {
    Teacher: "Teacher",
    Teachermove: "Teachermove",
    Teachermove2: "Teachermove2",
    Teachermove3: "Teachermove3",
    Teachermove11: "Teachermove11",
    Teachermove12: "Teachermove12",
    LMS: "LMS",
    Credit: "Credit",
    Student: "Student",
    RepeaterStudent: "RepeaterStudent",
    Irogami: "Irogami",
    Hade: "Hade",
    Kinnniku: "Kinnniku",
    Syatiku: "Syatiku",
    Tetuya: "Tetuya",
    Innsyu: "Innsyu",
    Nakanuki: "Nakanuki",
    Kodoku: "Kodoku",
    Sekitori: "Sekitori",
    Tyuuni: "Tyuuni",
    Zennjitu: "Zennjitu",
    Yuugi: "Yuugi",
    Tobaku: "Tobaku",
    Hayabenn: "Hayabenn",
    Tikoku: "Tikoku",
    Bukatu: "Bukatu",
    Doukoukai: "Doukoukai",
    Saisi: "Saisi",
    SNS: "SNS",
    Sumaho: "Sumaho",
    Nomikai: "Nomikai",
    Bakusui: "Bakusui",
    Namazu: "Namazu",
    Kyousi: "Kyousi",
    GPT: "GPT",
    Tennsai: "Tennsai",
    Uma: "Uma",
    Kakomonn: "Kakomonn",
    Majime: "Majime",
    PS4: "PS4",
    Switch: "Switch",
    PS5: "PS5",
    Switch2: "Switch2",
    Facebook: "Facebook",
    Twitter: "Twitter",
    Instagram: "Instagram",
    LINE: "LINE",
    Bannsyo: "Bannsyo",
    Itiji: "Itiji",
    Zeroji: "Zeroji",
    Ile: "Ile",
    Leu: "Leu",
    Lys: "Lys",
    Met: "Met",
    Phe: "Phe",
    Val: "Val",
    His: "His",
    Thr: "Thr",
    Trp: "Trp",
    LMS2: "LMS2",
    Miss: "Miss",
    Report: "Report",
    SS: "SS",
    SR: "SR",
    Kasa: "Kasa",
    Hako: "Hako",
    LMS3: "LMS3",
    Bannsyo2: "Bannsyo2",
    Gs: "Gs",
    Gi: "Gi",
    Gq: "Gq",
    PKA: "PKA",
    PKC: "PKC",
    VD: "VD",
    VA: "VA",
    VK: "VK",
    VE: "VE",
    VC: "VC",
    VB1: "VB1",
    VB2: "VB2",
    VB3: "VB3",
    VB5: "VB5",
    VB6: "VB6",
    VB7: "VB7",
    VB9: "VB9",
    VB12: "VB12",
    S1: "S1",
    S2: "S2",
    S3: "S3",
    S4: "S4",
    Koukinnyaku: "Koukinnyaku",
    Kouuirusuyaku: "Kouuirusuyaku",
    Dennsi: "Dennsi",
    Sou: "Sou",
    Utu: "Utu",
    Monndai: "Monndai",
    LMS4: "LMS4",
    S11: "S11",
    S12: "S12",
    S13: "S13",
    S14: "S14",
    Ia: "Ia",
    Ib: "Ib",
    Ic: "Ic",
    II: "II",
    III: "III",
    IV: "IV",
    Menneki: "Menneki",
    Toukei: "Toukei",
};
// 駒の定義
const PieceName = {
    Osiza: "Osiza",
    Osiza2: "Osiza2",
    Osiza3: "Osiza3",
    Atume: "Atume",
    Atume2: "Atume2",
};
// 駒の表示名
function getDisplayName(type) {
    switch (type) {
        case PieceType.Teacher: return "先生";
        case PieceType.Teachermove: return "先生";
        case PieceType.Teachermove2: return "先生";
        case PieceType.Teachermove3: return "先生";
        case PieceType.LMS: return "LMS";
        case PieceType.LMS2: return "LMS";
        case PieceType.Credit: return "単位";
        case PieceType.Student: return "学生";
        case PieceType.RepeaterStudent: return "留年生";
        case PieceType.Irogami: return "色髪";
        case PieceType.Hade: return "派手";
        case PieceType.Kinnniku: return "筋肉";
        case PieceType.Syatiku: return "社畜";
        case PieceType.Tetuya: return "徹夜";
        case PieceType.Innsyu: return "飲酒";
        case PieceType.Nakanuki: return "中抜";
        case PieceType.Kodoku: return "孤独";
        case PieceType.Sekitori: return "関取";
        case PieceType.Tyuuni: return "中二";
        case PieceType.Zennjitu: return "前日";
        case PieceType.Yuugi: return "遊戯";
        case PieceType.Maeseki: return "前席";
        case PieceType.Tobaku: return "賭博";
        case PieceType.Hayabenn: return "早弁";
        case PieceType.Tikoku: return "遅刻";
        case PieceType.Bukatu: return "部活";
        case PieceType.Doukoukai: return "同好会";
        case PieceType.Saisi: return "再試";
        case PieceType.SNS: return "SNS";
        case PieceType.Sumaho: return "スマホ";
        case PieceType.Nomikai: return "飲会";
        case PieceType.Bakusui: return "爆睡";
        case PieceType.Namazu: return "生図";
        case PieceType.Kyousi: return "教師";
        case PieceType.GPT: return "GPT";
        case PieceType.Tennsai: return "天才";
        case PieceType.Uma: return "馬刃";
        case PieceType.Kakomonn: return "過去問";
        case PieceType.Majime: return "真面目";
        case PieceType.PS4: return "PS4";
        case PieceType.Switch: return "Switch";
        case PieceType.PS5: return "PS5";
        case PieceType.Switch2: return "Switch2";
        case PieceType.Facebook: return "Facebook";
        case PieceType.Twitter: return "Twitter";
        case PieceType.Instagram: return "Instagram";
        case PieceType.LINE: return "LINE";
        case PieceType.Bannsyo: return "板書";
        case PieceType.Zeroji: return "0次";
        case PieceType.Itiji: return "1次";
        case PieceType.Phe: return "F";
        case PieceType.Leu: return "L";
        case PieceType.Val: return "V";
        case PieceType.Ile: return "I";
        case PieceType.Thr: return "T";
        case PieceType.His: return "H";
        case PieceType.Trp: return "W";
        case PieceType.Lys: return "K";
        case PieceType.Met: return "M";
        case PieceType.Miss: return "ミス";
        case PieceType.Report: return "提出物";
        case PieceType.SS: return "SS";
        case PieceType.SR: return "SR";
        case PieceType.Kasa: return "傘";
        case PieceType.Hako: return "箱";
        case PieceType.LMS3: return "LMS";
        case PieceType.Bannsyo2: return "板書";
        case PieceType.Gs: return "Gs";
        case PieceType.Gi: return "Gi";
        case PieceType.Gq: return "Gq";
        case PieceType.PKA: return "PKA";
        case PieceType.PKC: return "PKC";
        case PieceType.VD: return "VD";
        case PieceType.VA: return "VA";
        case PieceType.VK: return "VK";
        case PieceType.VE: return "VE";
        case PieceType.VC: return "VC";
        case PieceType.VB1: return "B1";
        case PieceType.VB2: return "B2";
        case PieceType.VB3: return "B3";
        case PieceType.VB5: return "B5";
        case PieceType.VB6: return "B6";
        case PieceType.VB7: return "B7";
        case PieceType.VB9: return "B9";
        case PieceType.VB12: return "B12";
        case PieceType.S1: return "S1";
        case PieceType.S2: return "S2";
        case PieceType.S3: return "S3";
        case PieceType.S4: return "S4";
        case PieceType.S11: return "S1";
        case PieceType.S12: return "S2";
        case PieceType.S13: return "S3";
        case PieceType.S14: return "S4";
        case PieceType.Koukinnyaku: return "抗菌";
        case PieceType.Kouuirusuyaku: return "抗ウ";
        case PieceType.Dennsi: return "e";
        case PieceType.Sou: return "躁";
        case PieceType.Utu: return "鬱";
        case PieceType.Monndai: return "問題";
        case PieceType.LMS4: return "LMS";
        case PieceType.Ia: return "Ia";
        case PieceType.Ib: return "Ib";
        case PieceType.Ic: return "Ic";
        case PieceType.II: return "II";
        case PieceType.III: return "III";
        case PieceType.IV: return "IV";
        case PieceType.Menneki: return "免疫";
        case PieceType.Toukei: return "統計";
        default: return "?";
    }
}

// 駒の初期ステータスを設定

const TypeStats = {
    Teacher: { hp: 2, atk: 0, def: 0, rank: 0, maxhp: 2 },  // 適当な値を入れてください
    LMS: { hp: 1, atk: 1, def: 0, rank: 0, exp: 10, maxhp: 1 },
    LMS2: { hp: 2, atk: 2, def: 1, rank: 0, exp: 20, maxhp: 2 },
    Credit: { hp: 5, atk: 0, def: 0, rank: 1, maxhp: 5 },
    Student: { hp: 1, atk: 1, def: 0, rank: 1, maxhp: 1 },
    RepeaterStudent: { hp: 1, atk: 1, def: 1, rank: 1, maxhp: 1 },
    Irogami: { hp: 3, atk: 3, def: 0, rank: 2, maxhp: 3 },
    Hade: { hp: 1, atk: 3, def: 1, rank: 2, maxhp: 1 },
    Kinnniku: { hp: 2, atk: 3, def: 2, rank: 2, maxhp: 2 },
    Syatiku: { hp: 8, atk: 1, def: 0, rank: 2, maxhp: 8 },
    Tetuya: { hp: 1, atk: 1, def: 0, rank: 2, maxhp: 1 },
    Innsyu: { hp: 3, atk: 3, def: 0, rank: 2, maxhp: 3 },
    Nakanuki: { hp: 3, atk: 2, def: 0, rank: 2, maxhp: 3 },
    Sekitori: { hp: 1, atk: 2, def: 0, rank: 2, maxhp: 1 },
    Tyuuni: { hp: 3, atk: 3, def: 0, rank: 2, maxhp: 3 },
    Zennjitu: { hp: 2, atk: 5, def: 1, rank: 3, maxhp: 2 },
    Yuugi: { hp: 3, atk: 1, def: 0, rank: 4, maxhp: 3 },
    Tobaku: { hp: 2, atk: 2, def: 0, rank: 3, maxhp: 2 },
    Kakomonn: { hp: 1, atk: 0, def: 0, rank: 3, maxhp: 1 },
    Hayabenn: { hp: 5, atk: 2, def: 0, rank: 3, maxhp: 5 },
    Tikoku: { hp: 5, atk: 5, def: 2, rank: 3, maxhp: 5 },
    Bukatu: { hp: 3, atk: 3, def: 2, rank: 3, maxhp: 3 },
    Doukoukai: { hp: 2, atk: 2, def: 4, rank: 3, maxhp: 2 },
    Saisi: { hp: 1, atk: 7, def: 0, rank: 3, maxhp: 1 },
    SNS: { hp: 2, atk: 2, def: 2, rank: 4, maxhp: 2 },
    Sumaho: { hp: 6, atk: 20, def: 4, rank: 4, maxhp: 6 },
    Nomikai: { hp: 8, atk: 0, def: 0, rank: 4, maxhp: 8 },
    Bakusui: { hp: 15, atk: 3, def: 4, rank: 4, maxhp: 15 },
    Namazu: { hp: 20, atk: 3, def: 5, rank: 4, maxhp: 20 },
    Kyousi: { hp: 8, atk: 5, def: 5, rank: 4, maxhp: 8 },
    GPT: { hp: 8, atk: 5, def: 5, rank: 4, maxhp: 8 },
    Tennsai: { hp: 10, atk: 10, def: 10, rank: 4, maxhp: 10 },
    Uma: { hp: 10, atk: 5, def: 5, rank: 4, maxhp: 10 },
    Majime: { hp: 15, atk: 6, def: 6, rank: 4, maxhp: 15 },
    PS4: { hp: 5, atk: 5, def: 0, rank: 0, maxhp: 5 },
    Switch: { hp: 5, atk: 2, def: 3, rank: 0, maxhp: 5 },
    PS5: { hp: 10, atk: 10, def: 10, rank: 0, maxhp: 10 },
    Switch2: { hp: 10, atk: 7, def: 7, rank: 0, maxhp: 10 },
    Facebook: { hp: 15, atk: 5, def: 5, rank: 0, maxhp: 15 },
    Twitter: { hp: 15, atk: 5, def: 2, rank: 0, maxhp: 15 },
    Instagram: { hp: 15, atk: 15, def: 5, rank: 0, maxhp: 15 },
    LINE: { hp: 15, atk: 10, def: 10, rank: 0, maxhp: 15 },
    Bannsyo: { hp: 2, atk: 1, def: 0, rank: 0, exp: 10, maxhp: 2 },
    Itiji: { hp: 5, atk: 13, def: 0, rank: 0, exp: 50, maxhp: 5 },
    Zeroji: { hp: 5, atk: 3, def: 5, rank: 0, exp: 50, maxhp: 5 },
    Phe: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Leu: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Val: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Ile: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Thr: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    His: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Trp: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Lys: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Met: { hp: 5, atk: 2, def: 0, rank: 0, exp: 50, maxhp: 10 },
    Miss: { hp: 5, atk: 2, def: 1, rank: 0, exp: 5, maxhp: 5 },
    Report: { hp: 12, atk: 3, def: 1, rank: 0, exp: 500, maxhp: 12 },
    SS: { hp: 15, atk: 5, def: 1, rank: 0, exp: 300, maxhp: 15 },
    SR: { hp: 25, atk: 3, def: 3, rank: 0, exp: 300, maxhp: 25 },
    Kasa: { hp: 10, atk: 7, def: 2, rank: 0, exp: 500, maxhp: 10 },
    Hako: { hp: 15, atk: 3, def: 5, rank: 0, exp: 500, maxhp: 20 },
    Gs: { hp: 15, atk: 0, def: 5, rank: 0, exp: 500, maxhp: 15 },
    Gi: { hp: 15, atk: 0, def: 0, rank: 0, exp: 500, maxhp: 15 },
    Gq: { hp: 15, atk: 0, def: 5, rank: 0, exp: 500, maxhp: 15 },
    PKA: { hp: 8, atk: 10, def: 2, rank: 0, exp: 100, maxhp: 8 },
    PKC: { hp: 10, atk: 5, def: 3, rank: 0, exp: 100, maxhp: 10 },
    Bannsyo2: { hp: 10, atk: 5, def: 3, rank: 0, exp: 500, maxhp: 10 },
    LMS3: { hp: 5, atk: 5, def: 2, rank: 0, exp: 500, maxhp: 5 },
    VD: { hp: 15, atk: 12, def: 8, rank: 0, exp: 1000, maxhp: 15 },
    VA: { hp: 15, atk: 12, def: 8, rank: 0, exp: 1000, maxhp: 15 },
    VK: { hp: 15, atk: 12, def: 8, rank: 0, exp: 1000, maxhp: 15 },
    VE: { hp: 15, atk: 12, def: 8, rank: 0, exp: 1000, maxhp: 15 },
    VB1: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB2: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB3: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB5: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB6: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB7: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB9: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    VB12: { hp: 10, atk: 6, def: 5, rank: 0, exp: 1000, maxhp: 10 },
    S1: { hp: 20, atk: 12, def: 6, rank: 0, exp: 2000, maxhp: 20 },
    S2: { hp: 20, atk: 12, def: 6, rank: 0, exp: 2000, maxhp: 20 },
    S3: { hp: 20, atk: 12, def: 6, rank: 0, exp: 2000, maxhp: 20 },
    S4: { hp: 20, atk: 12, def: 6, rank: 0, exp: 2000, maxhp: 20 },
    Dennsi: { hp: 5, atk: 12, def: 3, rank: 0, exp: 200, maxhp: 5 },
    Koukinnyaku: { hp: 15, atk: 12, def: 5, rank: 0, exp: 1000, maxhp: 15 },
    Kouuirusuyaku: { hp: 20, atk: 8, def: 3, rank: 0, exp: 1000, maxhp: 20 },
    Sou: { hp: 15, atk: 20, def: 0, rank: 0, exp: 1500, maxhp: 15 },
    Utu: { hp: 20, atk: 8, def: 8, rank: 0, exp: 1500, maxhp: 20 },
    Monndai: { hp: 50, atk: 15, def: 0, rank: 0, exp: 1500, maxhp: 50 },
    Menneki: { hp: 25, atk: 20, def: 8, rank: 0, exp: 3000, maxhp: 25 },
    Toukei: { hp: 25, atk: 15, def: 10, rank: 0, exp: 3000, maxhp: 25 },
    LMS4: { hp: 10, atk: 5, def: 3, rank: 0, exp: 2000, maxhp: 30 },
    S11: { hp: 40, atk: 20, def: 10, rank: 0, exp: 4000, maxhp: 40 },
    S12: { hp: 40, atk: 20, def: 10, rank: 0, exp: 4000, maxhp: 40 },
    S13: { hp: 40, atk: 20, def: 10, rank: 0, exp: 4000, maxhp: 40 },
    S14: { hp: 40, atk: 20, def: 10, rank: 0, exp: 4000, maxhp: 40 },
    Ia: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
    Ib: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
    Ic: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
    II: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
    III: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
    IV: { hp: 30, atk: 15, def: 7, rank: 0, exp: 6000, maxhp: 30 },
};

const NameStats = {
    Hosome: { hp: 12, atk: 0, def: 0, rank: 0, exp: 0, maxhp: 12 },
    Yoko: { hp: 5, atk: 0, def: 0, rank: 0, exp: 0, maxhp: 5 },
    Fujimonn: { hp: 8, atk: 0, def: 0, rank: 0, exp: 0, maxhp: 8 },
    Osiza: { hp: 10, atk: 5, def: 0, rank: 0, exp: 0, maxhp: 10 },
    Fukuda: { hp: 15, atk: 0, def: 0, rank: 0, exp: 0, maxhp: 15 },
    Hosome2: { hp: 12, atk: 0, def: 2, rank: 0, exp: 0, maxhp: 12 },
    Kisibe: { hp: 10, atk: 0, def: 2, rank: 0, exp: 0, maxhp: 10 },
    Aoine: { hp: 15, atk: 0, def: 2, rank: 0, exp: 0, maxhp: 15 },
    Bamorai: { hp: 20, atk: 0, def: 2, rank: 0, exp: 0, maxhp: 20 },
    Osiza2: { hp: 30, atk: 10, def: 2, rank: 0, exp: 0, maxhp: 30 },
    Kisibe2: { hp: 20, atk: 0, def: 2, rank: 0, exp: 0, maxhp: 20 },
    Takada: { hp: 15, atk: 0, def: 4, rank: 0, exp: 0, maxhp: 15 },
    Negiuji: { hp: 10, atk: 0, def: 4, rank: 0, exp: 0, maxhp: 10 },
    Wasino: { hp: 20, atk: 0, def: 4, rank: 0, exp: 0, maxhp: 20 },
    Rinnrinn: { hp: 25, atk: 0, def: 5, rank: 0, exp: 0, maxhp: 25 },
    Hiyama: { hp: 15, atk: 0, def: 3, rank: 0, exp: 0, maxhp: 15 },
    Sakagami: { hp: 20, atk: 0, def: 5, rank: 0, exp: 0, maxhp: 20 },
    Ozawa: { hp: 30, atk: 0, def: 50, rank: 0, exp: 0, maxhp: 30 },
    Atume: { hp: 30, atk: 15, def: 8, rank: 0, exp: 0, maxhp: 30 },
    Gake: { hp: 30, atk: 0, def: 6, rank: 0, exp: 0, maxhp: 30 },
    Kouiti: { hp: 25, atk: 0, def: 5, rank: 0, exp: 0, maxhp: 25 },
    Kimonn: { hp: 30, atk: 0, def: 6, rank: 0, exp: 0, maxhp: 30 },
    Hideki: { hp: 20, atk: 0, def: 3, rank: 0, exp: 0, maxhp: 30 },
    Atume2: { hp: 35, atk: 20, def: 10, rank: 0, exp: 0, maxhp: 35 },
    Sakagami2: { hp: 30, atk: 0, def: 10, rank: 0, exp: 0, maxhp: 30 },
    Osiza3: { hp: 90, atk: 30, def: 15, rank: 0, exp: 0, maxhp: 90 },
}
//自分の駒設定
let playerTeam = [
    { type: PieceType.Credit, row: 8, col: 4 },
    { type: PieceType.Student, row: 6, col: 1, name: "学生A", backname: "StudentA" },
    { type: PieceType.Student, row: 6, col: 2, name: "学生B", backname: "StudentB" },
    { type: PieceType.Student, row: 6, col: 3, name: "学生C", backname: "StudentC" },
    { type: PieceType.Student, row: 6, col: 5, name: "学生D", backname: "StudentD" },
    { type: PieceType.Student, row: 6, col: 6, name: "学生E", backname: "StudentE" },
    { type: PieceType.Student, row: 6, col: 7, name: "学生F", backname: "StudentF" },
    { type: PieceType.Student, row: 7, col: 1, name: "学生G", backname: "StudentG" },
    { type: PieceType.Student, row: 7, col: 2, name: "学生H", backname: "StudentH" },
    { type: PieceType.Student, row: 7, col: 3, name: "学生I", backname: "StudentI" },
    { type: PieceType.Student, row: 7, col: 5, name: "学生J", backname: "StudentJ" },
    { type: PieceType.Student, row: 7, col: 6, name: "学生K", backname: "StudentK" },
    { type: PieceType.Student, row: 7, col: 7, name: "学生L", backname: "StudentL" },
];

// 駒の設定
function createPiece(type, player, name = null, backname = null) {
    const Tstats = TypeStats[type] || {};
    const Nstats = NameStats[backname] || {};
    const piece = {
        type,
        player,
        hp: Nstats.hp ?? Tstats.hp,
        atk: Nstats.atk ?? Tstats.atk,
        def: Nstats.def ?? Tstats.def,
        rank: Nstats.rank ?? Tstats.rank,
        maxhp: Nstats.maxhp ?? Tstats.maxhp,
        baseHp: Nstats.hp ?? Tstats.hp,  // ← 追加
        baseAtk: Nstats.atk ?? Tstats.atk,
        baseDef: Nstats.def ?? Tstats.def,
        exp: Tstats.exp ?? 0, // ← ★ここでexpを設定
        ability: null,
        abilityName: null,
        outline: "",
        name: name,
        backname
    };


    // 特殊能力例：ヒーラー
    if (type === "HEALER" && player === 2) {
        piece.abilityName = "味方全体回復";
        piece.ability = function () {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const target = board[row][col];
                    if (target && target.player === 2 && target.hp < PieceStats[target.type].hp) {
                        target.hp += 1;
                    }
                }
            }
        };
    }



    if (type === "Credit") {
        piece.outline = `落としてはいけない。
        墜とされてもいけない。
        この駒は動かすことができない。
        HPが0になると落単。`
    }

    if (type === "Student") {
        piece.outline = `ごく普通の学生。
        しかし、無限の可能性を秘めている。`
    }

    if (type === "RepeaterStudent") {
        piece.outline = `留年してしまった学生。
        後がないため普通の学生より守りが硬い。
        音もなく消えていることが多い…`
    }

    if (type === "Irogami") {
        piece.outline = `
        髪染めした学生。
        金色に変化しても急激に強くなったりはしない。
        `
    }

    if (type === "Hade") {
        piece.outline = `
        派手な学生。
        服の主張が激しいことが特徴。
        「こっからはド派手に行くぜ！」
        `
    }

    if (type === "Kinnniku") {
        piece.outline = `
        筋肉筋肉筋肉筋肉筋肉筋肉筋肉筋肉
        筋肉は全てを解決する
        `
    }

    if (type === "Syatiku") {
        piece.outline = `
        週5以上でバイトを入れている猛者。
        バイトをこなすことで普通の学生より高い体力を手に入れた。
        `
    }

    if (type === "Tetuya") {
        piece.outline = `
        寝るという選択をしなかった者の末路。
        睡眠不足でほとんど体力はないがテンションがバグっているため行動範囲が広い。
        `
    }

    if (type === "Innsyu") {
        piece.outline = `
        酒に溺れた者。
        自分のターンが終了するたびに自動で1回動く。（動きは酔っているためランダム）
        `
    }

    if (type === "Nakanuki") {
        piece.outline = `
        授業の最初と最後にのみ出現するヤツ。
        ？？？「おそろしく速い中抜けオレでなきゃ見逃しちゃうね」（密告）
        `
    }

    if (type === "Kodoku") {
        piece.outline = `
        孤独、誰とも群れず行動する。
        だがそれは、寂しさの象徴ではない。
        むしろ、自らの歩幅で道を選び、誰の影にも覆われず、誰の声にも惑わされぬという・・・
        `
    }

    if (type === "Sekitori") {
        piece.outline = `
        休み時間に出没する。
        錯覚するだけで実際にはそこまで体は大きくない。
        `
    }

    if (type === "Tyuuni") {
        piece.outline = `
        それは暗黒の力に目覚めし者が、自らを“選ばれし存在”だと信じてしまう宿命の病…。
        しかし、世界は残酷にもその幻想を受け入れぬ。
        彼らの“漆黒の炎”も、“封印されし右腕”も、ただの日常の中に溶けてゆく。
        特に特別な能力があったりはしない
        `
    }

    if (type === "Zennjitu") {
        piece.outline = `
        全てを前の日に終わらせる者。
        前日に詰め込んだため、知識量は増えたが集中力が低下した。
        `
    }

    if (type === "Yuugi") {
        piece.outline = `
        14、17、20、25ターン目開始時にゲーム機を召喚する。
        ゲーム機に命と同じくらいの価値を感じてるため、破壊されると一緒に死ぬ。
        `
    }

    if (type === "Maeseki") {
        piece.outline = `
        `
    }

    if (type === "Tobaku") {
        piece.outline = `
        ギャンブラー。
        毎ターン開始時、4分の1の抽選をする。当たるとステータスが3倍、外れると半分になる。
        7、77、777ターン目開始時は確定で3倍になる。
        HPが0になると破滅する。
        `
    }

    if (type === "Hayabenn") {
        piece.outline = `
        昼食を食べる勢の中の一勢力。
        毎ターン開始時、自分と周囲1マスの味方のHPを1回復する。
        `
    }

    if (type === "Tikoku") {
        piece.outline = `
        ？？「遅刻は迷惑。」
        10ターン目に私が来た!
        10ターン目の開始時に自分の陣地に空きがあれば現れる。
        能力は超一流。
        `
    }

    if (type === "Bukatu") {
        piece.outline = `
        部活のヒト。
        人多すぎて誰が何年生か分からない。
        部活により普通の学生よりステータスが高い。
        `
    }

    if (type === "Doukoukai") {
        piece.outline = `
        友人に誘われたサークルに入ってみたら、いつのまにか入り浸ってる件
        普通の学生よりステータスが高いが、部活に比べると低い。
        `
    }

    if (type === "Saisi") {
        piece.outline = `
        再試を受けし者。
        初めから全てを再試にかける者も存在する...
        追い詰められているため、攻撃力が非常に高い。
        `
    }

    if (type === "SNS") {
        piece.outline = `
        ソーシャル・ネットワーキング・サービス。
        もはや、これ無しでは生きていけない世界が来ている。
        4、6、10、11ターン目開始時にFacebook、Twitter（現 X）、Instagram、LINEを召喚する。
        `
    }

    if (type === "Sumaho") {
        piece.outline = `
        生活必需品。
        歩きスマホをしているため、前にしか進めない。
        `
    }

    if (type === "Nomikai") {
        piece.outline = `
        揮発性の無色液体で、特有の芳香を持つものを集団で摂取する催し。
        自分のターン終了時に飲酒を1人召喚する。
        `
    }

    if (type === "Bakusui") {
        piece.outline = `
        とてつもなく深い眠りに陥ったもの。
        多少の刺激では起きることはない。
        毎ターン開始時に自身とその周囲1マスの味方のHPを5回復する。
        `
    }

    if (type === "Namazu") {
        piece.outline = `
        声がデカく、顔も広い。
        ヤバそうに見えて根は真面目。
        体力には自信がある。
        `
    }

    if (type === "Kyousi") {
        piece.outline = `
        他の学生に勉強を教えている学生。
        頼られすぎてもはや教師。
        5の倍数のターン開始時、自身と周囲1マスの味方の攻撃力と防御力を1上昇させる。
        `
    }

    if (type === "GPT") {
        piece.outline = `
        高度に発達した対話型生成AIサービス。
        的確な動きで相手を追い詰める。
        自分のターン終了時に自動で2回動く。
        `
    }

    if (type === "Tennsai") {
        piece.outline = `
        人の努力では至らないレベルの才能を秘めた人物。
        とにかくステータスが高く、移動範囲も優秀。
        `
    }

    if (type === "Uma") {
        piece.outline = `
        真面目で成績優秀。
        動きは将棋の馬と同じ。
        なぜか、有機化学が得意な気がする...
        `
    }

    if (type === "Kakomonn") {
        piece.outline = `
        過去問を配る人。
        過去問の重要性は大学生なら言わずもがな。
        8の倍数のターン開始時に周囲1マスの味方の攻撃力を1上げる。
        `
    }

    if (type === "Majime") {
        piece.outline = `
        真面目な学生。
        物事に対して真剣に取り組み、責任感を持って行動する。
        `
    }

    if (type === "PS4") {
        piece.outline = `
        進化したグラフィック性能や処理能力だけではなく、
        シェア機能など、前世代よりもSNSが普及した時代を反映した機能が特長。
        据え置き機のため移動範囲が狭いのが欠点。
        自分のターン終了時に自動で行動する。
        `
    }

    if (type === "Switch") {
        piece.outline = `
        据置型ゲーム機・携帯型ゲーム機として、
        プレイシーンに合わせて3つのプレイスタイルで遊べるように設計された。
        携帯可能なため移動範囲が広いのが特徴。
        自分のターン終了時に自動で行動する。
        `
    }

    if (type === "PS5") {
        piece.outline = `
        超高速SSDにより読み込み速度が飛躍的に向上している。
        自分のターン終了時に自動で行動する。
        PS4より的確に敵を撃破する。
        `
    }

    if (type === "Switch2") {
        piece.outline = `
        性能、デザイン、機能面が大幅に進化した。
        自分のターン終了時に自動で行動する。
        Switchより的確に敵を撃破する。
        `
    }

    if (type === "Facebook") {
        piece.outline = `
        元々は実名制のSNSとして広まり、
        強力なネットワークと情報収集能力を持つ。
        自分のターン終了時に自動で行動する。
    `;
    }

    if (type === "Twitter") {
        piece.outline = `
        リアルタイム性が高く、拡散力に優れたSNS。
        防御は低いが行動範囲が広い。
        自分のターン終了時に自動で行動する。
    `;
    }

    if (type === "Instagram") {
        piece.outline = `
        画像やビジュアル重視のSNS。
        攻撃力が高いのが特徴。
        自分のターン終了時に自動で行動する。
    `;
    }

    if (type === "LINE") {
        piece.outline = `
        日本国内で圧倒的な普及率を誇るコミュニケーションツール。
        防御力が高く、攻撃力も高水準である。
        自分のターン終了時に自動で行動する。
    `;
    }

    if (backname === "Hosome") {
        piece.outline = `
        常に細目でいる先生。
        人の体の構造について詳しそうな気がする。
        毎ターン開始時にLMSを召喚する。（12体まで）
        LMSを倒すとHPが減る。
    `;
    }

    if (backname === "Hosome2") {
        piece.outline = `
        常に細目でいる先生。
        人の体の構造について詳しそうな気がする。
        毎ターン開始時にLMSを召喚する。（12体まで）
        LMSを倒すとHPが減る。
    `;
    }

    if (type === "LMS") {
        piece.outline = `
        LearningMonSterの略。
        攻撃力、防御力、HPの全てが低く倒しやすい。
        `;
    }

    if (type === "LMS2") {
        piece.outline = `
        LearningMonSterの略。
        攻撃力、防御力、HPの全てが低く倒しやすい。
        `;
    }

    if (type === "Bannsyo") {
        piece.outline = `
        先生が板書したもの。
        板書した先生によってステータスが変わってくる。
        `;
    }

    if (backname === "Yoko") {
        piece.outline = `
        板書先生第一号。
        やたら原子の話をしそうな気がする。
        板書のステータスは低め。
    `;
    }

    if (type === "Zeroji") {
        piece.outline = `
        濃度に関係なく、一定速度で消失する反応。
        代謝酵素が飽和している状態で起こる。
        ５ターン経過するたびに防御力が下がる。
        `;
    }

    if (type === "Itiji") {
        piece.outline = `
        薬物の濃度に比例して消失する反応。
        体内の薬物が多いほど早く減る。
        プレイヤーの駒が減ると攻撃力が下がる。
        `;
    }

    if (backname === "Fujimonn") {
        piece.outline = `
        中年の男性。
        数学が苦手な人にも分かるように基礎の所から説明してくれる。
        後の統計学より計算は難しい…
    `;
    }

    if (backname === "Osiza") {
        piece.outline = `
        有機化学の鬼。
        高いステータスでプレイヤーを追い詰める。
        10ターンに1度HPを1回復する。
        まだ真の力は隠している。
    `;
    }

    if (backname === "Osiza2") {
        piece.outline = `
        有機化学の鬼。
        高いステータスでプレイヤーを追い詰める。
        前回よりパワーアップしており、5ターンに1度HPを3回復する。
    `;
    }

    if (backname === "Fukuda") {
        piece.outline = `
        小テストが多い先生。
        必須アミノ酸を操り攻撃してくる。
        それぞれのアミノ酸で動き方が違う。
    `;
    }

    if (type === "Phe") {
        piece.outline = `
        芳香族アミノ酸。神経伝達物質の材料に。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Leu") {
        piece.outline = `
        BCAA。筋合成を促進。ボディビルで注目される。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Val") {
        piece.outline = `
        BCAA。筋肉のエネルギー源。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Ile") {
        piece.outline = `
        BCAAの1つ。筋肉の修復・回復に関わる。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Thr") {
        piece.outline = `
        成長や肝機能に関与。コラーゲン合成にも。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "His") {
        piece.outline = `
        小児期に必須。ヘモグロビンの材料。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Trp") {
        piece.outline = `
        精神安定に関係するセロトニンの前駆体。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Lys") {
        piece.outline = `
        成長や免疫機能に必要。穀物に不足しがち。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (type === "Met") {
        piece.outline = `
        含硫アミノ酸。肝機能や脂肪代謝を助ける。
        それぞれのアミノ酸で動き方が違う。
        `
    }

    if (backname === "Kisibe") {
        piece.outline = `
        漫画を描きそうな名前をしているが別人。
        3ターンに1回問題ミスを生み出して攻撃してくる。
    `;
    }

    if (type === "Miss") {
        piece.outline = `
        とある先生により生み出された問題ミス。
        無限に出てくるが、経験値は高くない。
        `
    }

    if (type === "Report") {
        piece.outline = `
        レポート。
        圧倒的な物量で生徒を苦しめる。
        細かい指定に疑問を抱くのは自分だけではないはず...
        `
    }

    if (type === "SS") {
        piece.outline = `
        標準液。
        濃度が正確にわかっている溶液。
        滴定や定量分析で使われる。
        `
    }

    if (type === "SR") {
        piece.outline = `
        標準試薬。
        純度が非常に高く、定量分析に使用できる化学薬品。
        標準液を作るための元になる固体または液体の薬品。
        非常に安定な物質のため防御力が高い。
        `
    }

    if (type === "Kasa") {
        piece.outline = `
        普通のビニール傘。
        ただそれだけ、説明を考えるのが面倒だった訳ではない…
        `
    }

    if (type === "Hako") {
        piece.outline = `
        風船の取り付けられた段ボール箱。
        ただそれだけ、説明を考えるのが面倒だった訳ではない…
        `
    }

    if (type === "LMS3") {
        piece.outline = `
        カラフルに装飾されたLMS。
        ステータスは上昇したが、移動範囲は変わらない。
        `
    }

    if (type === "Bannsyo2") {
        piece.outline = `
        先生が板書したもの。
        板書した先生によってステータスが変わってくる。
        `
    }

    if (type === "Gs") {
        piece.outline = `
        Gs共役型受容体。
        アデニル酸シクラーゼを活性化することで、cAMPを増加させる。
        10の倍数のターン開始時、PKAを2体召喚する。
        `
    }

    if (type === "Gi") {
        piece.outline = `
        Gi共役型受容体。
        アデニル酸シクラーゼの活性を抑制することで、cAMPを減少させる。
        10の倍数のターン開始時、召喚されるPKAを1体減らす。
        `
    }

    if (type === "Gq") {
        piece.outline = `
        Gq共役型受容体。
        ホスホリパーゼcを活性化することで、イノシトール3リン酸とジアシルグリセロールを増加させる。
        10の倍数ターン開始時、PKCを1体召喚する。
        `
    }

    if (type === "PKA") {
        piece.outline = `
        プロテインキナーゼA。
        タンパク質をリン酸化することにより、さまざまな機能の調節を行う。
        `
    }

    if (type === "PKC") {
        piece.outline = `
        プロテインキナーゼC。
        タンパク質をリン酸化することにより、さまざまな機能の調節を行う。
        `
    }

    if (type === "VD") {
        piece.outline = `
        脂溶性ビタミンであるビタミンD。
        血中のカルシウム濃度を調節する。
        `
    }

    if (type === "VA") {
        piece.outline = `
        脂溶性ビタミンであるビタミンA。
        視覚や細胞分化に関わる。
        `
    }

    if (type === "VK") {
        piece.outline = `
        脂溶性ビタミンであるビタミンK。
        血液凝固や骨の形成などを担う。
        `
    }

    if (type === "VE") {
        piece.outline = `
        脂溶性ビタミンであるビタミンE。
        抗酸化作用がある。
        `
    }

    if (type === "VC") {
        piece.outline = `
        水溶性ビタミンであるビタミンC。
        抗酸化作用を持つ。
        `
    }

    if (type === "VB1") {
        piece.outline = `
        ビタミンB1
        水溶性ビタミンであるチアミン。
        糖代謝に関与する補酵素。
        `
    }

    if (type === "VB2") {
        piece.outline = `
        ビタミンB2
        水溶性ビタミンであるリボフラビン。
        生体内の酸化・還元に関わる。
        `
    }

    if (type === "VB3") {
        piece.outline = `
        ビタミンB3
        水溶性ビタミンであるナイアシン。
        生体内の酸化・還元に関わる。
        `
    }

    if (type === "VB5") {
        piece.outline = `
        ビタミンB5
        水溶性ビタミンであるパントテン酸。
        補酵素であるCoAの成分。
        `
    }

    if (type === "VB6") {
        piece.outline = `
        ビタミンB6
        水溶性ビタミンであるピリドキシン。
        アミノ酸代謝に関する補酵素。
        `
    }

    if (type === "VB7") {
        piece.outline = `
        ビタミンB7
        水溶性ビタミンであるビオチン。
        脂肪酸合成や糖新生の炭酸固定を担う。
        `
    }

    if (type === "VB9") {
        piece.outline = `
        ビタミンB9
        水溶性ビタミンである葉酸。
        DNA合成に必要。
        `
    }

    if (type === "VB12") {
        piece.outline = `
        ビタミンB12
        水溶性ビタミンであるコバラミン。
        DNA合成などに関与している。
        `
    }

    if (backname === "Kisibe2") {
        piece.outline = `
        漫画を描きそうな名前をしているが別人。
        2ターンに1回問題ミスを生み出して攻撃してくる。
    `;
    }

    if (backname === "Wasino") {
        piece.outline = `
        大道芸人。
        授業の大半が復習であることが特徴。
        傘や段ボールの箱を使いものボケをする。
    `;
    }

    if (backname === "Takada") {
        piece.outline = `
        LMSの使い手。
        カラフルに装飾されたLMSを召喚して戦う。
    `;
    }

    if (backname === "Negiuji") {
        piece.outline = `
        板書先生第2号。
        ステータスの上昇した板書を召喚し、戦う。
    `;
    }

    if (backname === "Rinnrinn") {
        piece.outline = `
        薬理の基礎を叩き込んでくる。
        Gタンパク質共役型受容体を使用してくる。
    `;
    }

    if (backname === "Gake") {
        piece.outline = `
        おにぎりを持ってくる人。
        ビタミンを操り戦う。
        3の倍数のターン開始時に全てのビタミンのHPを回復する。
    `;
    }

    if (backname === "Bamorai") {
        piece.outline = `
        会うことができないと言われている幻の先生。
        標準試薬（SS）と標準液（SR）を操り、進級を妨げる。
    `;
    }

    if (backname === "Aoine") {
        piece.outline = `
        生徒から恐れられている先生。
        大量のレポート（提出物）で攻撃してくる。
    `;
    }

    if (type === "Dennsi") {
        piece.outline = `
        素粒子の一種。負の電気量を持つ、原子の構成要素の一つ。
        攻撃力は高いがHPと防御力が低く脆い。
        `
    }

    if (type === "Koukinnyaku") {
        piece.outline = `
        細菌の活動を抑制したり、細菌を殺したりすることで感染症を治療する薬。
        `
    }

    if (type === "Kouuirusuyaku") {
        piece.outline = `
        ウイルスによる感染症を治療または予防するために使用される薬。
        `
    }

    if (type === "Sou") {
        piece.outline = `
        躁状態。
        病的なまでに気分が高揚して、開放的になったり怒りっぽくなったりした状態。
        `
    }

    if (type === "Utu") {
        piece.outline = `
        鬱状態。
        憂うつな気持ちがあったり気分が落ち込んだりする症状。
        `
    }

    if (type === "S1") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S2") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S3") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S4") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "Monndai") {
        piece.outline = `
        康一により作り出された問題。
        正誤問題だが量が異常に多い。
        HPがとにかく高い。
        `
    }

    if (type === "Menneki") {
        piece.outline = `
        ウイルスや細菌などの異物から身体を守る仕組みであり、
        自然免疫と獲得免疫の2種類に分類される。
        `
    }

    if (type === "Toukei") {
        piece.outline = `
        あるものの状態を数値によって精確に知るため、
        実測したデータを元に計算した数値、あるいはそれを多数ひとまとめにしたもの。
        `
    }

    if (type === "LMS4") {
        piece.outline = `
        LearningMonSterの略。
        攻撃力、防御力、HPの全てが低く倒しやすい。
        `
    }

    if (type === "S11") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S12") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S13") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "S14") {
        piece.outline = `
        暑目によって作られたシーン。
        広い行動範囲が脅威。
        倒すと厚目のHPを減らすことができる。
        `
    }

    if (type === "Ia") {
        piece.outline = `
        抗不整脈薬のIa群。
        ナトリウム（Na）チャネル遮断作用とカリウム（K）チャネル遮断作用を併せ持ち、
        活動電位持続時間と不応期を延長させることで不整脈を抑制する。
        `
    }


    if (type === "Ib") {
        piece.outline = `
        抗不整脈薬のIb群。
        ナトリウム（Na+）チャネル遮断薬に分類され、活動電位の持続時間を短縮させる作用を持ち、
        主に心室性不整脈（特に虚血性心疾患によるもの）の抑制する。
        `
    }


    if (type === "Ic") {
        piece.outline = `
        抗不整脈薬のIc群。
        ナトリウム（Na+）チャネルを遮断する薬であり、心房細動や心室頻拍などの治療に使われる。
        `
    }

    if (type === "II") {
        piece.outline = `
        抗不整脈薬の II群。
        アドレナリンβ受容体遮断薬（β遮断薬）に分類され、交感神経の働きを抑える。
        `
    }

    if (type === "III") {
        piece.outline = `
        抗不整脈薬の III群。
        カリウムチャネル遮断薬で心筋細胞の活動電位持続時間を延長させ、不応期を長くすることで不整脈を抑制する。
        `
    }

    if (type === "IV") {
        piece.outline = `
        抗不整脈薬の IV群。
        カルシウムチャネル遮断薬（非ジヒドロピリジン系）に分類され、洞結節や房室結節での興奮・伝導を抑制する。
        `
    }

    if (backname === "Hiyama") {
        piece.outline = `
        電子の移動についてやたら詳しく解説する。
        毎ターン開始時電子を召喚する。
    `;
    }

    if (backname === "Sakagami") {
        piece.outline = `
        講義の後半で加速する。
        5の倍数のターン開始時に味方の攻撃力、防御力を1上昇させる。
    `;
    }

    if (backname === "Ozawa") {
        piece.outline = `
        気持ちの浮き沈みが激しい。
        躁と鬱を生み出して戦う。
        2つを倒すことでHPを0にすることができる。
    `;
    }

    if (backname === "Atume") {
        piece.outline = `
        ピンマイクの人。
        さまざまなシーンを使い生徒を追い詰める。
        本人の行動範囲は広くない。
    `;
    }

    if (backname === "Kouuiti") {
        piece.outline = `
        圧倒的な問題量で生徒を破壊する。
        音を実体化させたり、物を重くするスタンドが使えるかもしれない？
    `;
    }

    if (backname === "Kimonn") {
        piece.outline = `
        統計と免疫の二つで登場する。
        1ターンに2回行動する。
    `;
    }

    if (backname === "Hideki") {
        piece.outline = `
        笑顔で煽りし者。
        3の倍数のターン開始時に相手の攻撃力と防御力を1下げる。
    `;
    }

    if (backname === "Atume2") {
        piece.outline = `
        再び現れたピンマイクの人。
        前回よりステータスが上昇している。
    `;
    }

    if (backname === "Sakagami2") {
        piece.outline = `
        講義の後半で加速する。
        毎ターン開始時に味方の攻撃力と防御力を1上昇させる。
    `;
    }

    if (backname === "Osiza3") {
        piece.outline = `
        無限再試編　忍座再来　
        再び現れた忍座。
        非常に高いステータスと行動範囲を持っている。
        1ターンに2回行動し、毎ターン開始時HPを3回復する。
    `;
    }



    return piece;
}


//ステージの設定（敵駒配置）
const stageData = {
    1: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "細目", backname: "Hosome" },
            { type: PieceType.LMS, row: 1, col: 4, }
        ]
    },
    2: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "誉子", backname: "Yoko" },
            { type: PieceType.Bannsyo, row: 2, col: 2 },
            { type: PieceType.Bannsyo, row: 2, col: 3 },
            { type: PieceType.Bannsyo, row: 2, col: 4 },
            { type: PieceType.Bannsyo, row: 2, col: 5 },
            { type: PieceType.Bannsyo, row: 2, col: 6 },
        ]
    },
    3: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "藤文", backname: "Fujimonn" },
            { type: PieceType.Itiji, row: 0, col: 2 },
            { type: PieceType.Zeroji, row: 0, col: 6 },
        ]
    },
    4: {
        enemies: [
            { type: PieceType.Teachermove, row: 0, col: 4, name: "忍座", backname: "Osiza" },
        ]
    },
    5: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "腹墜", backname: "Fukuda" },
            { type: PieceType.Phe, row: 1, col: 5 },
            { type: PieceType.Leu, row: 2, col: 3 },
            { type: PieceType.Val, row: 3, col: 4 },
            { type: PieceType.Ile, row: 0, col: 3 },
            { type: PieceType.Thr, row: 1, col: 3 },
            { type: PieceType.His, row: 2, col: 5 },
            { type: PieceType.Trp, row: 0, col: 5 },
            { type: PieceType.Lys, row: 2, col: 4 },
            { type: PieceType.Met, row: 1, col: 4 },
        ]
    },
    6: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "細目", backname: "Hosome2" },
            { type: PieceType.LMS2, row: 1, col: 4, },
        ]
    },
    7: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "岸辺", backname: "Kisibe" },
            { type: PieceType.Miss, row: 2, col: 3, },
            { type: PieceType.Miss, row: 2, col: 4, },
            { type: PieceType.Miss, row: 2, col: 5, },
        ]
    },
    8: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "葵根", backname: "Aoine" },
            { type: PieceType.Report, row: 1, col: 1, },
            { type: PieceType.Report, row: 1, col: 2, },
            { type: PieceType.Report, row: 1, col: 3, },
            { type: PieceType.Report, row: 1, col: 4, },
            { type: PieceType.Report, row: 1, col: 5, },
            { type: PieceType.Report, row: 1, col: 6, },
            { type: PieceType.Report, row: 1, col: 7, },
            { type: PieceType.Report, row: 1, col: 8, },
            { type: PieceType.Report, row: 1, col: 0, },
        ]
    },
    9: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "馬貰", backname: "Bamorai" },
            { type: PieceType.SS, row: 2, col: 2, },
            { type: PieceType.SR, row: 2, col: 6, },
        ]
    },
    10: {
        enemies: [
            { type: PieceType.Teachermove2, row: 0, col: 4, name: "忍座", backname: "Osiza2" },
        ]
    },
    11: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "岸辺", backname: "Kisibe2" },
            { type: PieceType.Miss, row: 2, col: 3, },
            { type: PieceType.Miss, row: 2, col: 4, },
            { type: PieceType.Miss, row: 2, col: 5, },
            { type: PieceType.Miss, row: 2, col: 2, },
            { type: PieceType.Miss, row: 2, col: 6, },
        ]
    },
    12: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "高田", backname: "Takada" },
            { type: PieceType.LMS3, row: 1, col: 0, },
            { type: PieceType.LMS3, row: 1, col: 1, },
            { type: PieceType.LMS3, row: 1, col: 2, },
            { type: PieceType.LMS3, row: 1, col: 3, },
            { type: PieceType.LMS3, row: 1, col: 4, },
            { type: PieceType.LMS3, row: 1, col: 5, },
            { type: PieceType.LMS3, row: 1, col: 6, },
            { type: PieceType.LMS3, row: 1, col: 7, },
            { type: PieceType.LMS3, row: 1, col: 8, },
        ]
    },
    13: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "葱氏", backname: "Negiuji" },
            { type: PieceType.Bannsyo2, row: 2, col: 2 },
            { type: PieceType.Bannsyo2, row: 2, col: 3 },
            { type: PieceType.Bannsyo2, row: 2, col: 4 },
            { type: PieceType.Bannsyo2, row: 2, col: 5 },
            { type: PieceType.Bannsyo2, row: 2, col: 6 },
        ]
    },
    14: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "鷲野", backname: "Wasino" },
            { type: PieceType.Hako, row: 0, col: 2, },
            { type: PieceType.Kasa, row: 0, col: 6, },
        ]
    },
    15: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "林麻", backname: "Rinnrinn" },
            { type: PieceType.Gs, row: 0, col: 0, },
            { type: PieceType.Gq, row: 0, col: 8, },
            { type: PieceType.Gi, row: 1, col: 4, },
            { type: PieceType.PKA, row: 2, col: 1, },
            { type: PieceType.PKA, row: 2, col: 2, },
            { type: PieceType.PKA, row: 2, col: 3, },
            { type: PieceType.PKC, row: 2, col: 5, },
            { type: PieceType.PKC, row: 2, col: 6, },
            { type: PieceType.PKC, row: 2, col: 7, },
        ]
    },
    16: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "檜山", backname: "Hiyama" },
            { type: PieceType.Dennsi, row: 2, col: 4, },
        ]
    },
    17: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "坂上", backname: "Sakagami" },
            { type: PieceType.Koukinnyaku, row: 2, col: 2, },
            { type: PieceType.Kouuirusuyaku, row: 2, col: 6, },
        ]
    },
    18: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "小澤", backname: "Ozawa" },
            { type: PieceType.Sou, row: 2, col: 2, },
            { type: PieceType.Utu, row: 2, col: 6, },
        ]
    },
    19: {
        enemies: [
            { type: PieceType.Teachermove11, row: 0, col: 4, name: "暑目", backname: "Atume" },
            { type: PieceType.S1, row: 0, col: 0, },
            { type: PieceType.S2, row: 1, col: 8, },
            { type: PieceType.S3, row: 2, col: 0, },
            { type: PieceType.S4, row: 2, col: 4, },
        ]
    },
    20: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "崖", backname: "Gake" },
            { type: PieceType.VD, row: 0, col: 3, },
            { type: PieceType.VA, row: 0, col: 5, },
            { type: PieceType.VK, row: 0, col: 2, },
            { type: PieceType.VE, row: 0, col: 6, },
            { type: PieceType.VB1, row: 2, col: 4, },
            { type: PieceType.VB2, row: 1, col: 3, },
            { type: PieceType.VB3, row: 1, col: 4, },
            { type: PieceType.VB5, row: 1, col: 5, },
            { type: PieceType.VB6, row: 1, col: 6, },
            { type: PieceType.VB7, row: 2, col: 3, },
            { type: PieceType.VB9, row: 2, col: 5, },
            { type: PieceType.VB12, row: 1, col: 2, },
        ]
    },
    21: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "康一", backname: "Kouiti" },
            { type: PieceType.Monndai, row: 0, col: 0, },
            { type: PieceType.Monndai, row: 0, col: 1, },
            { type: PieceType.Monndai, row: 0, col: 2, },
            { type: PieceType.Monndai, row: 0, col: 3, },
            { type: PieceType.Monndai, row: 0, col: 5, },
            { type: PieceType.Monndai, row: 0, col: 6, },
            { type: PieceType.Monndai, row: 0, col: 7, },
            { type: PieceType.Monndai, row: 0, col: 8, },
            { type: PieceType.Monndai, row: 1, col: 0, },
            { type: PieceType.Monndai, row: 1, col: 1, },
            { type: PieceType.Monndai, row: 1, col: 2, },
            { type: PieceType.Monndai, row: 1, col: 3, },
            { type: PieceType.Monndai, row: 1, col: 5, },
            { type: PieceType.Monndai, row: 1, col: 6, },
            { type: PieceType.Monndai, row: 1, col: 7, },
            { type: PieceType.Monndai, row: 1, col: 8, },
            { type: PieceType.Monndai, row: 1, col: 4, },
            { type: PieceType.Monndai, row: 2, col: 0, },
            { type: PieceType.Monndai, row: 2, col: 1, },
            { type: PieceType.Monndai, row: 2, col: 2, },
            { type: PieceType.Monndai, row: 2, col: 3, },
            { type: PieceType.Monndai, row: 2, col: 5, },
            { type: PieceType.Monndai, row: 2, col: 6, },
            { type: PieceType.Monndai, row: 2, col: 7, },
            { type: PieceType.Monndai, row: 2, col: 8, },
            { type: PieceType.Monndai, row: 2, col: 4, },
            { type: PieceType.Monndai, row: 3, col: 0, },
            { type: PieceType.Monndai, row: 3, col: 1, },
            { type: PieceType.Monndai, row: 3, col: 2, },
            { type: PieceType.Monndai, row: 3, col: 3, },
            { type: PieceType.Monndai, row: 3, col: 5, },
            { type: PieceType.Monndai, row: 3, col: 6, },
            { type: PieceType.Monndai, row: 3, col: 7, },
            { type: PieceType.Monndai, row: 3, col: 8, },
            { type: PieceType.Monndai, row: 3, col: 4, },
        ]
    },
    22: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "木門", backname: "Kimonn" },
            { type: PieceType.Toukei, row: 2, col: 2, },
            { type: PieceType.Menneki, row: 2, col: 6, },
        ]
    },
    23: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "非出来", backname: "Hideki" },
            { type: PieceType.LMS4, row: 2, col: 0, },
            { type: PieceType.LMS4, row: 2, col: 1, },
            { type: PieceType.LMS4, row: 2, col: 2, },
            { type: PieceType.LMS4, row: 2, col: 3, },
            { type: PieceType.LMS4, row: 2, col: 4, },
            { type: PieceType.LMS4, row: 2, col: 5, },
            { type: PieceType.LMS4, row: 2, col: 6, },
            { type: PieceType.LMS4, row: 2, col: 7, },
            { type: PieceType.LMS4, row: 2, col: 8, },
        ]
    },
    24: {
        enemies: [
            { type: PieceType.Teachermove12, row: 0, col: 4, name: "暑目", backname: "Atume2" },
            { type: PieceType.S11, row: 0, col: 0, },
            { type: PieceType.S12, row: 1, col: 8, },
            { type: PieceType.S13, row: 2, col: 0, },
            { type: PieceType.S14, row: 2, col: 4, },
        ]
    },
    25: {
        enemies: [
            { type: PieceType.Teacher, row: 0, col: 4, name: "坂上", backname: "Sakagami2" },
            { type: PieceType.Ia, row: 2, col: 3, },
            { type: PieceType.Ib, row: 2, col: 5, },
            { type: PieceType.Ic, row: 1, col: 2, },
            { type: PieceType.II, row: 1, col: 6, },
            { type: PieceType.III, row: 0, col: 1, },
            { type: PieceType.IV, row: 0, col: 7, },
        ]
    },
    26: {
        enemies: [
            { type: PieceType.Teachermove3, row: 0, col: 4, name: "忍座", backname: "Osiza3" },
        ]
    },

};



let customPlayerTeam = JSON.parse(JSON.stringify(playerTeam)); // ディープコピー
customPlayerTeam = customPlayerTeam.map(p => ({ ...p, player: 1 }));


canvas.addEventListener("click", handleClick);

//BGM開始設定
StartBtn.addEventListener("click", (e) => {
    if (!bgmStarted) {
        bgm.play();
        bgmStarted = true;
    }
});

ContinueBtn.addEventListener("click", (e) => {
    if (!bgmStarted) {
        bgm.play();
        bgmStarted = true;
    }
});

// クリック設定
function handleClick(event) {
    if (currentPlayer !== 1) return; // ユーザーはplayer1だけ操作可能！


    const x = event.offsetX;
    const y = event.offsetY;
    const row = Math.floor(y / TILE_SIZE);
    const col = Math.floor(x / TILE_SIZE);

    if (selected) {
        const fromRow = selected.row;
        const fromCol = selected.col;
        const piece = board[fromRow][fromCol];

        if (isValidMove(piece, fromRow, fromCol, row, col)
            && (!board[row][col] || board[row][col].player !== currentPlayer)) {
            movePiece(fromRow, fromCol, row, col);
            console.log(exp);
            selected = null;
            validMoves = []; // ★ハイライトリセット
            clearPieceInfo();// 移動処理後は情報消すか、もしくは移動先の駒情報を表示してもよい
            const gameEnded = checkKingDefeatedAfterTurn();
            if (!gameEnded) {
                removeDeadPieces()
                playerendtturnmove();
                currentPlayer = 2;
                setTimeout(cpuMove, 500);
                turnCount += 1;
                updateTurnDisplay();
                startturnmove();
            }
        } else {
            selected = null;
            validMoves = [];
            clearPieceInfo(); // 移動できなければ情報クリア
        }

    } else {
        const clicked = board[row][col];

        if (clicked) {
            if (clicked.player === currentPlayer) {
                // 自分の駒：選択して移動可能マス表示
                selected = { row, col };
                validMoves = getValidMoves(clicked, row, col);
            }
            // どちらのプレイヤーでも駒情報を表示（★ここがポイント）
            showPieceInfo(clicked);
        } else {
            clearPieceInfo();
        }
    }
    draw(ctx, canvas);
}
// 駒の説明
function showPieceInfo(piece) {
    lastSelectedPiece = piece; // ← ここを追加！

    const infoDiv = document.getElementById("pieceInfo");
    const moveDiv = document.getElementById("moveInfo");
    const moveGrid = document.getElementById("moveGrid");
    const baseStats = NameStats[piece.backname] ?? TypeStats[piece.type];
    const displayName = getDisplayName(piece.type);
    const maxhp = piece.maxhp;

    // ステータスと説明
    // アップグレードを取得
    const upgrade = playerUpgrades[piece.name] || {};

    // 強化値の取得
    const hpBoost = upgrade.hp || 0;
    const atkBoost = upgrade.atk || 0;
    const defBoost = upgrade.def || 0;

    // 現在値から強化分を引いて基礎値を算出
    const baseHp = piece.hp - hpBoost;
    const baseAtk = piece.atk - atkBoost;
    const baseDef = piece.def - defBoost;

    // 表示用の関数
    const formatStat = (base, boost) => {
        return boost > 0 ? `${base}（+${boost}）` : `${base}`;
    };

    // innerHTML に反映
    infoDiv.innerHTML = `
    <h3 style="color: #faf7f7ff;">選択中の駒</h3>
    <h3 style="color: #fcfafaff;">${displayName}${piece.name ? `（${piece.name}）` : ''}</h3
    <p><span style="color:#0f0;">HP:</span> ${piece.hp} / ${maxhp} ${hpBoost > 0 ? `（+${hpBoost}）` : ''}</p>
    <p><span style="color:#f55;">攻撃力:</span> ${formatStat(baseAtk, atkBoost)}</p>
    <p><span style="color:#55f;">防御力:</span> ${formatStat(baseDef, defBoost)}</p>
    ${piece.abilityName ? `<p style="color:#ff0;">能力: ${piece.abilityName}</p>` : ''}
    ${piece.abilityDescription ? `<p style="font-size: 0.9em; color: #aaa;">${piece.abilityDescription}</p>` : ''}
    <p style="margin-top:8px;">＜説明＞</p>
    <p style="font-size: 13px;">${piece.outline}</p>
    `;

    // === 移動パターン描画 ===
    const size = 9;
    const grid = [];
    let moveList = movepattern(piece);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (r === 4 && c === 4) {
                cell.textContent = getDisplayName(piece.type);
                cell.classList.add("center");
            }
            grid.push(cell);
        }
    }

    for (const [dr, dc] of moveList) {
        const r = 4 + dr;
        const c = 4 + dc;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            const index = r * 9 + c;
            grid[index].classList.add("move");
        }
    }

    moveGrid.innerHTML = "";
    for (const cell of grid) {
        moveGrid.appendChild(cell);
    }
}

// 駒の説明の解除
function clearPieceInfo() {
    const infoDiv = document.getElementById("pieceInfo");

    if (lastSelectedPiece) {
        // 選択駒が記録されているなら再表示
        showPieceInfo(lastSelectedPiece);
    } else {
        infoDiv.innerHTML = '';
    }
}


// 単位の動き（動かない）
const CreditMoves = [

];
// 先生の動き 動かない
const TeacherMoves = [

];
// 学生の動き　上下左右１マス
const StudentMoves = [
    [-1, 0],
    [0, -1], [0, 1],
    [1, 0]
];
// LMSの動き　下１マス
const LMSMoves = [
    [1, 0]
];
// 筋肉の動き　上１マス
const KinnnikuMoves = [
    [-1, 0]
];
// 中抜の動き　上下左右2マス間なし
const NakanukiMoves = [
    [-2, 0],
    [0, -2], [0, 2],
    [2, 0],
];
// 派手の動き　上下4マス
const HadeMoves = [
    [-4, 0],
    [-3, 0],
    [-2, 0],
    [-1, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
];
// 関取の動き　上方3マス下１マス
const SekitoriMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [1, 0],
];
// 中二の動き　上１マス斜め上１マス
const TyuuniMoves = [
    [-1, -1], [-1, 0], [-1, 1]
];
// 遊戯の動き　王
const YuugiMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
];
// 再試の動き 上５マス
const SaisiMoves = [
    [-5, 0],
    [-4, 0],
    [-3, 0],
    [-2, 0],
    [-1, 0],
];
// 遅刻の動き 斜め１マス
const TikokuMoves = [
    [-1, -1], [-1, 1],
    [1, -1], [1, 1],
];
// 馬の動き 斜め８マス
const UmaMoves = [
    [-8, -8], [-8, 8],
    [-7, -7], [-7, 7],
    [-6, -6], [-6, 6],
    [-5, -5], [-5, 5],
    [-4, -4], [-4, 4],
    [-3, -3], [-3, 3],
    [-2, -2], [-2, 2],
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
    [2, -2], [2, 2],
    [3, -3], [3, 3],
    [4, -4], [4, 4],
    [5, -5], [5, 5],
    [6, -6], [6, 6],
    [7, -7], [7, 7],
    [8, -8], [8, 8],
];
//　Switchの動き
const SwitchMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -2], [0, -1], [0, 1], [0, 2],
    [1, -1], [1, 0], [1, 1],
    [2, -2], [2, 0], [2, 2],
]
//ゼロ次反応式　斜め2マス
const ZerojiMoves = [
    [-2, -2], [-2, 2],
    [-1, -1], [-1, 1],
    [1, -1], [1, 1],
    [2, -2], [2, 2],
]
//1次反応式 縦横2マス
const ItijiMoves = [
    [-2, 0],
    [-1, 0],
    [0, -2], [0, -1], [0, 1], [0, 2],
    [1, 0],
    [2, 0],
]
//Phe 下円
const PheMoves = [
    [1, 0],
    [2, -1], [2, 1],
    [3, 0],
]
//Val 下１マス二股
const ValMoves = [
    [1, 0],
    [2, -1], [2, 1],
]
//Leu 下2マス二股
const LeuMoves = [
    [1, 0],
    [2, 0],
    [3, -1], [3, 1],
]
//Ile 下３マス右下１マス
const IleMoves = [
    [1, 0], [1, 1],
    [2, 0],
    [3, 0],
]
//Thr 下2マス右下１マス
const ThrMoves = [
    [1, 0], [1, 1],
    [2, 0],
]
//Lys 下4マス
const LysMoves = [
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
]
//金
const GoldMoves = [
    [-1, 0],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
]
//銀
const SilverMoves = [
    [-1, -1], [-1, 1],
    [1, -1], [1, 0], [1, 1]
]
//傘
const KasaMoves = [
    [-2, -1], [-2, 0],
    [-1, 0],
    [1, -2], [1, 0], [1, 2],
    [2, -1], [2, 0], [2, 1],
    [3, 0],
]
//電子
const DennsiMoves = [
    [1, 0],
    [2, 0],
    [3, 0],
]
//S1
const S1Moves = [
    [0, -8], [0, -7], [0, -6], [0, -5], [0, -4], [0, -3], [0, -2], [0, -1],
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
]
//忍座
const OsizaMoves = [
    [-8, -8], [-8, 0], [-8, 8],
    [-7, -7], [-7, 0], [-7, 7],
    [-6, -6], [-6, 0], [-6, 6],
    [-5, -5], [-5, 0], [-5, 5],
    [-4, -4], [-4, 0], [-4, 4],
    [-3, -3], [-3, 0], [-3, 3],
    [-2, -2], [-2, 0], [-2, 2],
    [-1, -1], [-1, 0], [-1, 1],
    [0, -8], [0, -7], [0, -6], [0, -5], [0, -4], [0, -3], [0, -2], [0, -1],
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
    [8, -8], [8, 0], [8, 8],
    [7, -7], [7, 0], [7, 7],
    [6, -6], [6, 0], [6, 6],
    [5, -5], [5, 0], [5, 5],
    [4, -4], [4, 0], [4, 4],
    [3, -3], [3, 0], [3, 3],
    [2, -2], [2, 0], [2, 2],
    [1, -1], [1, 0], [1, 1],
]




//上下左右1マスのタイプ
const studentTypes = new Set([
    PieceType.Student,
    PieceType.Irogami,
    PieceType.Syatiku,
    PieceType.Innsyu,
    PieceType.Kodoku,
    PieceType.Tobaku,
    PieceType.Hayabenn,
    PieceType.Doukoukai,
    PieceType.Bakusui,
    PieceType.Kyousi,
    PieceType.Majime,
    PieceType.Instagram,
    PieceType.Bannsyo,
    PieceType.Bannsyo2,
    PieceType.Itiji,
    PieceType.Miss,
    PieceType.PKA,
    PieceType.Teachermove11,
    PieceType.Teachermove12,
]);

//上1マスのタイプ
const KinnnikuTypes = new Set([
    PieceType.Kinnniku,
    PieceType.Zennjitu,
    PieceType.Sumaho,
]);
//動けないタイプ
const CreditTypes = new Set([
    PieceType.Credit,
    PieceType.Kakomonn,
    PieceType.Nomikai,
    PieceType.Gs,
    PieceType.Gi,
    PieceType.Gq,
]);
//上1マス斜め上１マスのタイプ
const TyuuniTypes = new Set([
    PieceType.Tyuuni,
    PieceType.Facebook,
]);
//王のタイプ
const YuugiTypes = new Set([
    PieceType.Tetuya,
    PieceType.Yuugi,
    PieceType.Bukatu,
    PieceType.SNS,
    PieceType.Namazu,
    PieceType.GPT,
    PieceType.PS4,
    PieceType.PS5,
    PieceType.LINE,
    PieceType.Teachermove2,
    PieceType.Hako,
    PieceType.Koukinnyaku,
    PieceType.Kouuirusuyaku,
    PieceType.Utu,
    PieceType.Monndai,
    PieceType.Ia,
    PieceType.Ib,
    PieceType.Ic,
    PieceType.II,
    PieceType.III,
    PieceType.IV,
]);
//斜め１マスのタイプ
const TikokuTypes = new Set([
    PieceType.Tikoku,
    PieceType.Tennsai,
    PieceType.Zeroji,
    PieceType.Report,
    PieceType.PKC,
]);
//Pheのタイプ
const PheTypes = new Set([
    PieceType.Phe,
    PieceType.His,
    PieceType.Trp,
]);
//Lysのタイプ
const LysTypes = new Set([
    PieceType.Lys,
    PieceType.Met,
]);
//Switchのタイプ
const SwitchTypes = new Set([
    PieceType.Switch,
    PieceType.Switch2,
    PieceType.Twitter,
    PieceType.Sou,
    PieceType.S4,
    PieceType.S14,
    PieceType.Menneki,
    PieceType.Toukei,
]);
//金のタイプ
const GoldTypes = new Set([
    PieceType.SS,
    PieceType.Teachermove,
    PieceType.VD,
    PieceType.VA,
    PieceType.VK,
    PieceType.VE,
]);
//銀のタイプ
const SilverTypes = new Set([
    PieceType.SR,
    PieceType.VB1,
    PieceType.VB2,
    PieceType.VB3,
    PieceType.VB5,
    PieceType.VB6,
    PieceType.VB7,
    PieceType.VB9,
    PieceType.VB12,
    PieceType.VC,
]);
//下１マスのタイプ
const LMSTypes = new Set([
    PieceType.LMS,
    PieceType.LMS2,
    PieceType.LMS3,
    PieceType.LMS4,
]);
//横1列のタイプ
const S1Types = new Set([
    PieceType.S1,
    PieceType.S2,
    PieceType.S3,
    PieceType.S11,
    PieceType.S12,
    PieceType.S13,
]);


const typeToMoveMap = new Map();

// Setをループで登録
studentTypes.forEach(type => typeToMoveMap.set(type, StudentMoves));
KinnnikuTypes.forEach(type => typeToMoveMap.set(type, KinnnikuMoves));
CreditTypes.forEach(type => typeToMoveMap.set(type, CreditMoves));
TyuuniTypes.forEach(type => typeToMoveMap.set(type, TyuuniMoves));
YuugiTypes.forEach(type => typeToMoveMap.set(type, YuugiMoves));
TikokuTypes.forEach(type => typeToMoveMap.set(type, TikokuMoves));
SwitchTypes.forEach(type => typeToMoveMap.set(type, SwitchMoves));
PheTypes.forEach(type => typeToMoveMap.set(type, PheMoves));
LysTypes.forEach(type => typeToMoveMap.set(type, LysMoves));
GoldTypes.forEach(type => typeToMoveMap.set(type, GoldMoves));
SilverTypes.forEach(type => typeToMoveMap.set(type, SilverMoves));
LMSTypes.forEach(type => typeToMoveMap.set(type, LMSMoves));
S1Types.forEach(type => typeToMoveMap.set(type, S1Moves));

// 単体登録
typeToMoveMap.set(PieceType.Teacher, TeacherMoves);
typeToMoveMap.set(PieceType.Nakanuki, NakanukiMoves);
typeToMoveMap.set(PieceType.Hade, HadeMoves);
typeToMoveMap.set(PieceType.Sekitori, SekitoriMoves);
typeToMoveMap.set(PieceType.Saisi, SaisiMoves);
typeToMoveMap.set(PieceType.Uma, UmaMoves);
typeToMoveMap.set(PieceType.Val, ValMoves);
typeToMoveMap.set(PieceType.Leu, LeuMoves);
typeToMoveMap.set(PieceType.Ile, IleMoves);
typeToMoveMap.set(PieceType.Thr, ThrMoves);
typeToMoveMap.set(PieceType.Kasa, KasaMoves);
typeToMoveMap.set(PieceType.Dennsi, DennsiMoves);
typeToMoveMap.set(PieceType.Teachermove3, OsizaMoves);

//ムーブパターン
function movepattern(piece) {
    return typeToMoveMap.get(piece.type) || [];
}


// 駒の動ける範囲を設定
function getValidMoves(piece, fromRow, fromCol) {
    const moves = [];
    let moveList = movepattern(piece);

    for (const [dRow, dCol] of moveList) {
        const toRow = fromRow + dRow;
        const toCol = fromCol + dCol;

        // 範囲外チェック
        if (
            toRow >= 0 && toRow < ROWS &&
            toCol >= 0 && toCol < COLS
        ) {
            const target = board[toRow][toCol];
            // 自分の駒がないマスのみ許可（空 or 敵駒）
            if (!target || target.player !== piece.player) {
                moves.push([toRow, toCol]);
            }
        }
    }

    return moves;
}

// 移動が合法かチェックする関数
function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;

    let allowedMoves = movepattern(piece);

    // 移動差分が許可リストにあるか
    for (const [r, c] of allowedMoves) {
        if (r === dRow && c === dCol) {
            return true;
        }
    }

    return false;
}
//勝敗判定（単位と先生のHP確認）
function checkKingDefeatedAfterTurn() {
    let player1KingAlive = false;
    let player2KingAlive = false;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            // 駒があるorないチェック
            if (!piece) continue;

            if (
                (piece.type === PieceType.Credit) &&
                piece.hp > 0
            ) {
                player1KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teacher) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teachermove) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teachermove2) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teachermove3) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teachermove11) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }

            if (
                (piece.type === PieceType.Teachermove12) &&
                piece.hp > 0
            ) {
                player2KingAlive = true;
            }


        }
    }

    if (!player1KingAlive) {
        console.log("unStageClear");
        canvas.removeEventListener("click", handleClick);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // ← キャンバスをクリア
        removedPieces["Tikoku"] = [];
        showImpactMessage("落単", "blue", 2000, unStageClear(stageId));
        return true;
    }

    if (!player2KingAlive) {
        canvas.removeEventListener("click", handleClick);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // ← キャンバスをクリア
        removedPieces["Tikoku"] = [];
        showImpactMessage("単位認定", "red", 2000, onStageClear(stageId));
        return true;
    }

    return false;
}

// 実際に駒を動かす関数
function movePiece(fromRow, fromCol, toRow, toCol) {
    console.log("movePiece called")
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    const Teacher = board[0][4];
    const Yuugi = findAllPiecesOfType("Yuugi");
    const Teachermove11 = findAllPiecesOfType("Teachermove11");
    const Teachermove12 = findAllPiecesOfType("Teachermove12");

    // 味方の駒がいたら移動不可
    if (target && target.player === piece.player) return;

    if (target) {
        // 敵がいる場合 → 戦闘処理
        console.log("=== 攻撃開始 ===");
        console.log("攻撃側:", piece.type, "HP:", piece.hp, "ATK:", piece.atk);
        console.log("防御側:", target.type, "HP:", target.hp, "DEF:", target.def);
        console.log("→ ダメージ:", piece.atk - target.def);
        console.log("target.hp (after):", target.hp);
        console.log("board[toRow][toCol]:", board[toRow][toCol]); // ←重要
        if (piece.atk > target.def) {
            const rawDamage = piece.atk - target.def;
            console.log(`→ ダメージ: ${rawDamage}`);

            console.log(`target.hp (before):`, target.hp, typeof target.hp);

            target.hp -= rawDamage;

            console.log(`target.hp (after):`, target.hp, typeof target.hp);
            // 攻撃アニメーションを開始
            attackAnimation = {
                fromRow,
                fromCol,
                toRow,
                toCol,
                progress: 0,
                killed: target.hp <= 0,
                defeatedPiece: target.hp <= 0 ? target : null,
                attacker: piece,
                target: target
            };
            requestAnimationFrame(animateAttack);
            if (target.type === "LMS" && target.hp <= 0) {
                Teacher.hp -= 1;
            }
            if (target.type === "LMS2" && target.hp <= 0) {
                Teacher.hp -= 1;
            }
            if (target.type === "Sou" && target.hp <= 0) {
                Teacher.hp -= 15;
            }
            if (target.type === "Utu" && target.hp <= 0) {
                Teacher.hp -= 15;
            }
            if (target.type === "S1" && target.hp <= 0) {
                Teachermove11.hp -= 5;
            }
            if (target.type === "S2" && target.hp <= 0) {
                Teachermove11.hp -= 5;
            }
            if (target.type === "S3" && target.hp <= 0) {
                Teachermove11.hp -= 5;
            }
            if (target.type === "S4" && target.hp <= 0) {
                Teachermove11.hp -= 5;
            }
            if (target.type === "S11" && target.hp <= 0) {
                Teachermove12.hp -= 5;
            }
            if (target.type === "S12" && target.hp <= 0) {
                Teachermove12.hp -= 5;
            }
            if (target.type === "S13" && target.hp <= 0) {
                Teachermove12.hp -= 5;
            }
            if (target.type === "S14" && target.hp <= 0) {
                Teachermove12.hp -= 5;
            }
            const typesThatKillYuugi = ["PS4", "PS5", "Switch", "Switch2"];
            if (typesThatKillYuugi.includes(target.type) && target.hp <= 0) {
                for (const y of Yuugi) {
                    y.piece.hp = 0; // 修正ポイント
                }
            }
        } else {
            // 攻撃が効かない → アニメだけ再生
            attackAnimation = {
                fromRow,
                fromCol,
                toRow,
                toCol,
                progress: 0,
                killed: false,
                defeatedPiece: null,
                attacker: piece
            };
            requestAnimationFrame(animateAttack);
            return;
        }
    }

    // 通常の移動（敵がいない）
    if (!isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
        return;
    }

    if (!target) {
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = null;
    }

    draw(ctx, canvas);
}

// 攻撃アニメーション
function animateAttack() {
    if (!attackAnimation) return;

    const {
        fromRow,
        fromCol,
        toRow,
        toCol,
        progress,
        killed,
        defeatedPiece,
        attacker,
        target
    } = attackAnimation;

    // 進行が0なら効果音を鳴らす（最初の1回）
    if (progress === 0) {
        attackSound.currentTime = 0;  // 巻き戻して
        attackSound.play();
    }

    const piece = attacker;

    const dx = (toCol - fromCol) * TILE_SIZE * 0.2;
    const dy = (toRow - fromRow) * TILE_SIZE * 0.2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, canvas);

    const animX = fromCol * TILE_SIZE + TILE_SIZE / 2 + dx * Math.sin(progress * Math.PI);
    const animY = fromRow * TILE_SIZE + TILE_SIZE / 2 + dy * Math.sin(progress * Math.PI);

    ctx.save();
    ctx.fillStyle = piece.player === 1 ? "black" : "red";
    ctx.stroke();

    // === 駒の種類 ===
    ctx.fillStyle = piece.player === 1 ? "black" : "red";

    const displayName = piece.player === 1
        ? getDisplayName(piece.type)
        : (piece.name || getDisplayName(piece.type));

    const nameLength = displayName.length;

    // 文字数に応じてフォントサイズと行間を調整
    let fontSize = 20;
    let lineHeight = 20;
    let yOffset = TILE_SIZE / 6;

    if (nameLength >= 4) {
        fontSize = 14;
        lineHeight = 16;
        yOffset = TILE_SIZE / 8;
    } else if (nameLength === 3) {
        fontSize = 12;
        lineHeight = 12;
    }

    // フォント設定
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // 縦書きで描画
    drawVerticalText(ctx, displayName, animX, animY - (lineHeight * displayName.length) / 2, lineHeight);

    // === ステータス ===
    drawStatIcon(ctx, "hp", animX - TILE_SIZE / 2 + 15, animY - TILE_SIZE / 2 + 15, piece.hp);
    drawStatIcon(ctx, "atk", animX + TILE_SIZE / 2 - 15, animY - TILE_SIZE / 2 + 15, piece.atk);
    drawStatIcon(ctx, "def", animX - TILE_SIZE / 2 + 15, animY + TILE_SIZE / 2 - 15, piece.def);


    ctx.restore();

    attackAnimation.progress += 0.1;

    if (attackAnimation.progress < 1) {
        requestAnimationFrame(animateAttack);
    } else {
        // アニメーション終了後にHPを再確認
        if (target && target.hp <= 0) {
            console.log("敵を倒した");
            exp += target.exp;
            updateExpDisplay();
            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = null;
        } else {
            // 敵が生きている場合の処理
        }

        attackAnimation = null;
        draw(ctx, canvas); // 最終盤面を再描画
    }

    const boardPiece = board[toRow][toCol];
    console.log("🟢 アニメ終了後の駒：", boardPiece?.type, "HP:", boardPiece?.hp);
}


// CPUの行動を設定
function cpuMove() {
    console.log("CPU Turn 開始"); // ← デバッグ用

    const allMoves = [];

    // すべての駒とその合法手を列挙
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.player === 2) {
                const moves = getValidMoves(piece, row, col);
                for (const [toRow, toCol] of moves) {
                    allMoves.push({ fromRow: row, fromCol: col, toRow, toCol });
                }
            }
        }
    }

    // 動ける駒が1つもないなら「パス」
    if (allMoves.length === 0) {
        showAlert("CPUはパスしました!");
        stageSetting(stageId);
        draw(ctx, canvas); // CPUターンの最後に追加推奨
        currentPlayer = 1; // プレイヤーのターンに戻す
        return;
    }


    let move;
    //ランダム攻撃
    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    //単位優先攻撃
    const CreditattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        return target && target.type === PieceType.Credit;
    });

    //プレイヤーの駒を攻撃
    const PattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        if (!target) return false;
        if (target.player === 1) {
            const attacker = board[m.fromRow][m.fromCol];
            return attacker.atk > target.def;
        }
    });

    //プレイヤーの方へ近づく
    const PgoMove = allMoves.find(m => {
        return [m.fromRow] < [m.toRow];
    });

    //危険回避(取られにくい手)
    const safeMoves = allMoves.filter(m => !isDangerousAfterMove(m));

    if (AI_LEVEL === 1) {
        // レベル1：ランダム
        move = randomMove;

    } else if (AI_LEVEL === 2) {
        // レベル2：プレイヤーの駒を優先的に攻撃
        move = PattackMove || randomMove;

    } else if (AI_LEVEL === 3) {
        // レベル3：プレイヤー攻撃 + 危険回避（取られにくい手）

        if (PattackMove) {
            move = PattackMove;
        } else {
            // 敵に取られにくい手を優先
            if (safeMoves.length > 0) {
                move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            } else {
                // 安全な手がなければランダム
                move = randomMove;
            }
        }
    } else if (AI_LEVEL === 4) {
        //レベル４：プレイヤー攻撃 + 単位攻撃　+ 危険回避
        if (PattackMove) {
            move = PattackMove;
        } else {
            if (CreditattackMove) {
                move = CreditattackMove;
            } else if (safeMoves.length > 0) {
                move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            } else {
                // 安全な手がなければランダム
                move = randomMove;
            }
        }
    } else if (AI_LEVEL === 5) {
        //レベル5：プレイヤー攻撃 + 単位攻撃　+ 危険回避 + プレイヤー移動
        if (PattackMove) {
            move = PattackMove;
        } else {
            if (CreditattackMove) {
                move = CreditattackMove;
            } else if (safeMoves.length > 0) {
                move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
            } else if (PgoMove) {
                move = PgoMove;
            } else {
                move = randomMove;
            }
        }
    } else if (AI_LEVEL === 6) {
        move = selectBestMove(allMoves, 5);
    } else if (AI_LEVEL === 7) {
        move = selectBestMove(allMoves, 3);
    } else if (AI_LEVEL === 8) {
        move = selectBestMove(allMoves, 1);
    }

    movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
    removeDeadPieces()

    // 少し遅らせてステータス処理（駒の削除が完全に反映されてから）
    setTimeout(() => {
        stageSetting(stageId); // ← ここで Itiji.atk を減らす
        draw(ctx, canvas);     // 再描画（攻撃力変更が表示に反映）
        currentPlayer = 1;
        checkKingDefeatedAfterTurn();
    }, 0); // 0msで即時実行だが、イベントループに乗せるので処理順がずれる

}
// 危険な手の想定
function isDangerousAfterMove(move) {
    const { fromRow, fromCol, toRow, toCol } = move;

    // 駒を仮に動かしてみる
    const tempBoard = JSON.parse(JSON.stringify(board)); // 深いコピー
    const piece = tempBoard[fromRow][fromCol];
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = null;

    // プレイヤー1の駒で、このマスを取れるかチェック
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const enemy = tempBoard[row][col];
            if (enemy && enemy.player === 1) {
                const moves = getValidMoves(enemy, row, col);
                for (const [r, c] of moves) {
                    if (r === toRow && c === toCol) {
                        return true; // 危険なマス
                    }
                }
            }
        }
    }

    return false; // 安全
}
// ステータスアイコン表示
function drawStatIcon(ctx, type, x, y, value) {
    const size = 24; // アイコンの大きさ（縦横）
    ctx.save();

    // アイコンの背景（色や形を変える）
    if (type === "hp") {
        ctx.fillStyle = "rgba(0, 255, 85, 0.8)"; // 緑の丸
    } else if (type === "atk") {
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // 赤の丸
    } else if (type === "def") {
        ctx.fillStyle = "rgba(0, 0, 255, 0.8)"; // 青の丸
    }

    ctx.beginPath();
    ctx.arc(x, y, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // 数字をアイコン中央に表示
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, x, y);

    ctx.restore();
}
// 駒を表示
function drawCardPiece(ctx, piece, x, y) {
    const padding = 6;

    ctx.save();

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "PS4") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (ps4IconImage.complete && ps4IconImage.naturalWidth !== 0) {
            ctx.drawImage(
                ps4IconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "Switch") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (SwitchIconImage.complete && SwitchIconImage.naturalWidth !== 0) {
            ctx.drawImage(
                SwitchIconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "PS5") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (ps5IconImage.complete && ps5IconImage.naturalWidth !== 0) {
            ctx.drawImage(
                ps5IconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "Switch2") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (Switch2IconImage.complete && Switch2IconImage.naturalWidth !== 0) {
            ctx.drawImage(
                Switch2IconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "Facebook") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (FacebookIconImage.complete && FacebookIconImage.naturalWidth !== 0) {
            ctx.drawImage(
                FacebookIconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "Twitter") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (TwitterIconImage.complete && TwitterIconImage.naturalWidth !== 0) {
            ctx.drawImage(
                TwitterIconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "Instagram") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (InstagramIconImage.complete && InstagramIconImage.naturalWidth !== 0) {
            ctx.drawImage(
                InstagramIconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    // === 特定の駒だけ画像で描画 ===
    if (piece.type === "LINE") {
        // 背景
        ctx.fillStyle = "#222";
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);

        // 画像がロード済みなら描画
        if (LINEIconImage.complete && LINEIconImage.naturalWidth !== 0) {
            ctx.drawImage(
                LINEIconImage,
                x + padding,
                y + padding,
                TILE_SIZE - padding * 2,
                TILE_SIZE - padding * 2
            );
        } else {
            // ロード前ならプレースホルダー文字表示
            ctx.fillStyle = "white";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Icon", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }

        // === ステータス ===
        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);



        ctx.restore();
        return;
    }

    if (piece.type === "LMS3") {
        // カラフルな背景（レインボー風グラデーション）
        const grad = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
        grad.addColorStop(0.0, "#FF3CAC");  // ピンク
        grad.addColorStop(0.2, "#784BA0");  // パープル
        grad.addColorStop(0.4, "#2B86C5");  // 青
        grad.addColorStop(0.6, "#42E695");  // 緑
        grad.addColorStop(0.8, "#F9F871");  // 黄
        grad.addColorStop(1.0, "#FF9A00");  // オレンジ

        ctx.fillStyle = grad;
        ctx.fillRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2);


        ctx.fillStyle = "white";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("LMS", x + TILE_SIZE / 2, y + TILE_SIZE / 2);


        drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
        drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
        drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);

        ctx.restore();
        return;
    }


    // === カード背景 ===
    if (piece.rank === 0) {
        ctx.fillStyle = "#d9ababff";
    } else if (piece.rank === 1) {
        ctx.fillStyle = "#f8f7f7ff";
    } else if (piece.rank === 2) {
        const grad = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
        grad.addColorStop(0, "#E5B07E");   // 明るめの銅
        grad.addColorStop(0.5, "#C47222"); // 銅本体
        grad.addColorStop(1, "#8B4513");   // 焦げ茶で陰影

        ctx.fillStyle = grad;
    }
    else if (piece.rank === 3) {
        const grad = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
        grad.addColorStop(0, "#E0E0E0");  // 明るめ
        grad.addColorStop(0.5, "#A8A9AD"); // 中間
        grad.addColorStop(1, "#D0D0D0");  // 明るめ

        ctx.fillStyle = grad;
    } else if (piece.rank === 4) {
        const grad = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
        grad.addColorStop(0, "#FFF4B2");  // 明るい金
        grad.addColorStop(0.5, "#FFD700"); // 標準的な金
        grad.addColorStop(1, "#E6B800");  // やや暗めの金

        ctx.fillStyle = grad;
    }

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + padding, y + padding, TILE_SIZE - padding * 2, TILE_SIZE - padding * 2, 2);
    ctx.fill();
    ctx.stroke();

    // === 駒の種類 ===
    //ctx.fillStyle = piece.player === 1 ? "black" : "red";
    //ctx.font = "20px sans-serif";
    //ctx.textAlign = "center";
    //ctx.textBaseline = "middle";
    //if (piece.player === 1) {
    //    drawVerticalText(ctx, getDisplayName(piece.type), x + TILE_SIZE / 2, y + TILE_SIZE / 6);
    //} else if (piece.player === 2) {
    //    drawVerticalText(ctx, piece.name || getDisplayName(piece.type), x + TILE_SIZE / 2, y + TILE_SIZE / 6);
    //}
    //ctx.fillText(getDisplayName(piece.type), x + TILE_SIZE / 2, y + TILE_SIZE / 2);


    // === 駒の種類 ===
    ctx.fillStyle = piece.player === 1 ? "black" : "red";

    const displayName = piece.player === 1
        ? getDisplayName(piece.type)
        : (piece.name || getDisplayName(piece.type));



    // 文字数に応じてフォントサイズと行間を調整

    const nameLength = displayName.length;

    let fontSize, lineHeight, yOffset;
    if (nameLength <= 1) {
        fontSize = 20;
        lineHeight = 22;
        yOffset = TILE_SIZE / 2 - fontSize / 2; // ← 中央寄せ
    } else if (nameLength === 2) {
        fontSize = 20;
        lineHeight = 22;
        yOffset = TILE_SIZE / 6;
    } else if (nameLength === 3) {
        fontSize = 14;
        lineHeight = 14;
        yOffset = TILE_SIZE / 7;
    } else {
        fontSize = 12;
        lineHeight = 14;
        yOffset = TILE_SIZE / 8;
    }

    // フォント設定
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // 縦書きで描画
    // 横書きにしたい駒タイプ
    const horizontalTextTypes = ["Gs", "Gi", "Gq",];

    // 名前描画（縦 or 横）
    if (horizontalTextTypes.includes(piece.type)) {
        // 横書き
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText(displayName, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    } else {
        // 縦書き
        drawVerticalText(ctx, displayName, x + TILE_SIZE / 2, y + yOffset, lineHeight);
    }


    // === ステータス ===
    drawStatIcon(ctx, "hp", x + 15, y + 15, piece.hp);
    drawStatIcon(ctx, "atk", x + TILE_SIZE - 15, y + 15, piece.atk);
    drawStatIcon(ctx, "def", x + 15, y + TILE_SIZE - 15, piece.def);

    ctx.restore();
}
//縦書きにする
function drawVerticalText(ctx, text, x, y, lineHeight = 20) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";  // 上寄せでスタート
    for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], x, y + i * lineHeight);
    }
    ctx.restore();
}


// 背景描画
function drawBackground(ctx) {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            // === 特定のマスだけ木目カラー ===
            if (row === 0 && col >= 1 && col <= 7) {
                ctx.fillStyle = "#A0522D"; // 木のような茶色（sienna）
            } else {
                // 通常のタイルの色
                ctx.fillStyle = (row + col) % 2 === 0 ? "#3a4b60" : "#4b5d72";
            }
            ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// 描画設定
function draw(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(ctx);


    for (const [r, c] of validMoves) {
        ctx.fillStyle = "rgba(0, 255, 0, 0.3)"; // 半透明緑
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 盤面
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            const piece = board[row][col];
            if (piece) {
                drawCardPiece(ctx, piece, col * TILE_SIZE, row * TILE_SIZE);
            }

        }
    }

    // 選択中マスのハイライト
    if (selected) {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        ctx.strokeRect(
            selected.col * TILE_SIZE,
            selected.row * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
        ctx.lineWidth = 1;
    }
}
//遊び方画面へ
function goToTutorialScreen() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "block";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";
}
//タイトル画面へ
function goTostartScreen() {
    document.getElementById("startScreen").style.display = "block";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";
    document.getElementById("exp-display").style.display = "none";
}


//ステージ選択画面へ
function goToStageSelect() {
    showStageSelect();
    updateExpDisplay();
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";
    document.getElementById("exp-display").style.display = "block";
    document.getElementById("rankupScreen").style.display = "none";
    document.getElementById("expUseScreen").style.display = "none";
}

//セーブ画面へ
function goToSaveScreen() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "block";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";
    updateSlotInfo(); // ここで情報更新
}
//セーブ画面から戻る
function backToGame() {
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "block";
    goToStageSelect()
}
//セーブスロットにセーブする
function saveToSlot(slotNumber) {
    console.log(playerUpgrades);
    console.log(clearedStages);
    console.log(unclearedStages);
    const saveData = collectSaveData(); // ← あなたのセーブデータ収集関数
    const key = `SaveSlot${slotNumber}`;
    localStorage.setItem(key, JSON.stringify(saveData));
    showAlert(`スロット${slotNumber}にセーブしました`);
    goToSaveScreen();
}
//データを配列に変換
function collectSaveData() {
    // 盤面初期化
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }

    // 味方配置（デバッグ付き）
    const allies = loadFromSlot() || [];
    console.log("味方駒データ：", allies);
    console.log(allies.name)

    for (const ally of allies) {
        console.log(`配置: type=${ally.type}, row=${ally.row}, col=${ally.col}`);
        const piece = createPiece(ally.type, 1, ally.name, ally.name);
        console.log("生成された駒：", piece);
        board[ally.row][ally.col] = piece;
    }

    return {
        board: board.map(row => row.map(piece => {
            if (!piece) return null;
            return {
                type: piece.type,
                player: piece.player,
                name: piece.name,
                backname: piece.backname,
                hp: piece.hp,
                atk: piece.atk,
                def: piece.def,
                baseHp: piece.baseHp,
                baseAtk: piece.baseAtk,
                baseDef: piece.baseDef,
                exp: piece.exp,
                outline: piece.outline,
                rank: piece.rank,
            };
        })),
        playerUpgrades: playerUpgrades,
        clearedStages: clearedStages,
        unclearedStages: unclearedStages,
        exp: exp,
        savedAt: new Date().toISOString()
    };
}
//ロード画面へ
function goToLoadScreen() {
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "block";
    updateSlotInfo(); // ここで情報更新
}
//ロード画面から戻る
function backToGameFromLoad() {
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "block";
    goToStageSelect()
}
//ロードスロットからロード
function LoadFromSlot(slotNumber) {
    console.log("ロードしました");
    const key1 = `SaveSlot${slotNumber}`;
    const saved = localStorage.getItem(key1);
    if (!saved) {
        showAlert(`スロット${slotNumber}にセーブデータがありません`);
        return;
    }

    const saveData = JSON.parse(saved);
    applySaveData(saveData);
    const saveData1 = customDataSave(); // ← あなたのセーブデータ収集関数
    const key = "customslot";
    localStorage.setItem(key, JSON.stringify(saveData1));
    showAlert(`スロット${slotNumber}からロードしました`);
    goToLoadScreen();
}
//配列からデータを復元
function applySaveData(saveData) {
    // boardを空にする処理
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }
    playerUpgrades = saveData.playerUpgrades;
    clearedStages = saveData.clearedStages;
    unclearedStages = saveData.unclearedStages;
    exp = saveData.exp;


    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const data = saveData.board[row][col];
            if (data) {
                const piece = createPiece(data.type, data.player, data.name, data.backname); // ← backnameを渡す
                piece.hp = data.hp;
                piece.atk = data.atk;
                piece.def = data.def;
                piece.name = data.name;
                piece.rank = data.rank;
                piece.outline = data.outline;

                // base値を復元（なければcreatePieceの中で自動設定されるようにもできる）
                if (data.baseHp !== undefined) piece.baseHp = data.baseHp;
                if (data.baseAtk !== undefined) piece.baseAtk = data.baseAtk;
                if (data.baseDef !== undefined) piece.baseDef = data.baseDef;
                if (data.exp !== undefined) piece.exp = data.exp;

                applyUpgradesToPiece(piece); // ← ★アップグレードをここで必ず適用

                board[row][col] = piece;
            } else {
                board[row][col] = null;
            }
        }
    }

    selected = null;
    validMoves = [];
    clearPieceInfo();
    draw(ctx, canvas);
}
//スロットの表示を更新
function updateSlotInfo() {
    for (let i = 1; i <= 3; i++) {
        const key = `SaveSlot${i}`;
        const slotButtonSave = document.getElementById(`saveSlot${i}`);
        const slotButtonLoad = document.getElementById(`loadSlot${i}`);

        const dataJSON = localStorage.getItem(key);
        if (dataJSON) {
            const data = JSON.parse(dataJSON);
            const savedAt = new Date(data.savedAt);
            const savedAtStr = savedAt.toLocaleString();

            const infoText = `保存日時: ${savedAtStr}`;

            if (slotButtonSave) {
                slotButtonSave.textContent =
                    `スロット${i}
                ${infoText}`;
            }
            if (slotButtonLoad) {
                slotButtonLoad.textContent = `スロット${i}\n${infoText}`;
            }
        } else {
            if (slotButtonSave) {
                slotButtonSave.textContent = `スロット${i}\n（空き）`;
            }
            if (slotButtonLoad) {
                slotButtonLoad.textContent = `スロット${i}\n（空き）`;
            }
        }
    }
}
//通知設定
function showAlert(message) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    // 表示準備
    alertBox.style.display = 'block';
    alertBox.classList.add('show');


    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 400);
    }, 2000); // 2秒表示
}
//ステージクリア
function onStageClear(stageId) {

    if (stageId === 1) {
        exp += 50;
    } else if (stageId === 2) {
        exp += 100;
    } else if (stageId === 3) {
        exp += 100;
    } else if (stageId === 4) {
        exp += 500;
    } else if (stageId === 5) {
        exp += 200;
    } else if (stageId === 6) {
        exp += 100;
    } else if (stageId === 7) {
        exp += 200;
    } else if (stageId === 8) {
        exp += 300;
    } else if (stageId === 9) {
        exp += 300;
    } else if (stageId === 10) {
        exp += 800;
    } else if (stageId === 11) {
        exp += 300;
    } else if (stageId === 12) {
        exp += 400;
    } else if (stageId === 13) {
        exp += 400;
    } else if (stageId === 14) {
        exp += 500;
    } else if (stageId === 15) {
        exp += 2000;
    } else if (stageId === 16) {
        exp += 2000;
    } else if (stageId === 17) {
        exp += 3000;
    } else if (stageId === 18) {
        exp += 3000;
    } else if (stageId === 19) {
        exp += 5000;
    } else if (stageId === 20) {
        exp += 10000;
    } else if (stageId === 21) {
        exp += 5000;
    } else if (stageId === 22) {
        exp += 5000;
    } else if (stageId === 23) {
        exp += 8000;
    } else if (stageId === 24) {
        exp += 20000;
    } else if (stageId === 25) {
        exp += 20000;
    } else if (stageId === 26) {
        exp += 1000000;
        showAlert("ゲームクリア!!");
        goTostartScreen();
    }

    if (!clearedStages.includes(stageId)) {
        clearedStages.push(stageId);
    }

    if (checkGameOverCondition()) {
        return; // ゲームオーバーなら処理中断
    }
    autosave();
    // アップグレード画面などへ遷移
    setTimeout(goToStageSelect(), 1000)
}
//ステージ選択画面（ステージ選択ボタン生成）
function showStageSelect() {
    console.log("showStageSelect()")
    const container = document.querySelector("#stageSelectScreen .stageSelect");
    container.innerHTML = ""; // 中身クリア（タイトルや戻るボタンは別に残すため）

    stages.forEach(stage => {
        const btn = document.createElement("button");
        btn.className = "btn stage";
        btn.innerText =
            `${stage.name}
         難易度：${stage.level}
        `;


        if (!stage.unlockCondition()) {
            // 未解放の場合
            btn.disabled = true;
            btn.style.opacity = 0.3;
            btn.innerText = `未開放`;
        } else if (clearedStages.includes(stage.id)) {
            // クリア済みの場合
            btn.disabled = true;
            btn.style.opacity = 0.5;
            btn.innerText = `単位認定 ${stage.name}`;
        } else if (unclearedStages.includes(stage.id)) {
            // クリアできなかったステージの場合
            btn.disabled = true;
            btn.style.opacity = 0.5;
            btn.innerText = `落単 ${stage.name}`;
        } else {
            // 解放済みかつ未クリアの場合
            btn.onclick = () => {
                stageId = stage.id; // グローバル変数に保存
                startStage(stage.id);
            };
        }
        container.appendChild(btn);
    });
}

// ゲーム開始：画面切り替え + ステージ初期化
function startStage(stageId) {
    // 画面表示切り替え
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";


    // ステージ初期化
    initStage(stageId);
}

// ステージの実際の初期化処理
function initStage(stageId) {
    currentPlayer = 1; // プレイヤー先行
    AI_LEVEL = 1;
    turnCount = 1;
    stageActCount = 0;
    updateTurnDisplay();

    // ステージごとに AI のレベルを設定
    switch (stageId) {
        case 1:
            AI_LEVEL = 1;
            break;
        case 2:
            AI_LEVEL = 2;
            break;
        case 3:
            AI_LEVEL = 2;
            break;
        case 4:
            AI_LEVEL = 5; // 難易度アップ
            break;
        case 5:
            AI_LEVEL = 6;
            break;
        case 6:
            AI_LEVEL = 2;
            break;
        case 7:
            AI_LEVEL = 2;
            break;
        case 8:
            AI_LEVEL = 5;
            break;
        case 9:
            AI_LEVEL = 6;
            break;
        case 10:
            AI_LEVEL = 8; // 難易度アップ
            break;
        case 11:
            AI_LEVEL = 4;
            break;
        case 12:
            AI_LEVEL = 4;
            break;
        case 13:
            AI_LEVEL = 5;
            break;
        case 14:
            AI_LEVEL = 6;
            break;
        case 15:
            AI_LEVEL = 7;
            break;
        case 16:
            AI_LEVEL = 5; // 難易度アップ
            break;
        case 17:
            AI_LEVEL = 5;
            break;
        case 18:
            AI_LEVEL = 6;
            break;
        case 19:
            AI_LEVEL = 6;
            break;
        case 20:
            AI_LEVEL = 8;
            break;
        case 21:
            AI_LEVEL = 7;
            break;
        case 22:
            AI_LEVEL = 7; // 難易度アップ
            break;
        case 23:
            AI_LEVEL = 7;
            break;
        case 24:
            AI_LEVEL = 8;
            break;
        case 25:
            AI_LEVEL = 8;
            break;
        case 26:
            AI_LEVEL = 8;
            break;
        default:
            AI_LEVEL = 1; // デフォルト
    }


    if (!bgmStarted) {
        bgm.play();
        bgmStarted = true;
    }

    // 盤面初期化
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }

    // 味方配置（デバッグ付き）
    const allies = loadFromSlot() || [];
    console.log("味方駒データ：", allies);
    console.log(allies.name)

    for (const ally of allies) {
        console.log(`配置: type=${ally.type}, row=${ally.row}, col=${ally.col}`);
        const piece = createPiece(ally.type, 1, ally.name, ally.name);
        console.log("生成された駒：", piece);
        board[ally.row][ally.col] = piece;
    }

    // 強化適用
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.player === 1) {
                applyUpgradesToPiece(piece)
            }
        }
    }

    // 敵配置
    const stage = stageData[stageId];
    if (!stage || !stage.enemies) {
        console.error(`ステージ${stageId}のデータが存在しません`);
        return;
    }
    for (const enemy of stage.enemies) {
        const piece = createPiece(enemy.type, 2, enemy.name, enemy.backname);
        if (!piece) {
            console.error(`敵駒の生成失敗: type=${enemy.type}`);
        }
        board[enemy.row][enemy.col] = piece;
        console.log(`敵駒配置: type=${enemy.type}, row=${enemy.row}, col=${enemy.col}, piece=`, piece);
    }

    console.log("enemy piece at (0, 3):", board[0][3]);
    // リセット処理
    clearPieceInfo();
    selected = null;
    validMoves = [];
    removePiece("Tikoku");
    startturnmove();
    draw(ctx, canvas);
    canvas.addEventListener("click", handleClick);
}

//ゲームオーバー判定
function checkGameOverCondition() {
    const requiredStages1 = [1, 2, 3, 4, 5]; // 対象ステージ
    const unclearedCount1 = requiredStages1.filter(id => unclearedStages.includes(id)).length;
    const requiredStages2 = [6, 7, 8, 9, 10]; // 対象ステージ
    const unclearedCount2 = requiredStages2.filter(id => unclearedStages.includes(id)).length;
    const requiredStages3 = [11, 12, 13, 14, 15]; // 対象ステージ
    const unclearedCount3 = requiredStages3.filter(id => unclearedStages.includes(id)).length;
    const requiredStages4 = [16, 17, 18, 19, 20]; // 対象ステージ
    const unclearedCount4 = requiredStages4.filter(id => unclearedStages.includes(id)).length;
    const requiredStages5 = [21, 22, 23, 24, 25]; // 対象ステージ
    const unclearedCount5 = requiredStages5.filter(id => unclearedStages.includes(id)).length;

    if (unclearedCount1 > 1 || unclearedCount2 > 1 || unclearedCount3 > 1 || unclearedCount4 > 1 || unclearedCount5 > 1) {
        showGameOver(); // ゲームオーバー処理へ
        return true;
    }
    return false;
}
//ゲームオーバー画面へ
function showGameOver() {
    showImpactMessage("進級に必要な単位が取れず退学しました...", color = "blue", duration = 2000,);

    playerUpgrades = {};  // 強化データをリセット
    clearedStages = [];  // クリアしたステージIDや名前を保存
    unclearedStages = []; // クリアできなかったステージIDや名前を保存
    exp = 0;              // EXPもリセット
    firstsave();
    // 画面切り替えなど（必要に応じて）
    document.getElementById("startScreen").style.display = "block";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";
}

//ステージノットクリア
function unStageClear(stageId) {
    if (!unclearedStages.includes(stageId)) {
        unclearedStages.push(stageId);
    }

    if (checkGameOverCondition()) {
        return; // ゲームオーバーなら処理中断
    }
    autosave();
    setTimeout(goToStageSelect(), 1000);
}
//カスタマイズ画面へ
function goToCustomizeScreen() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "block";

    // 盤面初期化
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }

    const saveData = JSON.parse(localStorage.getItem("customslot"));

    if (!saveData) {
        // 保存データがなければ playerTeam を使って初期盤面をセット
        for (const ally of playerTeam) {
            board[ally.row][ally.col] = createPiece(ally.type, 1, ally.name, ally.backname);
        }
    } else {
        // 保存データの board から盤面を復元
        for (let row = 0; row < saveData.board.length; row++) {
            for (let col = 0; col < saveData.board[row].length; col++) {
                const piece = saveData.board[row][col];
                if (piece) {
                    const newPiece = createPiece(piece.type, piece.player, piece.name, piece.backname);

                    // 元ステータスのみ適用
                    newPiece.hp = piece.baseHp ?? piece.hp ?? 1;
                    newPiece.atk = piece.baseAtk ?? piece.atk ?? 1;
                    newPiece.def = piece.baseDef ?? piece.def ?? 1;
                    newPiece.outline = piece.outline;
                    newPiece.rank = piece.rank;

                    board[row][col] = newPiece;

                    // 強化を適用
                    applyUpgradesToPiece(newPiece);
                } else {
                    board[row][col] = null;
                }
            }
        }
    }


    customclearPieceInfo();
    selected = null;
    validMoves = [];
    draw(customctx, customcanvas);
    customcanvas.addEventListener("click", customhandleClick);
}

// カスタマイズ画面のクリック設定
function customhandleClick(event) {


    const x = event.offsetX;
    const y = event.offsetY;
    const row = Math.floor(y / TILE_SIZE);
    const col = Math.floor(x / TILE_SIZE);

    if (selected) {
        const fromRow = selected.row;
        const fromCol = selected.col;


        if (fromRow === 8 && fromCol === 4) {
            selected = null;
            showAlert("この駒は動かすことができません！")
            customclearPieceInfo(); // 移動できなければ情報クリア
        } else {
            custommovePiece(fromRow, fromCol, row, col);
            selected = null;
            customclearPieceInfo();// 移動処理
        }

    } else {
        const clicked = board[row][col];

        if (clicked) {

            // 自分の駒：選択して移動可能マス表示
            selected = { row, col };

            // どちらのプレイヤーでも駒情報を表示（★ここがポイント）
            customshowPieceInfo(clicked);
        } else {
            customclearPieceInfo();
        }
    }
    draw(customctx, customcanvas);
}

// 実際に駒を動かす関数
function custommovePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];

    // 味方の駒がいたら移動不可
    if (target && target.player === piece.player) {
        return;
    } else if (toRow < 6) {
        showAlert("下から3列にしか動かせません!");
        return;
    }


    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    draw(customctx, customcanvas);
}
//カスタマイズ画面の駒情報表示
function customshowPieceInfo(piece) {
    lastSelectedPiece = piece; // ← ここを追加！

    const infoDiv = document.getElementById("custompieceInfo");
    const moveDiv = document.getElementById("custommoveInfo");
    const moveGrid = document.getElementById("custommoveGrid");
    const baseStats = NameStats[piece.type] || TypeStats[piece.type];
    const displayName = getDisplayName(piece.type);
    const maxhp = piece.maxhp;

    // ステータスと説明
    // アップグレードを取得
    const upgrade = playerUpgrades[piece.name] || {};

    // 強化値の取得
    const hpBoost = upgrade.hp || 0;
    const atkBoost = upgrade.atk || 0;
    const defBoost = upgrade.def || 0;

    // 現在値から強化分を引いて基礎値を算出
    const baseHp = piece.hp - hpBoost;
    const baseAtk = piece.atk - atkBoost;
    const baseDef = piece.def - defBoost;

    // 表示用の関数
    const formatStat = (base, boost) => {
        return boost > 0 ? `${base}（+${boost}）` : `${base}`;
    };

    // innerHTML に反映
    infoDiv.innerHTML = `
    <h3 style="color: #faf7f7ff;">選択中の駒</h3>
    <h3 style="color: #fcfafaff;">${displayName}${piece.name ? `（${piece.name}）` : ''}</h3>
    <p><span style="color:#0f0;">HP:</span> ${formatStat(baseHp, hpBoost)}</p>
    <p><span style="color:#f55;">攻撃力:</span> ${formatStat(baseAtk, atkBoost)}</p>
    <p><span style="color:#55f;">防御力:</span> ${formatStat(baseDef, defBoost)}</p>
    ${piece.abilityName ? `<p style="color:#ff0;">能力: ${piece.abilityName}</p>` : ''}
    ${piece.abilityDescription ? `<p style="font-size: 0.9em; color: #aaa;">${piece.abilityDescription}</p>` : ''}
    <p style="margin-top:8px;">＜説明＞</p>
    <p style="font-size: 13px;">${piece.outline}</p>
    `;


    // === 移動パターン描画 ===
    const size = 9;
    const grid = [];
    let moveList = movepattern(piece);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (r === 4 && c === 4) {
                cell.textContent = getDisplayName(piece.type);
                cell.classList.add("center");
            }
            grid.push(cell);
        }
    }

    for (const [dr, dc] of moveList) {
        const r = 4 + dr;
        const c = 4 + dc;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            const index = r * 9 + c;
            grid[index].classList.add("move");
        }
    }

    moveGrid.innerHTML = "";
    for (const cell of grid) {
        moveGrid.appendChild(cell);
    }
}
//カスタマイズ画面の駒情報クリア
function customclearPieceInfo() {
    const infoDiv = document.getElementById("custompieceInfo");

    if (lastSelectedPiece) {
        // 選択駒が記録されているなら再表示
        customshowPieceInfo(lastSelectedPiece);
    } else {
        infoDiv.innerHTML = '';
    }
}
//カスタムデータを配列に
function customDataSave() {
    return {
        board: board.map(row => row.map(piece => {
            if (!piece) return null;
            return {
                type: piece.type,
                player: piece.player,
                name: piece.name,
                backname: piece.backname,
                hp: piece.hp,
                atk: piece.atk,
                def: piece.def,
                outline: piece.outline,
                rank: piece.rank,
                baseHp: piece.baseHp,
                baseAtk: piece.baseAtk,
                baseDef: piece.baseDef,
            };
        })),
        playerUpgrades: playerUpgrades,
        clearedStages: clearedStages,
        unclearedStages: unclearedStages,
        exp: exp,
    };
}
//カスタマイズをスロットに保存
function saveTocustomslot() {
    const saveData = customDataSave(); // ← あなたのセーブデータ収集関数
    const key = "customslot";
    localStorage.setItem(key, JSON.stringify(saveData));
    showAlert(`駒の配置を保存しました`);
}

//カスタム
function saveCustomSetup() {
    saveTocustomslot();

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("TutorialScreen").style.display = "none";
    document.getElementById("stageSelectScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("saveScreen").style.display = "none";
    document.getElementById("loadScreen").style.display = "none";
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("customizeScreen").style.display = "none";

}

//配列からデータを復元
function applycustomData(saveData) {
    playerUpgrades = saveData.playerUpgrades;
    clearedStages = saveData.clearedStages;
    unclearedStages = saveData.unclearedStages;
    exp = saveData.exp;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const data = saveData.board[row][col];
            if (data) {
                const piece = createPiece(data.type, data.player, data.name, data.backname);
                piece.hp = data.hp;
                piece.atk = data.atk;
                piece.def = data.def;
                piece.outline = data.outline;
                piece.rank = data.rank;
                piece.baseHp = data.baseHP;
                piece.baseAtk = data.baseAtk;
                piece.baseDef = data.baseDef;
                board[row][col] = piece;
            } else {
                board[row][col] = null;
            }
        }
    }

    selected = null;
    validMoves = [];
    customclearPieceInfo();
    draw(customctx, customcanvas);
}

//カスタマイズスロットからロード
function loadFromSlot() {
    const key = "customslot";
    const saved = localStorage.getItem(key);
    if (!saved) {
        return;
    }

    const saveData = JSON.parse(saved);
    applycustomData(saveData);

    // 味方だけを抽出して返す（player 1）
    const allies = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.player === 1) {
                allies.push({
                    type: piece.type,
                    row,
                    col,
                    name: piece.name,
                    backname: piece.backname,
                });
            }
        }
    }
    return allies;
}
//ターン表示更新
function updateTurnDisplay() {
    const turnDisplay = document.getElementById("turnDisplay");
    turnDisplay.textContent = `ターン: ${turnCount}`;
}
//ステージギミック
function stageSetting(stageId) {
    if (stageId === 1) {
        if (countEmptyTiles(2, 8) > 0) {
            if (stageActCount <= 11) {
                createRandomPiece(2, 8, "LMS", 2);
                stageActCount += 1;
            }
        }
    }
    if (stageId === 3) {
        const zerojiPieces = findAllPiecesOfType("Zeroji");
        const itijiPieces = findAllPiecesOfType("Itiji"); // ← これも同様に必要

        if (findAllPiecesOfplayer(1).length > 0) {
            if (turnCount % 5 === 0) {
                // Zeroji の全ての駒の def を1下げる
                zerojiPieces.forEach(({ piece }) => {
                    piece.def -= 1;
                });

                // Itiji の全ての駒の atk を player1の駒数に設定
                const player1Count = findAllPiecesOfplayer(1).length;
                itijiPieces.forEach(({ piece }) => {
                    piece.atk = player1Count;
                });
            } else {
                // それ以外の条件では Itiji の atk を player1の駒数に設定
                const player1Count = findAllPiecesOfplayer(1).length;
                itijiPieces.forEach(({ piece }) => {
                    piece.atk = player1Count;
                });
            }

        }

    }
    if (stageId === 6) {
        if (countEmptyTiles(2, 8) > 0) {
            if (stageActCount <= 11) {
                createRandomPiece(2, 8, "LMS2", 2);
                stageActCount += 1;
            }
        }
    }
    if (stageId === 7) {
        if (turnCount % 3 === 0) {
            if (countEmptyTiles(2, 8) > 0) {
                createRandomPiece(2, 8, "Miss", 2);
            }
        }
    }
    if (stageId === 11) {
        if (turnCount % 2 === 0) {
            if (countEmptyTiles(2, 8) > 0) {
                createRandomPiece(2, 8, "Miss", 2);
            }
        }
    }
    if (stageId === 16) {
        if (countEmptyTiles(2, 8) > 0) {
            createRandomPiece(2, 8, "Dennsi", 2);
        }
    }
    if (stageId === 17) {
        if (turnCount % 5 === 0) {
            applyGlobalBuff(2, 1, 1,);
        }
    }
    if (stageId === 23) {
        if (turnCount % 3 === 0) {
            applyGlobalBuff(1, -1, -1, "purple");
        }
    }
    if (stageId === 25) {
        applyGlobalBuff(2, 1, 1,);
    }
}
//ランダム駒生成
function createRandomPiece(createROWS, createCOLS, type, player, name, backname) {
    const emptyPositions = [];
    if (player === 2) {
        // 盤面をスキャンして空きマスを収集
        for (let row = 0; row < createROWS; row++) {
            for (let col = 0; col < createCOLS; col++) {
                if (board[row][col] === null) {
                    emptyPositions.push({ row, col });
                }
            }
        }
    }
    if (player === 1) {
        // 盤面をスキャンして空きマスを収集
        for (let row = 8; row > createROWS; row--) {
            for (let col = 8; col > createCOLS; col--) {
                if (board[row][col] === null) {
                    emptyPositions.push({ row, col });
                }
            }
        }
    }
    // 空きマスがなければ何もしない
    if (emptyPositions.length === 0) {
        return;
    }

    // 空きマスからランダムに選択
    const index = Math.floor(Math.random() * emptyPositions.length);
    const { row, col } = emptyPositions[index];

    // 駒を生成して配置
    const piece = createPiece(type, player, name, backname);
    board[row][col] = piece;

    console.log(`ランダムに駒を配置: (${row}, ${col})`, piece);
}
//空きマスカウント
function countEmptyTiles(createROWS, createCOLS) {
    let count = 0;
    for (let row = 0; row < createROWS; row++) {
        for (let col = 0; col < createCOLS; col++) {
            if (board[row][col] === null) {
                count++;
            }
        }
    }
    return count;
}
//ランクアップ画面へ
function showRankupScreen(x) {

    if (x === 1) {
        if (exp < 50) {
            showAlert("EXPが不足しています");
            return;
        }
    } else if (x === 2) {
        if (exp < 1000) {
            showAlert("EXPが不足しています");
            return;
        }
    } else if (x === 3) {
        if (exp < 10000) {
            showAlert("EXPが不足しています");
            return;
        }
    }
    const container = document.getElementById("playerPiecesContainer");
    container.innerHTML = "";

    let pieces = [];

    const saved = localStorage.getItem("customslot");

    if (saved) {
        const saveData = JSON.parse(saved);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = saveData.board[row][col];
                if (!piece) continue; // pieceがないならスキップ

                if (piece.type === "Credit") {
                    // 処理をスキップしたいなら continue に変更
                    continue;
                }

                if (piece.rank !== x) {
                    // 処理をスキップしたいなら continue に変更
                    continue;
                }

                if (piece.player === 1 && piece.rank < 4) {
                    applyUpgradesToPiece(piece); // ← 強化反映
                    pieces.push({ ...piece, row, col });
                }
            }
        }
    } else {
        // customslotがない → playerTeamから取得
        for (const ally of playerTeam) {
            const piece = {
                type: ally.type,
                player: 1,
                name: ally.name,
                backname: ally.backname,
                row: ally.row,
                col: ally.col,
                hp: ally.hp ?? 100,      // 例：hpがなければ100に設定
                atk: ally.atk ?? 10,
                def: ally.def ?? 5,
            };
            applyUpgradesToPiece(piece); // ← 強化反映
            pieces.push(piece);
        }
    }

    if (pieces.length === 0) {
        showAlert("表示できるプレイヤーの駒が見つかりません");
        return;
    }

    document.getElementById("rankupScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("selectedPieceInfo").style.display = "none";
    document.getElementById("playerPiecesContainer").style.display = "block";
    document.getElementById("showUpgradeCandidatesBtn1").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn2").style.display = "none";
    document.getElementById("rankupCandidatesContainer").style.display = "none";
    document.getElementById("selectedCandidateInfo").style.display = "none";
    document.getElementById("confirmRankupBtn").style.display = "none";
    document.getElementById("selectedmoveInfo").style.display = "none";
    document.getElementById("selectedCandidatemoveInfo").style.display = "none";
    document.getElementById("rankupP1").style.display = "block";
    document.getElementById("rankupP2").style.display = "none";
    document.getElementById("rankupP3").style.display = "none";
    document.getElementById("rankupP4").style.display = "none";
    document.getElementById("expUseScreen").style.display = "none";
    document.getElementById("rankuptitle1").style.display = "block";
    document.getElementById("rankuptitle2").style.display = "none";

    if (x === 1) {
        exp = exp - 50;
    } else if (x === 2) {
        exp = exp - 1000;
    } else if (x === 3) {
        exp = exp - 10000;
    }

    pieces.forEach(piece => {
        const canvas = document.createElement("canvas");
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        canvas.style.margin = "5px";
        canvas.style.cursor = "pointer";

        const ctx = canvas.getContext("2d");
        drawCardPiece(ctx, piece, 0, 0);

        canvas.onclick = () => selectPieceForRankup(piece, 1);

        container.appendChild(canvas);
    });
}

let selectedPiece = null;
//ランクアップしたい駒を選択
function selectPieceForRankup(piece, x) {
    selectedPiece = piece;

    const container = document.getElementById("selectedPieceInfo");
    container.style.display = "block";

    document.getElementById("selectedmoveInfo").style.display = "block";

    const displayName = getDisplayName(piece.type)


    container.className = "pnIfo";  // ここでCSSクラスをセット

    const maxhp = piece.maxhp;

    // アップグレードを取得
    const upgrade = playerUpgrades[piece.name] || {};

    // 強化値の取得
    const hpBoost = upgrade.hp || 0;
    const atkBoost = upgrade.atk || 0;
    const defBoost = upgrade.def || 0;

    // 現在値から強化分を引いて基礎値を算出
    const baseHp = piece.hp - hpBoost;
    const baseAtk = piece.atk - atkBoost;
    const baseDef = piece.def - defBoost;

    // 表示用の関数
    const formatStat = (base, boost) => {
        return boost > 0 ? `${base}（+${boost}）` : `${base}`;
    };

    // innerHTML に反映
    container.innerHTML = `
    <h3 style="color: #faf7f7ff;">選択中の駒</h3>
    <h3 style="color: #fcfafaff;">${displayName}(${piece.name})</h3>
    <p><span style="color:#0f0;">HP:</span> ${formatStat(baseHp, hpBoost)}</p>
    <p><span style="color:#f55;">攻撃力:</span> ${formatStat(baseAtk, atkBoost)}</p>
    <p><span style="color:#55f;">防御力:</span> ${formatStat(baseDef, defBoost)}</p>
    ${piece.abilityName ? `<p style="color:#ff0;">能力: ${piece.abilityName}</p>` : ''}
    ${piece.abilityDescription ? `<p style="font-size: 0.9em; color: #aaa;">${piece.abilityDescription}</p>` : ''}
    <p style="margin-top:8px;">＜説明＞</p>
    <p style="font-size: 13px;">${piece.outline}</p>
    `;


    // === 移動パターン描画 ===
    const size = 9;
    const grid = [];
    let moveList = movepattern(piece);

    const moveGrid = document.getElementById("moveGrid1");

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (r === 4 && c === 4) {
                cell.textContent = getDisplayName(piece.type);
                cell.classList.add("center");
            }
            grid.push(cell);
        }
    }

    for (const [dr, dc] of moveList) {
        const r = 4 + dr;
        const c = 4 + dc;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            const index = r * 9 + c;
            grid[index].classList.add("move");
        }
    }

    moveGrid.innerHTML = "";
    for (const cell of grid) {
        moveGrid.appendChild(cell);
    }

    if (x === 1) {
        document.getElementById("showUpgradeCandidatesBtn1").style.display = "inline-block";
    } else if (x === 2) {
        document.getElementById("showUpgradeCandidatesBtn2").style.display = "inline-block";
    }
}


let selectedCandidate = null;
let candidatePieces = [];
//ランクアップ候補を選ぶ
function showUpgradeCandidates(x) {
    if (!selectedPiece) return;

    document.getElementById("playerPiecesContainer").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn1").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn2").style.display = "none";
    document.getElementById("rankupCandidatesContainer").style.display = "block";
    document.getElementById("selectedPieceInfo").style.display = "none";
    document.getElementById("selectedmoveInfo").style.display = "none";

    if (x === 1) {
        document.getElementById("rankupP1").style.display = "none";
        document.getElementById("rankupP2").style.display = "block";
        document.getElementById("rankupP3").style.display = "none";
        document.getElementById("rankupP4").style.display = "none";
    } else if (x === 0) {
        document.getElementById("rankupP1").style.display = "none";
        document.getElementById("rankupP2").style.display = "none";
        document.getElementById("rankupP3").style.display = "none";
        document.getElementById("rankupP4").style.display = "block";
    }

    const nextRank = selectedPiece.rank + x;
    //タイプステータスのランクがネクストランクであるものを取り出す
    const allTypes = Object.values(PieceType).filter(t => {
        const def = TypeStats[t];
        return def && def.rank === nextRank;
    });

    // 3つランダムに選出
    candidatePieces = [];
    for (let i = 0; i < 3 && allTypes.length > 0; i++) {
        //マスランダム→０から1未満の数を返す　マスフロア→小数点以下切り捨て
        const index = Math.floor(Math.random() * allTypes.length);
        const type = allTypes.splice(index, 1)[0];
        const piece = createPiece(type, 1, selectedPiece.name, selectedPiece.backname);
        applyUpgradesToPiece(piece);
        candidatePieces.push(piece);
    }

    const container = document.getElementById("rankupCandidatesContainer");
    container.innerHTML = "";
    container.style.display = "block";
    document.getElementById("confirmRankupBtn").style.display = "none";

    candidatePieces.forEach((piece, idx) => {
        const canvas = document.createElement("canvas");
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        canvas.style.margin = "5px";
        canvas.style.cursor = "pointer";

        const ctx = canvas.getContext("2d");
        drawCardPiece(ctx, piece, 0, 0);

        canvas.onclick = () => selectCandidate(piece, x);

        container.appendChild(canvas);
    });
}
//ランクアップする駒を選択
function selectCandidate(piece, x) {
    selectedCandidate = piece;

    const container = document.getElementById("selectedCandidateInfo"); // ← 追加！
    container.style.display = "block";

    document.getElementById("selectedCandidateInfo").style.display = "block"
    document.getElementById("selectedCandidatemoveInfo").style.display = "block";

    const displayName = getDisplayName(piece.type)


    container.className = "pnIfo";  // ここでCSSクラスをセット

    const maxhp = piece.maxhp;

    // アップグレードを取得
    const upgrade = playerUpgrades[piece.name] || {};

    // 強化値の取得
    const hpBoost = upgrade.hp || 0;
    const atkBoost = upgrade.atk || 0;
    const defBoost = upgrade.def || 0;

    // 現在値から強化分を引いて基礎値を算出
    const baseHp = piece.hp - hpBoost;
    const baseAtk = piece.atk - atkBoost;
    const baseDef = piece.def - defBoost;

    // 表示用の関数
    const formatStat = (base, boost) => {
        return boost > 0 ? `${base}（+${boost}）` : `${base}`;
    };

    // innerHTML に反映
    container.innerHTML = `
    <h3 style="color: #faf7f7ff;">選択中の駒</h3>
    <h3 style="color: #fcfafaff;">${displayName}(${piece.name})</h3>
    <p><span style="color:#0f0;">HP:</span> ${formatStat(baseHp, hpBoost)}</p>
    <p><span style="color:#f55;">攻撃力:</span> ${formatStat(baseAtk, atkBoost)}</p>
    <p><span style="color:#55f;">防御力:</span> ${formatStat(baseDef, defBoost)}</p>
    ${piece.abilityName ? `<p style="color:#ff0;">能力: ${piece.abilityName}</p>` : ''}
    ${piece.abilityDescription ? `<p style="font-size: 0.9em; color: #aaa;">${piece.abilityDescription}</p>` : ''}
    <p style="margin-top:8px;">＜説明＞</p>
    <p style="font-size: 13px;">${piece.outline}</p>
    `;


    // === 移動パターン描画 ===
    const size = 9;
    const grid = [];
    let moveList = movepattern(piece);

    const moveGrid = document.getElementById("moveGrid2");

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (r === 4 && c === 4) {
                cell.textContent = getDisplayName(piece.type);
                cell.classList.add("center");
            }
            grid.push(cell);
        }
    }

    for (const [dr, dc] of moveList) {
        const r = 4 + dr;
        const c = 4 + dc;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            const index = r * 9 + c;
            grid[index].classList.add("move");
        }
    }

    moveGrid.innerHTML = "";
    for (const cell of grid) {
        moveGrid.appendChild(cell);
    }
    document.getElementById("confirmRankupBtn").style.display = "inline-block";
}
//駒をランクアップ
function confirmRankup() {
    if (!selectedCandidate || !selectedPiece) return;

    const saveData = JSON.parse(localStorage.getItem("customslot"));

    const { row, col } = selectedPiece;
    saveData.board[row][col] = {
        ...selectedCandidate,
        name: selectedPiece.name,
        backname: selectedPiece.backname,
        player: 1,
    };

    localStorage.setItem("customslot", JSON.stringify(saveData));
    showImpactMessage("ランクアップ", "gold", duration = 200,);

    document.getElementById("rankupScreen").style.display = "none";
    document.getElementById("selectedPieceInfo").style.display = "none";
    document.getElementById("playerPiecesContainer").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn1").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn2").style.display = "none";
    document.getElementById("rankupCandidatesContainer").style.display = "none";
    document.getElementById("selectedCandidateInfo").style.display = "none";
    document.getElementById("confirmRankupBtn").style.display = "none";
    document.getElementById("selectedmoveInfo").style.display = "none";
    document.getElementById("selectedCandidatemoveInfo").style.display = "none";
    goToStageSelect();
}

//オートセーブ設定
function autosave() {
    // 盤面初期化
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }

    const saveData = JSON.parse(localStorage.getItem("customslot"));

    if (!saveData) {
        // 保存データがなければ playerTeam を使って初期盤面をセット
        for (const ally of playerTeam) {
            board[ally.row][ally.col] = createPiece(ally.type, 1, ally.name, ally.backname);
        }
    } else {
        // 保存データの board から盤面を復元
        for (let row = 0; row < saveData.board.length; row++) {
            for (let col = 0; col < saveData.board[row].length; col++) {
                const piece = saveData.board[row][col];
                if (piece) {
                    board[row][col] = createPiece(piece.type, piece.player, piece.name, piece.backname);
                    // 必要なら hp や atk などもここでセット可能
                    board[row][col].hp = piece.hp;
                    board[row][col].atk = piece.atk;
                    board[row][col].def = piece.def;
                    board[row][col].outline = piece.outline;
                    board[row][col].rank = piece.rank;
                    board[row][col].playerUpgrades = piece.playerUpgrades;
                } else {
                    board[row][col] = null;
                }
            }
        }
    }

    const saveData1 = customDataSave(); // ← あなたのセーブデータ収集関数
    const key = "customslot";
    localStorage.setItem(key, JSON.stringify(saveData1));
}

//最初のセーブ設定
function firstsave() {
    // 盤面初期化
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }

    for (const ally of playerTeam) {
        board[ally.row][ally.col] = createPiece(ally.type, 1, ally.name, ally.backname);
    }

    const saveData1 = customDataSave(); // ← あなたのセーブデータ収集関数
    const key = "customslot";
    localStorage.setItem(key, JSON.stringify(saveData1));
}
//はじめから
function Newgame() {
    playerUpgrades = {};  // 強化データをリセット
    clearedStages = [];  // クリアしたステージIDや名前を保存
    unclearedStages = []; // クリアできなかったステージIDや名前を保存
    exp = 0;              // EXPもリセット
    firstsave();
    goToStageSelect();
}
//つづきから
function Continue() {
    loadFromSlot();
    goToStageSelect();
}
//オート移動
function automove(pieceType) {
    // 指定された type を持つ駒を収集
    const piecesToMove = [];
    const allMoves = [];
    let Auto_LEVEL = 1;
    let move;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.type === pieceType) {
                piecesToMove.push({ piece, row, col });
            }
        }
    }


    if (pieceType === "Innsyu") {
        Auto_LEVEL = 1;
    } else if (pieceType === "PS4") {
        Auto_LEVEL = 4;
    } else if (pieceType === "Switch") {
        Auto_LEVEL = 3;
    } else if (pieceType === "PS5") {
        Auto_LEVEL = 8;
    } else if (pieceType === "Switch2") {
        Auto_LEVEL = 4;
    } else if (pieceType === "Facebook") {
        Auto_LEVEL = 3;
    } else if (pieceType === "Twitter") {
        Auto_LEVEL = 2;
    } else if (pieceType === "Instagram") {
        Auto_LEVEL = 4;
    } else if (pieceType === "LINE") {
        Auto_LEVEL = 8;
    } else if (pieceType === "GPT") {
        Auto_LEVEL = 10;
    }

    // 各駒に対して1回ずつ動かす
    for (const { piece, row, col } of piecesToMove) {
        const moves = getValidMoves(piece, row, col);
        if (moves.length === 0) continue;
        for (const [toRow, toCol] of moves) {
            allMoves.push({ fromRow: row, fromCol: col, toRow, toCol });
        }

        //ランダム攻撃
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        //単位優先攻撃
        const CreditattackMove = allMoves.find(m => {
            const target = board[m.toRow][m.toCol];
            return target && target.type === PieceType.Credit;
        });

        //先生優先攻撃
        const TeacherattackMove = allMoves.find(m => {
            const target = board[m.toRow][m.toCol];
            return target && target.type === PieceType.Teacher;
        });

        //プレイヤーの駒を攻撃
        const PattackMove = allMoves.find(m => {
            const target = board[m.toRow][m.toCol];
            if (!target) return false;
            if (target.player === 1) {
                const attacker = board[m.fromRow][m.fromCol];
                if (!attacker) return false; // ← ここを追加
                return attacker.atk > target.def;
            }
        });

        //CPUの駒を攻撃
        const CattackMove = allMoves.find(m => {
            const target = board[m.toRow][m.toCol];
            if (!target) return false;
            if (target.player === 2) {
                const attacker = board[m.fromRow][m.fromCol];
                if (!attacker) return false; // ← ここを追加
                return attacker.atk > target.def;
            }
        });

        //CPUの方へ近づく
        const CgoMove = allMoves.find(m => {
            return [m.fromRow] > [m.toRow];
        });

        //プレイヤーの方へ近づく
        const PgoMove = allMoves.find(m => {
            return [m.fromRow] < [m.toRow];
        });

        //危険回避(取られにくい手)
        const safeMoves = allMoves.filter(m => !isDangerousAfterMove(m));

        // 好みに応じて動かし方を変えられる（例：ランダム）
        if (Auto_LEVEL === 1) {
            // レベル1：ランダム
            move = randomMove;

        } else if (Auto_LEVEL === 2) {
            // レベル2：CPUの駒を優先的に攻撃
            move = CattackMove || randomMove;

        } else if (Auto_LEVEL === 3) {
            //レベル３： 先生攻撃 + CPU攻撃
            if (TeacherattackMove) {
                move = TeacherattackMove;
            } else if (CattackMove) {
                move = CattackMove;
            } else {
                move = randomMove;
            }
        } else if (Auto_LEVEL === 4) {
            //レベル4： 先生攻撃 + CPU攻撃 + CPU移動
            if (TeacherattackMove) {
                move = TeacherattackMove;
            } else if (CattackMove) {
                move = CattackMove;
            } else if (CgoMove) {
                move = CgoMove;
            } else {
                move = randomMove;
            }

        } else if (Auto_LEVEL === 5) {
            // レベル5：プレイヤーの駒を優先的に攻撃
            move = PattackMove || randomMove;

        } else if (Auto_LEVEL === 6) {
            //レベル6：  単位攻撃 + プレイヤー攻撃
            if (CreditattackMove) {
                move = CreditattackMove;
            } else if (PattackMove) {
                move = PattackMove;
            } else {
                move = randomMove;
            }
        } else if (Auto_LEVEL === 7) {
            //レベル7：  単位攻撃 + プレイヤー攻撃 + プレイヤー移動
            if (CreditattackMove) {
                move = CreditattackMove;
            } else if (PattackMove) {
                move = PattackMove;
            } else if (PgoMove) {
                move = PgoMove;
            } else {
                move = randomMove;
            }
        } else if (Auto_LEVEL === 8) {
            move = selectBestMove(allMoves, 5);
        } else if (Auto_LEVEL === 9) {
            move = selectBestMove(allMoves, 3);
        } else if (Auto_LEVEL === 10) {
            move = selectBestMove(allMoves, 1);
        }

        // 実際にボードを更新して移動を実行する関数を呼び出す（仮定）
        movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
        draw(ctx, canvas); // CPUターンの最後に追加推奨
        checkKingDefeatedAfterTurn();
    }

}
//ターン開始時の能力発揮
function startturnmove() {
    //遊戯の能力
    if (findAllPiecesOfType("Yuugi").length > 0) {
        if (turnCount === 14) {
            createRandomPiece(5, 0, "PS4", 1);
        }
        if (turnCount === 17) {
            createRandomPiece(5, 0, "Switch", 1);
        }
        if (turnCount === 20) {
            createRandomPiece(5, 0, "PS5", 1);
        }
        if (turnCount === 25) {
            createRandomPiece(5, 0, "Switch2", 1);
        }
    }
    //賭博の能力
    if (turnCount !== 7 && turnCount !== 77 && turnCount !== 777) {
        applyGambleToTobaku(); // 通常：ギャンブルで３倍 or 半減
    } else {
        // 7 / 77 / 777 のとき：確定で3倍ボーナス
        const targets = findAllPiecesOfType("Tobaku");
        for (const { piece } of targets) {
            piece.hp *= 3;
            piece.atk *= 3;
            piece.def *= 3;
            console.log(`${piece.type} がラッキーターンでステータス2倍！`);
        }
    }
    //回復能力
    if (findAllPiecesOfType("Hayabenn").length > 0) {
        const healers = findAllPiecesOfType("Hayabenn"); // 例：Healer というタイプの駒
        for (const { row, col, piece } of healers) {
            healAround(piece, row, col);
            console.log("回復しました");
        }
    } else if (findAllPiecesOfType("Bakusui").length > 0) {
        const healers = findAllPiecesOfType("Bakusui"); // 例：Healer というタイプの駒
        for (const { row, col, piece } of healers) {
            healAround(piece, row, col);
        }
    }
    //遅刻の能力
    if (turnCount === 10) {
        restoreRemovedPieces("Tikoku");
    }
    //SNSの能力
    if (findAllPiecesOfType("SNS").length > 0) {
        if (turnCount === 4) {
            createRandomPiece(5, 0, "Facebook", 1);
        }
        if (turnCount === 6) {
            createRandomPiece(5, 0, "Twitter", 1);
        }
        if (turnCount === 10) {
            createRandomPiece(5, 0, "Instagram", 1);
        }
        if (turnCount === 11) {
            createRandomPiece(5, 0, "LINE", 1);
        }
    }
    //Gs,Giの能力
    if (findAllPiecesOfType("Gs").length > 0) {
        if (findAllPiecesOfType("Gi").length > 0) {
            if (turnCount % 10 === 0) {
                createRandomPiece(2, 8, "PKA", 2);
            }
        } else {
            if (turnCount % 10 === 0) {
                createRandomPiece(2, 8, "PKA", 2);
                createRandomPiece(2, 8, "PKA", 2);
            }
        }
    }
    //Gqの能力
    if (findAllPiecesOfType("Gq").length > 0) {
        if (turnCount % 10 === 0) {
            createRandomPiece(2, 8, "PKC", 2);
        }
    }
    //バフ能力
    if (findAllPiecesOfType("Kakomonn").length > 0) {
        if (turnCount % 8 === 0) {
            const healers = findAllPiecesOfType("Kakomonn");
            for (const { row, col, piece } of healers) {
                BuffAround(piece, row, col);
            }
        }
    }
    if (findAllPiecesOfType("Kyousi").length > 0) {
        if (turnCount % 5 === 0) {
            const healers = findAllPiecesOfType("Kyousi");
            for (const { row, col, piece } of healers) {
                BuffAround(piece, row, col);
            }
        }
    }
}
//自分のターン終了時の能力発揮
function playerendtturnmove() {
    if (findAllPiecesOfType("Nomikai").length > 0) {
        createRandomPiece(5, 0, "Innsyu", 1);
    }

    const healConfigs = [
        { type: "Teachermove", interval: 10, healAmount: 1 },
        { type: "Teachermove2", interval: 5, healAmount: 3 },
        { type: "Teachermove3", interval: 3, healAmount: 10 }
    ];

    for (const { type, interval, healAmount } of healConfigs) {
        if (turnCount % interval === 0) {
            const teachers = findAllPiecesOfType(type);
            for (const { piece } of teachers) {
                console.log(`Piece: ${piece.type}, hp: ${piece.hp}, maxhp: ${piece.maxhp}`);
                piece.hp += healAmount;

                if (typeof piece.maxhp === "number" && piece.hp > piece.maxhp) {
                    piece.hp = piece.maxhp;
                    console.log(`上限超過！hp: ${piece.hp}, maxhp: ${piece.maxhp}`);
                } else {
                    console.warn(`⚠ maxhp が未定義の駒: ${piece.type}`);
                }
            }
        }
    }

    const innsyuPieces = findAllPiecesOfType("Innsyu");

    // 順に 500ms ごとに動かす
    innsyuPieces.forEach((piece, index) => {
        setTimeout(() => {
            automove1(piece);
        }, 500 * index);
    });

    setTimeout(() => automove("PS4"), 500);
    setTimeout(() => automove("Switch"), 500);
    setTimeout(() => automove("PS5"), 500);
    setTimeout(() => automove("Switch2"), 500);
    setTimeout(() => automove("Facebook"), 500);
    setTimeout(() => automove("Twitter"), 500);
    setTimeout(() => automove("Instagram"), 500);
    setTimeout(() => automove("LINE"), 500);
    setTimeout(() => automove("GPT"), 500);
    setTimeout(() => automove("GPT"), 500);
    setTimeout(() => automove("Toukei"), 500);
    setTimeout(() => automove("Teachermove3"), 500);

}
//盤面にある特定の駒の位置を示す
function findAllPiecesOfType(typeToFind) {
    const positions = [];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.type === typeToFind) {
                positions.push({ row, col, piece });
            }
        }
    }

    return positions; // 空配列なら存在しない
}
//盤面にある特定のプレイヤーの駒の位置を示す
function findAllPiecesOfplayer(playerToFind) {
    const positions = [];

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.player === playerToFind) {
                positions.push({ row, col, piece });
            }
        }
    }

    return positions; // 空配列なら存在しない
}
//4分の１でステータス変化
function gambleStatus(piece) {

    // 50%の確率で当たり or ハズレ
    const isWin = Math.random() < 0.25;

    if (isWin) {
        // 当たり：3倍にする
        piece.hp *= 3;
        piece.atk *= 3;
        piece.def *= 3;

        if (piece.maxHp !== undefined) {
            piece.maxHp *= 3;
        }
        console.log(`${piece.type} が当たりステータス2倍`);
    } else {
        // ハズレ：半分にする（小数は切り捨て）
        piece.hp = Math.floor(piece.hp / 2);
        piece.atk = Math.floor(piece.atk / 2);
        piece.def = Math.floor(piece.def / 2);
        if (piece.maxHp !== undefined) {
            piece.maxHp = Math.floor(piece.maxHp / 2);
        }
        console.log(`${piece.type} がハズレ...ステータス半減`);
    }
}
//遊戯の能力
function applyGambleToTobaku() {
    const targets = findAllPiecesOfType("Tobaku");

    for (const { piece } of targets) {
        gambleStatus(piece);
    }
}
//回復能力
function healAround(piece, row, col) {
    let directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 0], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    let x = 0;
    if (piece.type === "Hayabenn") {
        x = 1;
        directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 0], [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];
    } else if (piece.type === "Bakusui") {
        x = 3;
        directions = [
            [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
            [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
            [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
            [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
            [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
        ];
    }

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) continue;

        const target = board[newRow][newCol];

        if (
            target &&
            target.player === piece.player &&       // 味方
            target.hp < target.maxhp                // HPが減っている
        ) {
            target.hp = Math.min(target.hp + x, target.maxhp); // 最大HPを超えないように


            // ✅ 効果音再生
            playSound("healSound");

            // ✅ エフェクト表示（例：緑）
            showEffect(newCol * TILE_SIZE, newRow * TILE_SIZE, "lime", ctx);
            console.log(`回復：${target.type} (${newRow}, ${newCol}) → HP: ${target.hp}/${target.maxhp}`);
        }
    }
}
//遅刻の能力（消える）
function removePiece(type) {
    if (!removedPieces[type]) {
        removedPieces[type] = [];
    }

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.type === type) {
                // 保存してから削除
                removedPieces[type].push({ piece, row, col });
                board[row][col] = null;
                console.log(`${type} を (${row}, ${col}) から削除`);
            }
        }
    }
}
//遅刻の能力（再登場）
function restoreRemovedPieces(type) {
    const saved = removedPieces[type];
    if (!saved || saved.length === 0) {
        console.log(`${type} の保存データが見つかりません`);
        return;
    }

    for (const { piece, row, col } of saved) {
        // 復元先が空なら元の位置に戻す
        if (board[row][col] === null) {
            board[row][col] = piece;
            console.log(`${type} を (${row}, ${col}) に復元`);
        } else {
            return;
        }
    }

    // 復元後は保存データを削除
    removedPieces[type] = [];
}
//バフ能力
function BuffAround(piece, row, col) {
    let directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 0], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    let x = 0;
    let y = 0;
    if (piece.type === "Kakomonn") {
        x = 1;
        y = 0;
    } else if (piece.type === "Kyousi") {
        x = 1;
        y = 1;
    }

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) continue;

        const target = board[newRow][newCol];

        if (target && target.player === piece.player) {
            target.atk = target.atk + x;
            target.def = target.def + y;
            // ✅ 効果音再生
            playSound("buffSound");

            // ✅ エフェクト表示（例：青）
            showEffect(newCol * TILE_SIZE, newRow * TILE_SIZE, "deepskyblue", ctx);
        }
    }
}
//サウンド再生
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0; // 巻き戻す
        sound.play();
    }
}
//エフェクト再生
function showEffect(x, y, color, ctx) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    // 数フレーム後に消すなど、工夫可能（ここでは一時的に描画）
}
//オート移動スコア評価
function evaluateMove(move) {
    const attacker = board[move.fromRow][move.fromCol];
    const target = board[move.toRow][move.toCol];

    let score = 0;

    // 1. 敵を倒せる
    if (target && target.player !== attacker.player) {
        if (attacker.atk > target.def) {
            score += 300; // 倒せる敵は価値が高い
            if (target.type === "Credit") score += 10000;
            if (target.type === "Teacher") score += 10000;
        } else {
            score -= 100; // 攻撃しても無駄 or 返り討ち
        }
    }

    // 3. 敵に近づく（攻めの姿勢）
    const enemyDirection = attacker.player === 1 ? -1 : 1;
    if (move.toRow - move.fromRow === enemyDirection) {
        score += 50;
    }

    // 4. 自分のHPが低ければ、安全優先
    if (attacker.hp < attacker.maxhp / 2) {
        if (!isDangerousAfterMove(move)) {
            score += 100;
        } else {
            score -= 200;
        }
    } else {
        if (!isDangerousAfterMove(move)) {
            score += 20;
        } else {
            score -= 10;
        }
    }

    const centerCol = Math.floor(COLS / 2);
    const distFromCenter = Math.abs(move.toCol - centerCol);

    // 中央に近いほど得点アップ。遠いほど減点にする例
    // 例えば、最大3ポイント差をつける
    score += (COLS / 2 - distFromCenter) * 3;

    return score;
}
//最善手の選択
function selectBestMove(allMoves, level = 5) {
    const scoredMoves = allMoves.map(move => ({
        move,
        score: evaluateMove(move)
    }));

    // スコア順にソート（高い順）
    scoredMoves.sort((a, b) => b.score - a.score);

    // レベルによって選択肢の幅を決める
    const topN = Math.max(1, Math.floor(level)); // 1〜最大レベルまで

    const candidates = scoredMoves.slice(0, topN);
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    return selected.move;
}
//EXP表示を更新
function updateExpDisplay() {
    const expDisplay = document.getElementById("exp-display");
    expDisplay.textContent = `EXP : ${exp}`;
}
//強化画面へ
function goToUpgrade() {
    document.getElementById("stageSelectScreen").style.display = "none";
    document.getElementById("expUseScreen").style.display = "block";
    document.getElementById("statusBoostScreen").style.display = "none";
    document.getElementById("statusBoostOptions").style.display = "none";
}

//駒を変更する画面へ
function showChangePieceScreen() {


    if (exp < 200) {
        showAlert("EXPが不足しています");
        return;
    }

    const container = document.getElementById("playerPiecesContainer");
    container.innerHTML = "";

    let pieces = [];

    const saved = localStorage.getItem("customslot");

    if (saved) {
        const saveData = JSON.parse(saved);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = saveData.board[row][col];
                if (!piece) continue; // pieceがないならスキップ

                if (piece.type === "Credit") {
                    // 処理をスキップしたいなら continue に変更
                    continue;
                }


                if (piece.player === 1 && piece.rank < 5 && piece.rank > 1) {
                    applyUpgradesToPiece(piece); // ← 強化反映
                    pieces.push({ ...piece, row, col });
                }
            }
        }
    } else {
        // customslotがない → playerTeamから取得
        for (const ally of playerTeam) {
            const piece = {
                type: ally.type,
                player: 1,
                name: ally.name,
                backname: ally.backname,
                row: ally.row,
                col: ally.col,
                hp: ally.hp ?? 100,      // 例：hpがなければ100に設定
                atk: ally.atk ?? 10,
                def: ally.def ?? 5,
            };
            applyUpgradesToPiece(piece); // ← 強化反映
            pieces.push(piece);
        }
    }

    if (pieces.length === 0) {
        showAlert("表示できるプレイヤーの駒が見つかりません");
        return;
    }

    document.getElementById("rankupScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("selectedPieceInfo").style.display = "none";
    document.getElementById("playerPiecesContainer").style.display = "block";
    document.getElementById("showUpgradeCandidatesBtn1").style.display = "none";
    document.getElementById("showUpgradeCandidatesBtn2").style.display = "none";
    document.getElementById("rankupCandidatesContainer").style.display = "none";
    document.getElementById("selectedCandidateInfo").style.display = "none";
    document.getElementById("confirmRankupBtn").style.display = "none";
    document.getElementById("selectedmoveInfo").style.display = "none";
    document.getElementById("selectedCandidatemoveInfo").style.display = "none";
    document.getElementById("rankupP1").style.display = "none";
    document.getElementById("rankupP2").style.display = "none";
    document.getElementById("rankupP3").style.display = "block";
    document.getElementById("rankupP4").style.display = "none";
    document.getElementById("expUseScreen").style.display = "none";
    document.getElementById("rankuptitle1").style.display = "none";
    document.getElementById("rankuptitle2").style.display = "block";

    exp = exp - 200;


    pieces.forEach(piece => {
        const canvas = document.createElement("canvas");
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        canvas.style.margin = "5px";
        canvas.style.cursor = "pointer";

        const ctx = canvas.getContext("2d");
        drawCardPiece(ctx, piece, 0, 0);

        canvas.onclick = () => selectPieceForRankup(piece, 2);

        container.appendChild(canvas);
    });
}
//強化状態を反映
function applyUpgradesToPiece(piece) {
    if (!piece.name) return;

    const upgrade = playerUpgrades[piece.name];
    if (!upgrade) return;

    // baseステータスがなければ中止
    if (piece.baseHp == null || piece.baseAtk == null || piece.baseDef == null) return;

    // base + 強化 を再計算
    piece.hp = piece.baseHp + (upgrade.hp ?? 0);
    piece.atk = piece.baseAtk + (upgrade.atk ?? 0);
    piece.def = piece.baseDef + (upgrade.def ?? 0);
    console.log("アップグレード適用:", piece.name, piece);
}
//HP強化
function boostHP(pieceName) {
    if (exp < 100) {
        showAlert("EXPが不足しています");
        return;
    }

    if (!playerUpgrades[pieceName]) {
        playerUpgrades[pieceName] = {};
    }

    playerUpgrades[pieceName].hp = (playerUpgrades[pieceName].hp || 0) + 1;
    exp -= 100;

    showAlert(`${pieceName} の HP を強化しました！`);
    autosave(); // 保存処理があるなら
}
//攻撃力強化
function boostATK(pieceName) {
    if (exp < 500) {
        showAlert("EXPが不足しています");
        return;
    }

    if (!playerUpgrades[pieceName]) {
        playerUpgrades[pieceName] = {};
    }

    playerUpgrades[pieceName].atk = (playerUpgrades[pieceName].atk || 0) + 1;
    exp -= 500;

    showAlert(`${pieceName} の 攻撃力 を強化しました！`);
    autosave();
}
//防御力強化
function boostDEF(pieceName) {
    if (exp < 5000) {
        showAlert("EXPが不足しています");
        return;
    }

    if (!playerUpgrades[pieceName]) {
        playerUpgrades[pieceName] = {};
    }

    playerUpgrades[pieceName].def = (playerUpgrades[pieceName].def || 0) + 1;
    exp -= 5000;

    showAlert(`${pieceName} の 防御力 を強化しました！`);
    autosave();
}
//ステータス強化画面へ
function showStatusBoostScreen() {

    const container = document.getElementById("statusBoostPiecesContainer");
    container.innerHTML = "";

    let pieces = [];

    const saved = localStorage.getItem("customslot");

    if (saved) {
        const saveData = JSON.parse(saved);

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = saveData.board[row][col];
                if (!piece) continue; // pieceがないならスキップ

                if (piece.player === 1) {
                    applyUpgradesToPiece(piece); // ← 強化反映
                    pieces.push({ ...piece, row, col });
                }
            }
        }
    } else {
        // customslotがない → playerTeamから取得
        for (const ally of playerTeam) {
            const piece = {
                type: ally.type,
                player: 1,
                name: ally.name,
                backname: ally.backname,
                row: ally.row,
                col: ally.col,
                hp: ally.hp ?? 1,      // 例：hpがなければ100に設定
                atk: ally.atk ?? 1,
                def: ally.def ?? 1,
            };
            applyUpgradesToPiece(piece); // ← 強化反映
            pieces.push(piece);
        }
    }

    if (pieces.length === 0) {
        showAlert("表示できるプレイヤーの駒が見つかりません");
        return;
    }


    document.getElementById("statusBoostScreen").style.display = "block";
    document.getElementById("expUseScreen").style.display = "none";
    document.getElementById("statusBoostPieceInfo").style.display = "none";
    document.getElementById("statusBoostmoveInfo").style.display = "none";
    document.getElementById("statusBoostOptions").style.display = "none";


    pieces.forEach(piece => {
        const canvas = document.createElement("canvas");
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        canvas.style.margin = "5px";
        canvas.style.cursor = "pointer";

        const ctx = canvas.getContext("2d");
        drawCardPiece(ctx, piece, 0, 0);

        canvas.onclick = () => selectPieceForStatusBoost(piece);
        canvas.id = `canvas_${piece.name}`; // ←追加

        container.appendChild(canvas);
    });
}

//ステータスアップしたい駒を選択
function selectPieceForStatusBoost(piece) {
    selectedPiece = piece;

    const container = document.getElementById("statusBoostPieceInfo");
    container.style.display = "block";

    document.getElementById("statusBoostmoveInfo").style.display = "block";

    const displayName = getDisplayName(piece.type)


    container.className = "pnIfo";  // ここでCSSクラスをセット

    const maxhp = piece.maxhp;

    // アップグレードを取得
    const upgrade = playerUpgrades[piece.name] || {};

    // 強化値の取得
    const hpBoost = upgrade.hp || 0;
    const atkBoost = upgrade.atk || 0;
    const defBoost = upgrade.def || 0;

    // 現在値から強化分を引いて基礎値を算出
    const baseHp = piece.hp - hpBoost;
    const baseAtk = piece.atk - atkBoost;
    const baseDef = piece.def - defBoost;

    // 表示用の関数
    const formatStat = (base, boost) => {
        return boost > 0 ? `${base}（+${boost}）` : `${base}`;
    };

    // innerHTML に反映
    container.innerHTML = `
    <h3 style="color: #faf7f7ff;">選択中の駒</h3>
    <h3 style="color: #fcfafaff;">${displayName}(${piece.name})</h3>
    <p><span style="color:#0f0;">HP:</span> ${formatStat(baseHp, hpBoost)}</p>
    <p><span style="color:#f55;">攻撃力:</span> ${formatStat(baseAtk, atkBoost)}</p>
    <p><span style="color:#55f;">防御力:</span> ${formatStat(baseDef, defBoost)}</p>
    ${piece.abilityName ? `<p style="color:#ff0;">能力: ${piece.abilityName}</p>` : ''}
    ${piece.abilityDescription ? `<p style="font-size: 0.9em; color: #aaa;">${piece.abilityDescription}</p>` : ''}
    <p style="margin-top:8px;">＜説明＞</p>
    <p style="font-size: 13px;">${piece.outline}</p>
    `;


    // === 移動パターン描画 ===
    const size = 9;
    const grid = [];
    let moveList = movepattern(piece);

    const moveGrid = document.getElementById("statusBoostmoveGrid");

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (r === 4 && c === 4) {
                cell.textContent = getDisplayName(piece.type);
                cell.classList.add("center");
            }
            grid.push(cell);
        }
    }

    for (const [dr, dc] of moveList) {
        const r = 4 + dr;
        const c = 4 + dc;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            const index = r * 9 + c;
            grid[index].classList.add("move");
        }
    }

    moveGrid.innerHTML = "";
    for (const cell of grid) {
        moveGrid.appendChild(cell);
    }

    document.getElementById("statusBoostOptions").style.display = "block";

    const HPbtn = document.getElementById("boostHP");
    const ATKbtn = document.getElementById("boostATK");
    const DEFbtn = document.getElementById("boostDEF");

    HPbtn.onclick = () => {
        boostHP(selectedPiece.name);
        applyUpgradesToPiece(selectedPiece);
        selectPieceForStatusBoost(selectedPiece);
        updateExpDisplay();
        redrawSelectedPieceCanvas();
    };
    ATKbtn.onclick = () => {
        boostATK(selectedPiece.name);
        applyUpgradesToPiece(selectedPiece);
        selectPieceForStatusBoost(selectedPiece);
        updateExpDisplay();
        redrawSelectedPieceCanvas();
    };
    DEFbtn.onclick = () => {
        boostDEF(selectedPiece.name);
        applyUpgradesToPiece(selectedPiece);
        selectPieceForStatusBoost(selectedPiece);
        updateExpDisplay();
        redrawSelectedPieceCanvas();
    };

}
//再描画
function redrawSelectedPieceCanvas() {
    const canvas = document.getElementById(`canvas_${selectedPiece.name}`);
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // クリア
        drawCardPiece(ctx, selectedPiece, 0, 0);          // 再描画
    }
}
// 1体だけ動かすように変更
function automove1({ piece, row, col }) {
    const moves = getValidMoves(piece, row, col);
    if (moves.length === 0) return;

    const allMoves = moves.map(([toRow, toCol]) => ({
        fromRow: row,
        fromCol: col,
        toRow,
        toCol,
    }));

    let Auto_LEVEL = 1;
    const pieceType = piece.type;

    if (pieceType === "Innsyu") {
        Auto_LEVEL = 1;
    } else if (pieceType === "PS4") {
        Auto_LEVEL = 4;
    } else if (pieceType === "Switch") {
        Auto_LEVEL = 3;
    } else if (pieceType === "PS5") {
        Auto_LEVEL = 8;
    } else if (pieceType === "Switch2") {
        Auto_LEVEL = 4;
    } else if (pieceType === "Facebook") {
        Auto_LEVEL = 3;
    } else if (pieceType === "Twitter") {
        Auto_LEVEL = 2;
    } else if (pieceType === "Instagram") {
        Auto_LEVEL = 4;
    } else if (pieceType === "LINE") {
        Auto_LEVEL = 8;
    } else if (pieceType === "GPT") {
        Auto_LEVEL = 10;
    }



    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];

    const CreditattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        return target && target.type === PieceType.Credit;
    });

    const TeacherattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        return target && target.type === PieceType.Teacher;
    });

    const PattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        return target && target.player === 1 && piece.atk > target.def;
    });

    const CattackMove = allMoves.find(m => {
        const target = board[m.toRow][m.toCol];
        return target && target.player === 2 && piece.atk > target.def;
    });

    const CgoMove = allMoves.find(m => m.fromRow > m.toRow);
    const PgoMove = allMoves.find(m => m.fromRow < m.toRow);
    const safeMoves = allMoves.filter(m => !isDangerousAfterMove(m));

    let move;
    if (Auto_LEVEL === 1) {
        move = randomMove;
    } else if (Auto_LEVEL === 2) {
        move = CattackMove || randomMove;
    } else if (Auto_LEVEL === 3) {
        move = TeacherattackMove || CattackMove || randomMove;
    } else if (Auto_LEVEL === 4) {
        move = TeacherattackMove || CattackMove || CgoMove || randomMove;
    } else if (Auto_LEVEL === 5) {
        move = PattackMove || randomMove;
    } else if (Auto_LEVEL === 6) {
        move = CreditattackMove || PattackMove || randomMove;
    } else if (Auto_LEVEL === 7) {
        move = CreditattackMove || PattackMove || PgoMove || randomMove;
    } else if (Auto_LEVEL === 8) {
        move = selectBestMove(allMoves, 5);
    } else if (Auto_LEVEL === 9) {
        move = selectBestMove(allMoves, 3);
    } else if (Auto_LEVEL === 10) {
        move = selectBestMove(allMoves, 1);
    }

    if (move) {
        movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
    }

    draw(ctx, canvas);
    checkKingDefeatedAfterTurn();
}
//パス
function pass() {
    selected = null;
    validMoves = []; // ★ハイライトリセット
    clearPieceInfo();// 移動処理後は情報消すか、もしくは移動先の駒情報を表示してもよい
    checkKingDefeatedAfterTurn();
    if (!checkKingDefeatedAfterTurn()) {
        playerendtturnmove();
        currentPlayer = 2;
        setTimeout(cpuMove, 500);
        turnCount += 1;
        updateTurnDisplay();
        startturnmove();
    }
}
//投了
function touryou() {
    console.log("unStageClear");
    canvas.removeEventListener("click", handleClick);
    showImpactMessage("落単", "blue", 2000, unStageClear(stageId));
    removedPieces["Tikoku"] = [];
}

let isImpactShowing = false; // ゲーム制御用のフラグ
//強いメッセージ
function showImpactMessage(message, color = "black", duration = 2000, onComplete = null) {
    const overlay = document.getElementById('impactOverlay');
    const messageBox = document.getElementById('impactMessage');

    isImpactShowing = true; // 入力・処理ブロック

    messageBox.textContent = message;
    messageBox.style.color = color;

    overlay.classList.add('show');
    messageBox.classList.add('show');

    // メッセージ表示後に処理
    setTimeout(() => {
        messageBox.classList.remove('show');
        overlay.classList.remove('show');
        isImpactShowing = false;

        if (typeof onComplete === 'function') {
            onComplete(); // ✅ 表示終了後に実行！
        }
    }, duration);
}
//HPが０の駒を削除する
function removeDeadPieces() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece && piece.hp <= 0) {
                console.log(`Removed ${piece.type} at (${row}, ${col})`);
                board[row][col] = null;
            }
        }
    }
}
//特定のプレイヤーの駒にバフデバフ
function applyGlobalBuff(player, atkDelta, defDelta, color = "yellow") {
    const pieces = findAllPiecesOfplayer(player);

    for (const { row, col, piece } of pieces) {
        piece.atk += atkDelta;
        piece.def += defDelta;

        // 効果音（バフ or デバフ）
        if (atkDelta > 0 || defDelta > 0) {
            playSound("buffSound");
        } else {
            playSound("debuffSound"); // デバフ用の音があれば
        }

        // エフェクト（色は引数で変更可能）
        showEffect(col * TILE_SIZE, row * TILE_SIZE, color, ctx);
    }
}




draw(ctx, canvas);
draw(customctx, customcanvas);
