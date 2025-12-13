
export interface VoiceOption {
    id: string;
    label: string;
    lang: 'jp' | 'en' | 'cn';
}

export const VOICES: Record<string, VoiceOption> = {
    // JP
    "igiari": { id: "igiari", label: "異議あり!", lang: "jp" },
    "matta": { id: "matta", label: "待った!", lang: "jp" },
    "kurae": { id: "kurae", label: "くらえ!", lang: "jp" },
    "damarinaa": { id: "damarinaa", label: "黙りなァ!", lang: "jp" },
    "satora-ja": { id: "satora-ja", label: "サトラ!", lang: "jp" },
    "hirehuse": { id: "hirehuse", label: "ひれ伏せ!", lang: "jp" },
    // EN
    "objection": { id: "objection", label: "Objection!", lang: "en" },
    "holdit": { id: "holdit", label: "Hold It!", lang: "en" },
    "takethat": { id: "takethat", label: "Take that!", lang: "en" },
    "silence": { id: "silence", label: "Silence!", lang: "en" },
    "satorha": { id: "satorha", label: "Satorha!", lang: "en" },
    "insolence": { id: "insolence", label: "Such Insolence!", lang: "en" },
    // CN
    "yiyi": { id: "yiyi", label: "异议!", lang: "cn" },
    "fandui": { id: "fandui", label: "反对!", lang: "cn" },
    "dengdeng": { id: "dengdeng", label: "等等!", lang: "cn" },
    "kanzhao": { id: "kanzhao", label: "看招!", lang: "cn" },
    "kanzhege": { id: "kanzhege", label: "看这个!", lang: "cn" },
    "bizui": { id: "bizui", label: "闭嘴!", lang: "cn" },
    "satora-cn": { id: "satora-cn", label: "沙特拉!", lang: "cn" },
    "guixia": { id: "guixia", label: "还不跪下!", lang: "cn" },
};

export interface Character {
    id: string;
    name: string;
    group: 'Lawyer' | 'Prosecutor';
    validVoices: string[];
}

export const CHARACTERS: Character[] = [
    // Lawyers
    {
        id: "cbt", name: "成步堂龙一", group: "Lawyer",
        validVoices: ["igiari", "objection", "yiyi", "fandui", "matta", "kurae", "dengdeng", "kanzhege", "kanzhao", "holdit", "takethat"]
    },
    {
        id: "qian", name: "绫里千寻", group: "Lawyer",
        validVoices: ["igiari", "objection", "yiyi", "matta", "kurae", "holdit", "takethat"]
    },
    {
        id: "wang", name: "王泥喜法介", group: "Lawyer",
        validVoices: ["igiari", "objection", "fandui", "matta", "kurae", "dengdeng", "kanzhege", "holdit", "takethat"]
    },
    {
        id: "xin", name: "希月心音", group: "Lawyer",
        validVoices: ["igiari", "objection", "fandui", "matta", "kurae", "dengdeng", "kanzhege", "holdit", "takethat"]
    },
    {
        id: "dhurke", name: "杜鲁克·史布国三", group: "Lawyer",
        validVoices: ["igiari", "objection", "fandui"]
    },

    // Prosecutors
    {
        id: "yuj", name: "御剑怜侍", group: "Prosecutor",
        validVoices: ["igiari", "objection", "yiyi", "fandui", "matta", "kurae", "holdit", "takethat"]
    },
    {
        id: "hao", name: "狩魔豪", group: "Prosecutor",
        validVoices: ["igiari", "objection", "yiyi"]
    },
    {
        id: "ming", name: "狩魔冥", group: "Prosecutor",
        validVoices: ["igiari", "objection", "yiyi"]
    },
    {
        id: "godo", name: "戈多(神乃木)", group: "Prosecutor",
        validVoices: ["igiari", "objection", "yiyi"]
    },
    {
        id: "yanei", name: "亚内", group: "Prosecutor",
        validVoices: ["igiari", "objection", "yiyi", "fandui"]
    },
    {
        id: "xiang", name: "牙琉响也", group: "Prosecutor",
        validVoices: ["igiari", "objection", "fandui"]
    },
    {
        id: "xun", name: "夕神迅", group: "Prosecutor",
        validVoices: ["igiari", "damarinaa", "objection", "silence", "fandui", "bizui"]
    },
    {
        id: "nayuta", name: "那由他", group: "Prosecutor",
        validVoices: ["igiari", "satora-ja", "objection", "satorha", "fandui", "satora-cn"]
    },
    {
        id: "garan", name: "伽蓝·希格塔尔·苍苑", group: "Prosecutor",
        validVoices: ["igiari", "hirehuse", "objection", "insolence", "fandui", "guixia"]
    },
];
