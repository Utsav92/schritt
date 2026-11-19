/* More language packs. `|` marks word boundaries in sentences for languages written without spaces (nospace).
   `roman` is an optional pronunciation guide in the same shape as `units`. `noType` replaces typing
   exercises with choosing and tile building (for scripts that are hard to type on a phone). */
Object.assign(window.PACKS, {
  esmx: { name: "Spanish (Mexico)", native: "Español (México)", tts: "es-MX", units: {
    basics: ["Hola", "Adiós", "Gracias", "Por favor", "Sí", "No", "Buenos días", "Hasta luego", "Disculpe", "Buenas noches",
             "Me llamo Anna", "Cómo estás", "Estoy bien", "Soy de la India", "Hablas inglés"],
    food: ["el hombre", "la mujer", "el niño", "el pan", "el agua", "el café", "la manzana", "la leche", "el queso", "la comida",
           "Tomo agua", "La mujer come una manzana", "Quisiera un café", "El niño toma leche", "Comemos pan y queso"],
    verbs: ["ser", "tener", "ir", "hacer", "aprender", "vivir", "trabajar", "venir", "hablar", "entender",
            "Estoy cansado", "Tienes un libro", "Vamos a la casa", "Él trabaja hoy", "Ellos aprenden inglés"],
    time: ["uno", "dos", "tres", "cuatro", "cinco", "hoy", "mañana", "ayer", "ahora", "la semana",
           "Son las tres", "Tengo dos hermanos", "Hoy es lunes", "Nos vemos mañana", "Mañana es martes"],
    places: ["la ciudad", "la casa", "la calle", "la estación", "el tren", "el hotel", "izquierda", "derecha", "derecho", "lejos",
             "Dónde está la estación", "El hotel está a la izquierda", "Viajo en tren", "Siga derecho", "Cuánto cuesta esto"],
    feelings: ["feliz", "triste", "cansado", "enojado", "enfermo", "nervioso", "orgulloso", "solo", "sorprendido", "tranquilo",
               "Hoy estoy muy feliz", "Él está triste", "Estamos nerviosos", "Ella está enferma", "Estoy orgulloso"]
  }},

  zh: { name: "Chinese (Mandarin)", native: "中文", tts: "zh-CN", nospace: true, noType: true, punct: { ".": "。", "?": "？", "!": "！" }, units: {
    basics: ["你好", "再见", "谢谢", "请", "是的", "不是", "早上好", "一会儿见", "打扰一下", "晚安",
             "我|叫|安娜", "你|好|吗", "我|很|好", "我|来自|印度", "你|会|说|英语|吗"],
    food: ["男人", "女人", "孩子", "面包", "水", "咖啡", "苹果", "牛奶", "奶酪", "食物",
           "我|喝|水", "女人|吃|一个|苹果", "我|想要|一杯|咖啡", "孩子|喝|牛奶", "我们|吃|面包|和|奶酪"],
    verbs: ["是", "有", "去", "做", "学习", "住", "工作", "来", "说", "明白",
            "我|很|累", "你|有|一本|书", "我们|回|家", "他|今天|工作", "他们|学习|英语"],
    time: ["一", "二", "三", "四", "五", "今天", "明天", "昨天", "现在", "星期",
           "现在|三|点", "我|有|两个|兄弟", "今天|是|星期一", "我们|明天|见", "明天|是|星期二"],
    places: ["城市", "房子", "街道", "火车站", "火车", "酒店", "左", "右", "直走", "远",
             "火车站|在|哪里", "酒店|在|左边", "我|坐|火车|旅行", "请|一直|走", "这个|多少|钱"],
    feelings: ["开心", "难过", "累", "生气", "生病", "紧张", "骄傲", "孤单", "惊讶", "平静",
               "今天|我|很|开心", "他|很|难过", "我们|很|紧张", "她|生病|了", "我|很|骄傲"]
  }, roman: {
    basics: ["nǐ hǎo", "zàijiàn", "xièxie", "qǐng", "shì de", "bú shì", "zǎoshang hǎo", "yíhuìr jiàn", "dǎrǎo yíxià", "wǎn'ān",
             "wǒ jiào Ān'nà", "nǐ hǎo ma", "wǒ hěn hǎo", "wǒ láizì Yìndù", "nǐ huì shuō Yīngyǔ ma"],
    food: ["nánrén", "nǚrén", "háizi", "miànbāo", "shuǐ", "kāfēi", "píngguǒ", "niúnǎi", "nǎilào", "shíwù",
           "wǒ hē shuǐ", "nǚrén chī yí ge píngguǒ", "wǒ xiǎng yào yì bēi kāfēi", "háizi hē niúnǎi", "wǒmen chī miànbāo hé nǎilào"],
    verbs: ["shì", "yǒu", "qù", "zuò", "xuéxí", "zhù", "gōngzuò", "lái", "shuō", "míngbai",
            "wǒ hěn lèi", "nǐ yǒu yì běn shū", "wǒmen huí jiā", "tā jīntiān gōngzuò", "tāmen xuéxí Yīngyǔ"],
    time: ["yī", "èr", "sān", "sì", "wǔ", "jīntiān", "míngtiān", "zuótiān", "xiànzài", "xīngqī",
           "xiànzài sān diǎn", "wǒ yǒu liǎng ge xiōngdì", "jīntiān shì xīngqīyī", "wǒmen míngtiān jiàn", "míngtiān shì xīngqī'èr"],
    places: ["chéngshì", "fángzi", "jiēdào", "huǒchēzhàn", "huǒchē", "jiǔdiàn", "zuǒ", "yòu", "zhí zǒu", "yuǎn",
             "huǒchēzhàn zài nǎlǐ", "jiǔdiàn zài zuǒbian", "wǒ zuò huǒchē lǚxíng", "qǐng yìzhí zǒu", "zhège duōshao qián"],
    feelings: ["kāixīn", "nánguò", "lèi", "shēngqì", "shēngbìng", "jǐnzhāng", "jiāo'ào", "gūdān", "jīngyà", "píngjìng",
               "jīntiān wǒ hěn kāixīn", "tā hěn nánguò", "wǒmen hěn jǐnzhāng", "tā shēngbìng le", "wǒ hěn jiāo'ào"]
  }},

  ja: { name: "Japanese", native: "日本語", tts: "ja-JP", nospace: true, noType: true, punct: { ".": "。", "?": "？", "!": "！" }, units: {
    basics: ["こんにちは", "さようなら", "ありがとう", "お願いします", "はい", "いいえ", "おはようございます", "また後で", "すみません", "おやすみなさい",
             "私|の|名前|は|アンナ|です", "お元気|です|か", "元気|です", "私|は|インド|から|来ました", "英語|を|話せ|ます|か"],
    food: ["男の人", "女の人", "子供", "パン", "水", "コーヒー", "りんご", "牛乳", "チーズ", "食べ物",
           "私|は|水|を|飲みます", "女の人|は|りんご|を|食べます", "コーヒー|を|お願いします", "子供|は|牛乳|を|飲みます", "私たち|は|パン|と|チーズ|を|食べます"],
    verbs: ["です", "持つ", "行く", "する", "学ぶ", "住む", "働く", "来る", "話す", "分かる",
            "私|は|疲れました", "あなた|は|本|を|持っています", "私たち|は|家|に|帰ります", "彼|は|今日|働きます", "彼ら|は|英語|を|学びます"],
    time: ["一", "二", "三", "四", "五", "今日", "明日", "昨日", "今", "一週間",
           "三時|です", "私|は|兄弟|が|二人|います", "今日|は|月曜日|です", "私たち|は|明日|会います", "明日|は|火曜日|です"],
    places: ["町", "家", "道", "駅", "電車", "ホテル", "左", "右", "まっすぐ", "遠い",
             "駅|は|どこ|です|か", "ホテル|は|左|です", "私|は|電車|で|旅行|します", "まっすぐ|行って|ください", "これ|は|いくら|です|か"],
    feelings: ["うれしい", "悲しい", "疲れた", "怒っている", "病気", "緊張している", "誇らしい", "一人", "驚いた", "落ち着いている",
               "今日|は|とても|うれしい|です", "彼|は|悲しい|です", "私たち|は|緊張して|います", "彼女|は|病気|です", "私|は|誇らしい|です"]
  }, roman: {
    basics: ["konnichiwa", "sayōnara", "arigatō", "onegai shimasu", "hai", "iie", "ohayō gozaimasu", "mata ato de", "sumimasen", "oyasuminasai",
             "watashi no namae wa Anna desu", "ogenki desu ka", "genki desu", "watashi wa Indo kara kimashita", "eigo o hanasemasu ka"],
    food: ["otoko no hito", "onna no hito", "kodomo", "pan", "mizu", "kōhī", "ringo", "gyūnyū", "chīzu", "tabemono",
           "watashi wa mizu o nomimasu", "onna no hito wa ringo o tabemasu", "kōhī o onegai shimasu", "kodomo wa gyūnyū o nomimasu", "watashitachi wa pan to chīzu o tabemasu"],
    verbs: ["desu", "motsu", "iku", "suru", "manabu", "sumu", "hataraku", "kuru", "hanasu", "wakaru",
            "watashi wa tsukaremashita", "anata wa hon o motte imasu", "watashitachi wa ie ni kaerimasu", "kare wa kyō hatarakimasu", "karera wa eigo o manabimasu"],
    time: ["ichi", "ni", "san", "yon", "go", "kyō", "ashita", "kinō", "ima", "isshūkan",
           "sanji desu", "watashi wa kyōdai ga futari imasu", "kyō wa getsuyōbi desu", "watashitachi wa ashita aimasu", "ashita wa kayōbi desu"],
    places: ["machi", "ie", "michi", "eki", "densha", "hoteru", "hidari", "migi", "massugu", "tōi",
             "eki wa doko desu ka", "hoteru wa hidari desu", "watashi wa densha de ryokō shimasu", "massugu itte kudasai", "kore wa ikura desu ka"],
    feelings: ["ureshii", "kanashii", "tsukareta", "okotte iru", "byōki", "kinchō shite iru", "hokorashii", "hitori", "odoroita", "ochitsuite iru",
               "kyō wa totemo ureshii desu", "kare wa kanashii desu", "watashitachi wa kinchō shite imasu", "kanojo wa byōki desu", "watashi wa hokorashii desu"]
  }},

  th: { name: "Thai", native: "ไทย", tts: "th-TH", nospace: true, noType: true, punct: { ".": "", "?": "", "!": "" }, units: {
    basics: ["สวัสดี", "ลาก่อน", "ขอบคุณ", "กรุณา", "ใช่", "ไม่ใช่", "อรุณสวัสดิ์", "แล้วเจอกัน", "ขอโทษ", "ราตรีสวัสดิ์",
             "ฉัน|ชื่อ|แอนนา", "คุณ|สบายดี|ไหม", "ฉัน|สบายดี", "ฉัน|มา|จาก|อินเดีย", "คุณ|พูด|ภาษาอังกฤษ|ได้|ไหม"],
    food: ["ผู้ชาย", "ผู้หญิง", "เด็ก", "ขนมปัง", "น้ำ", "กาแฟ", "แอปเปิล", "นม", "ชีส", "อาหาร",
           "ฉัน|ดื่ม|น้ำ", "ผู้หญิง|กิน|แอปเปิล", "ฉัน|อยากได้|กาแฟ", "เด็ก|ดื่ม|นม", "เรา|กิน|ขนมปัง|และ|ชีส"],
    verbs: ["เป็น", "มี", "ไป", "ทำ", "เรียน", "อยู่", "ทำงาน", "มา", "พูด", "เข้าใจ",
            "ฉัน|เหนื่อย", "คุณ|มี|หนังสือ|หนึ่ง|เล่ม", "เรา|กำลัง|กลับ|บ้าน", "เขา|ทำงาน|วันนี้", "พวกเขา|เรียน|ภาษาอังกฤษ"],
    time: ["หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "วันนี้", "พรุ่งนี้", "เมื่อวาน", "ตอนนี้", "สัปดาห์",
           "ตอนนี้|บ่าย|สาม|โมง", "ฉัน|มี|พี่ชาย|สอง|คน", "วันนี้|เป็น|วันจันทร์", "เรา|เจอกัน|พรุ่งนี้", "พรุ่งนี้|เป็น|วันอังคาร"],
    places: ["เมือง", "บ้าน", "ถนน", "สถานีรถไฟ", "รถไฟ", "โรงแรม", "ซ้าย", "ขวา", "ตรงไป", "ไกล",
             "สถานีรถไฟ|อยู่|ที่|ไหน", "โรงแรม|อยู่|ทางซ้าย", "ฉัน|เดินทาง|ด้วย|รถไฟ", "เดิน|ตรง|ไป", "อัน|นี้|ราคา|เท่าไร"],
    feelings: ["มีความสุข", "เศร้า", "เหนื่อย", "โกรธ", "ป่วย", "ประหม่า", "ภูมิใจ", "โดดเดี่ยว", "ประหลาดใจ", "สงบ",
               "วันนี้|ฉัน|มีความสุข|มาก", "เขา|เศร้า", "เรา|ประหม่า", "เธอ|ป่วย", "ฉัน|ภูมิใจ"]
  }, roman: {
    basics: ["sawatdi", "lakon", "khop khun", "karuna", "chai", "mai chai", "arun sawat", "laeo choe kan", "khotho", "ratri sawat",
             "chan chue Aennaa", "khun sabai di mai", "chan sabai di", "chan ma chak India", "khun phut phasa Angkrit dai mai"],
    food: ["phu chai", "phu ying", "dek", "khanom pang", "nam", "kafae", "aeppoen", "nom", "chit", "ahan",
           "chan duem nam", "phu ying kin aeppoen", "chan yak dai kafae", "dek duem nom", "rao kin khanom pang lae chit"],
    verbs: ["pen", "mi", "pai", "tham", "rian", "yu", "tham ngan", "ma", "phut", "khao chai",
            "chan nueai", "khun mi nangsue nueng lem", "rao kamlang klap ban", "khao tham ngan wan ni", "phuak khao rian phasa Angkrit"],
    time: ["nueng", "song", "sam", "si", "ha", "wan ni", "phrung ni", "muea wan", "tonni", "sapda",
           "tonni bai sam mong", "chan mi phi chai song khon", "wan ni pen wan chan", "rao choe kan phrung ni", "phrung ni pen wan angkhan"],
    places: ["mueang", "ban", "thanon", "sathani rotfai", "rotfai", "rongraem", "sai", "khwa", "trong pai", "klai",
             "sathani rotfai yu thi nai", "rongraem yu thang sai", "chan doenthang duai rotfai", "doen trong pai", "an ni rakha thaorai"],
    feelings: ["mi khwam suk", "sao", "nueai", "krot", "puai", "pramam", "phumjai", "dotdiao", "pralat chai", "sa-ngop",
               "wan ni chan mi khwam suk mak", "khao sao", "rao pramam", "thoe puai", "chan phumjai"]
  }},

  vi: { name: "Vietnamese", native: "Tiếng Việt", tts: "vi-VN", units: {
    basics: ["Xin chào", "Tạm biệt", "Cảm ơn", "Làm ơn", "Vâng", "Không", "Chào buổi sáng", "Hẹn gặp lại", "Xin lỗi", "Chúc ngủ ngon",
             "Tôi tên là Anna", "Bạn có khỏe không", "Tôi khỏe", "Tôi đến từ Ấn Độ", "Bạn có nói tiếng Anh không"],
    food: ["người đàn ông", "người phụ nữ", "đứa trẻ", "bánh mì", "nước", "cà phê", "quả táo", "sữa", "phô mai", "đồ ăn",
           "Tôi uống nước", "Người phụ nữ ăn một quả táo", "Tôi muốn một ly cà phê", "Đứa trẻ uống sữa", "Chúng tôi ăn bánh mì và phô mai"],
    verbs: ["là", "có", "đi", "làm", "học", "sống", "làm việc", "đến", "nói", "hiểu",
            "Tôi mệt", "Bạn có một quyển sách", "Chúng tôi đang về nhà", "Anh ấy làm việc hôm nay", "Họ học tiếng Anh"],
    time: ["một", "hai", "ba", "bốn", "năm", "hôm nay", "ngày mai", "hôm qua", "bây giờ", "tuần",
           "Bây giờ là ba giờ", "Tôi có hai anh trai", "Hôm nay là thứ Hai", "Chúng ta gặp nhau ngày mai", "Ngày mai là thứ Ba"],
    places: ["thành phố", "ngôi nhà", "đường phố", "ga tàu", "tàu hỏa", "khách sạn", "bên trái", "bên phải", "đi thẳng", "xa",
             "Ga tàu ở đâu", "Khách sạn ở bên trái", "Tôi đi du lịch bằng tàu hỏa", "Hãy đi thẳng", "Cái này giá bao nhiêu"],
    feelings: ["vui", "buồn", "mệt", "tức giận", "ốm", "lo lắng", "tự hào", "cô đơn", "ngạc nhiên", "bình tĩnh",
               "Hôm nay tôi rất vui", "Anh ấy buồn", "Chúng tôi lo lắng", "Cô ấy bị ốm", "Tôi tự hào"]
  }},

  hi: { name: "Hindi", native: "हिन्दी", tts: "hi-IN", noType: true, punct: { ".": "।" }, units: {
    basics: ["नमस्ते", "अलविदा", "धन्यवाद", "कृपया", "हाँ", "नहीं", "सुप्रभात", "फिर मिलेंगे", "माफ़ कीजिए", "शुभ रात्रि",
             "मेरा नाम अन्ना है", "आप कैसे हैं", "मैं ठीक हूँ", "मैं भारत से आता हूँ", "क्या आप अंग्रेज़ी बोलते हैं"],
    food: ["आदमी", "औरत", "बच्चा", "रोटी", "पानी", "कॉफ़ी", "सेब", "दूध", "पनीर", "खाना",
           "मैं पानी पीता हूँ", "औरत एक सेब खाती है", "मुझे एक कॉफ़ी चाहिए", "बच्चा दूध पीता है", "हम रोटी और पनीर खाते हैं"],
    verbs: ["होना", "के पास होना", "जाना", "करना", "सीखना", "रहना", "काम करना", "आना", "बोलना", "समझना",
            "मैं थका हुआ हूँ", "तुम्हारे पास एक किताब है", "हम घर जा रहे हैं", "वह आज काम करता है", "वे अंग्रेज़ी सीखते हैं"],
    time: ["एक", "दो", "तीन", "चार", "पाँच", "आज", "आने वाला कल", "बीता हुआ कल", "अभी", "हफ़्ता",
           "तीन बजे हैं", "मेरे दो भाई हैं", "आज सोमवार है", "हम कल मिलेंगे", "कल मंगलवार है"],
    places: ["शहर", "घर", "सड़क", "रेलवे स्टेशन", "ट्रेन", "होटल", "बाएँ", "दाएँ", "सीधे", "दूर",
             "रेलवे स्टेशन कहाँ है", "होटल बाईं ओर है", "मैं ट्रेन से यात्रा करता हूँ", "सीधे जाइए", "यह कितने का है"],
    feelings: ["खुश", "उदास", "थका हुआ", "गुस्से में", "बीमार", "घबराया हुआ", "गर्वित", "अकेला", "हैरान", "शांत",
               "आज मैं बहुत खुश हूँ", "वह उदास है", "हम घबराए हुए हैं", "वह बीमार है", "मुझे गर्व है"]
  }, roman: {
    basics: ["namaste", "alvida", "dhanyavaad", "kripya", "haan", "nahin", "suprabhaat", "phir milenge", "maaf kijiye", "shubh raatri",
             "mera naam Anna hai", "aap kaise hain", "main theek hoon", "main Bharat se aata hoon", "kya aap angrezi bolte hain"],
    food: ["aadmi", "aurat", "bachcha", "roti", "paani", "coffee", "seb", "doodh", "paneer", "khaana",
           "main paani peeta hoon", "aurat ek seb khaati hai", "mujhe ek coffee chahiye", "bachcha doodh peeta hai", "ham roti aur paneer khaate hain"],
    verbs: ["honaa", "ke paas honaa", "jaana", "karna", "seekhna", "rehna", "kaam karna", "aana", "bolna", "samajhna",
            "main thaka hua hoon", "tumhaare paas ek kitaab hai", "ham ghar ja rahe hain", "vah aaj kaam karta hai", "ve angrezi seekhte hain"],
    time: ["ek", "do", "teen", "chaar", "paanch", "aaj", "aane vaala kal", "beeta hua kal", "abhi", "hafta",
           "teen baje hain", "mere do bhai hain", "aaj somvaar hai", "ham kal milenge", "kal mangalvaar hai"],
    places: ["shehar", "ghar", "sadak", "railway station", "train", "hotel", "baaen", "daaen", "seedhe", "door",
             "railway station kahaan hai", "hotel baaeen or hai", "main train se yaatra karta hoon", "seedhe jaaiye", "yah kitne ka hai"],
    feelings: ["khush", "udaas", "thaka hua", "gusse mein", "beemaar", "ghabraaya hua", "garvit", "akela", "hairaan", "shaant",
               "aaj main bahut khush hoon", "vah udaas hai", "ham ghabraaye hue hain", "vah beemaar hai", "mujhe garv hai"]
  }},

  tr: { name: "Turkish", native: "Türkçe", tts: "tr-TR", units: {
    basics: ["Merhaba", "Hoşça kal", "Teşekkürler", "Lütfen", "Evet", "Hayır", "Günaydın", "Sonra görüşürüz", "Affedersiniz", "İyi geceler",
             "Benim adım Anna", "Nasılsın", "İyiyim", "Ben Hindistan'danım", "İngilizce konuşuyor musun"],
    food: ["adam", "kadın", "çocuk", "ekmek", "su", "kahve", "elma", "süt", "peynir", "yemek",
           "Su içiyorum", "Kadın bir elma yiyor", "Bir kahve istiyorum", "Çocuk süt içiyor", "Ekmek ve peynir yiyoruz"],
    verbs: ["olmak", "sahip olmak", "gitmek", "yapmak", "öğrenmek", "yaşamak", "çalışmak", "gelmek", "konuşmak", "anlamak",
            "Yorgunum", "Senin bir kitabın var", "Eve gidiyoruz", "O bugün çalışıyor", "Onlar İngilizce öğreniyor"],
    time: ["bir", "iki", "üç", "dört", "beş", "bugün", "yarın", "dün", "şimdi", "hafta",
           "Saat üç", "İki erkek kardeşim var", "Bugün pazartesi", "Yarın görüşürüz", "Yarın salı"],
    places: ["şehir", "ev", "sokak", "tren istasyonu", "tren", "otel", "sol", "sağ", "düz", "uzak",
             "Tren istasyonu nerede", "Otel solda", "Trenle seyahat ediyorum", "Düz gidin", "Bu ne kadar"],
    feelings: ["mutlu", "üzgün", "yorgun", "kızgın", "hasta", "gergin", "gururlu", "yalnız", "şaşkın", "sakin",
               "Bugün çok mutluyum", "O üzgün", "Gerginiz", "O hasta", "Gururluyum"]
  }},

  nl: { name: "Dutch", native: "Nederlands", tts: "nl-NL", units: {
    basics: ["Hallo", "Doei", "Dank je", "Alsjeblieft", "Ja", "Nee", "Goedemorgen", "Tot straks", "Pardon", "Welterusten",
             "Ik heet Anna", "Hoe gaat het met je", "Het gaat goed met mij", "Ik kom uit India", "Spreek je Engels"],
    food: ["de man", "de vrouw", "het kind", "het brood", "het water", "de koffie", "de appel", "de melk", "de kaas", "het eten",
           "Ik drink water", "De vrouw eet een appel", "Ik wil graag een koffie", "Het kind drinkt melk", "Wij eten brood en kaas"],
    verbs: ["zijn", "hebben", "gaan", "doen", "leren", "wonen", "werken", "komen", "spreken", "begrijpen",
            "Ik ben moe", "Jij hebt een boek", "Wij gaan naar huis", "Hij werkt vandaag", "Zij leren Engels"],
    time: ["een", "twee", "drie", "vier", "vijf", "vandaag", "morgen", "gisteren", "nu", "de week",
           "Het is drie uur", "Ik heb twee broers", "Vandaag is het maandag", "Wij zien elkaar morgen", "Morgen is het dinsdag"],
    places: ["de stad", "het huis", "de straat", "het treinstation", "de trein", "het hotel", "links", "rechts", "rechtdoor", "ver",
             "Waar is het treinstation", "Het hotel is links", "Ik reis met de trein", "Ga rechtdoor", "Hoeveel kost dit"],
    feelings: ["blij", "verdrietig", "moe", "boos", "ziek", "nerveus", "trots", "alleen", "verrast", "kalm",
               "Vandaag ben ik heel blij", "Hij is verdrietig", "Wij zijn nerveus", "Zij is ziek", "Ik ben trots"]
  }},

  sv: { name: "Swedish", native: "Svenska", tts: "sv-SE", units: {
    basics: ["Hej", "Hejdå", "Tack", "Snälla", "Ja", "Nej", "God morgon", "Vi ses senare", "Ursäkta", "God natt",
             "Jag heter Anna", "Hur mår du", "Jag mår bra", "Jag kommer från Indien", "Pratar du engelska"],
    food: ["mannen", "kvinnan", "barnet", "brödet", "vattnet", "kaffet", "äpplet", "mjölken", "osten", "maten",
           "Jag dricker vatten", "Kvinnan äter ett äpple", "Jag skulle vilja ha ett kaffe", "Barnet dricker mjölk", "Vi äter bröd och ost"],
    verbs: ["vara", "ha", "gå", "göra", "lära sig", "bo", "arbeta", "komma", "tala", "förstå",
            "Jag är trött", "Du har en bok", "Vi går hem", "Han arbetar i dag", "De lär sig engelska"],
    time: ["ett", "två", "tre", "fyra", "fem", "i dag", "i morgon", "i går", "nu", "veckan",
           "Klockan är tre", "Jag har två bröder", "I dag är det måndag", "Vi ses i morgon", "I morgon är det tisdag"],
    places: ["staden", "huset", "gatan", "tågstationen", "tåget", "hotellet", "vänster", "höger", "rakt fram", "långt",
             "Var ligger tågstationen", "Hotellet ligger till vänster", "Jag reser med tåg", "Gå rakt fram", "Hur mycket kostar det här"],
    feelings: ["glad", "ledsen", "trött", "arg", "sjuk", "nervös", "stolt", "ensam", "förvånad", "lugn",
               "I dag är jag mycket glad", "Han är ledsen", "Vi är nervösa", "Hon är sjuk", "Jag är stolt"]
  }},

  ko: { name: "Korean", native: "한국어", tts: "ko-KR", units: {
    basics: ["안녕하세요", "안녕히 가세요", "감사합니다", "부탁합니다", "네", "아니요", "좋은 아침", "나중에 봬요", "실례합니다", "안녕히 주무세요",
             "제 이름은 안나입니다", "어떻게 지내세요", "잘 지내요", "저는 인도에서 왔어요", "영어 하세요"],
    food: ["남자", "여자", "아이", "빵", "물", "커피", "사과", "우유", "치즈", "음식",
           "저는 물을 마셔요", "여자가 사과를 먹어요", "커피 한 잔 주세요", "아이가 우유를 마셔요", "우리는 빵과 치즈를 먹어요"],
    verbs: ["이다", "있다", "가다", "하다", "배우다", "살다", "일하다", "오다", "말하다", "이해하다",
            "저는 피곤해요", "당신은 책이 있어요", "우리는 집에 가요", "그는 오늘 일해요", "그들은 영어를 배워요"],
    time: ["하나", "둘", "셋", "넷", "다섯", "오늘", "내일", "어제", "지금", "일주일",
           "세 시예요", "저는 형제가 둘 있어요", "오늘은 월요일이에요", "우리는 내일 만나요", "내일은 화요일이에요"],
    places: ["도시", "집", "길", "기차역", "기차", "호텔", "왼쪽", "오른쪽", "직진", "멀리",
             "기차역이 어디예요", "호텔은 왼쪽에 있어요", "저는 기차로 여행해요", "직진하세요", "이거 얼마예요"],
    feelings: ["행복한", "슬픈", "피곤한", "화난", "아픈", "긴장한", "자랑스러운", "외로운", "놀란", "차분한",
               "오늘 저는 아주 행복해요", "그는 슬퍼요", "우리는 긴장돼요", "그녀는 아파요", "저는 자랑스러워요"]
  }, roman: {
    basics: ["annyeonghaseyo", "annyeonghi gaseyo", "gamsahamnida", "butakamnida", "ne", "aniyo", "joeun achim", "najunge bwaeyo", "sillyehamnida", "annyeonghi jumuseyo",
             "je ireumeun Annaimnida", "eotteoke jinaeseyo", "jal jinaeyo", "jeoneun Indoeseo wasseoyo", "yeongeo haseyo"],
    food: ["namja", "yeoja", "ai", "ppang", "mul", "keopi", "sagwa", "uyu", "chijeu", "eumsik",
           "jeoneun mureul masyeoyo", "yeojaga sagwareul meogeoyo", "keopi han jan juseyo", "aiga uyureul masyeoyo", "urineun ppanggwa chijeureul meogeoyo"],
    verbs: ["ida", "itda", "gada", "hada", "baeuda", "salda", "ilhada", "oda", "malhada", "ihaehada",
            "jeoneun pigonhaeyo", "dangsineun chaegi isseoyo", "urineun jibe gayo", "geuneun oneul ilhaeyo", "geudeureun yeongeoreul baewoyo"],
    time: ["hana", "dul", "set", "net", "daseot", "oneul", "naeil", "eoje", "jigeum", "iljuil",
           "se siyeyo", "jeoneun hyeongjega dul isseoyo", "oneureun woryoirieyo", "urineun naeil mannayo", "naeireun hwayoirieyo"],
    places: ["dosi", "jip", "gil", "gichayeok", "gicha", "hotel", "oenjjok", "oreunjjok", "jikjin", "meolli",
             "gichayeogi eodiyeyo", "hoteureun oenjjoge isseoyo", "jeoneun gicharo yeohaenghaeyo", "jikjinhaseyo", "igeo eolmayeyo"],
    feelings: ["haengbokan", "seulpeun", "pigonhan", "hwanan", "apeun", "ginjanghan", "jarangseureoun", "oeroun", "nollan", "chabunhan",
               "oneul jeoneun aju haengbokhaeyo", "geuneun seulpeoyo", "urineun ginjangdwaeyo", "geunyeoneun apayo", "jeoneun jarangseureowoyo"]
  }},

  ur: { name: "Urdu", native: "اردو", tts: "ur-PK", noType: true, punct: { ".": "۔", "?": "؟" }, units: {
    basics: ["السلام علیکم", "خدا حافظ", "شکریہ", "مہربانی کر کے", "جی ہاں", "نہیں", "صبح بخیر", "پھر ملیں گے", "معاف کیجیے", "شب بخیر",
             "میرا نام انا ہے", "آپ کیسے ہیں", "میں ٹھیک ہوں", "میں انڈیا سے آیا ہوں", "کیا آپ انگریزی بولتے ہیں"],
    food: ["آدمی", "عورت", "بچہ", "روٹی", "پانی", "کافی", "سیب", "دودھ", "پنیر", "کھانا",
           "میں پانی پیتا ہوں", "عورت ایک سیب کھاتی ہے", "مجھے ایک کافی چاہیے", "بچہ دودھ پیتا ہے", "ہم روٹی اور پنیر کھاتے ہیں"],
    verbs: ["ہونا", "کے پاس ہونا", "جانا", "کرنا", "سیکھنا", "رہنا", "کام کرنا", "آنا", "بولنا", "سمجھنا",
            "میں تھکا ہوا ہوں", "آپ کے پاس ایک کتاب ہے", "ہم گھر جا رہے ہیں", "وہ آج کام کرتا ہے", "وہ انگریزی سیکھتے ہیں"],
    time: ["ایک", "دو", "تین", "چار", "پانچ", "آج", "آنے والا کل", "گزرا ہوا کل", "ابھی", "ہفتہ",
           "تین بجے ہیں", "میرے دو بھائی ہیں", "آج پیر ہے", "ہم کل ملیں گے", "کل منگل ہے"],
    places: ["شہر", "گھر", "سڑک", "ریلوے اسٹیشن", "ٹرین", "ہوٹل", "بائیں", "دائیں", "سیدھا", "دور",
             "ریلوے اسٹیشن کہاں ہے", "ہوٹل بائیں طرف ہے", "میں ٹرین سے سفر کرتا ہوں", "سیدھے جائیے", "یہ کتنے کا ہے"],
    feelings: ["خوش", "اداس", "تھکا ہوا", "غصے میں", "بیمار", "گھبرایا ہوا", "پرفخر", "اکیلا", "حیران", "پرسکون",
               "آج میں بہت خوش ہوں", "وہ اداس ہے", "ہم گھبرائے ہوئے ہیں", "وہ بیمار ہے", "مجھے فخر ہے"]
  }, roman: {
    basics: ["assalam alaikum", "khuda hafiz", "shukriya", "meherbani karke", "ji haan", "nahin", "subah bakhair", "phir milenge", "maaf kijiye", "shab bakhair",
             "mera naam Anna hai", "aap kaise hain", "main theek hoon", "main India se aaya hoon", "kya aap angrezi bolte hain"],
    food: ["aadmi", "aurat", "bachcha", "roti", "paani", "coffee", "seb", "doodh", "paneer", "khaana",
           "main paani peeta hoon", "aurat ek seb khaati hai", "mujhe ek coffee chahiye", "bachcha doodh peeta hai", "ham roti aur paneer khaate hain"],
    verbs: ["honaa", "ke paas honaa", "jaana", "karna", "seekhna", "rehna", "kaam karna", "aana", "bolna", "samajhna",
            "main thaka hua hoon", "aap ke paas ek kitaab hai", "ham ghar ja rahe hain", "vo aaj kaam karta hai", "vo angrezi seekhte hain"],
    time: ["ek", "do", "teen", "chaar", "paanch", "aaj", "aane waala kal", "guzra hua kal", "abhi", "hafta",
           "teen baje hain", "mere do bhai hain", "aaj peer hai", "ham kal milenge", "kal mangal hai"],
    places: ["shehar", "ghar", "sadak", "railway station", "train", "hotel", "baayen", "daayen", "seedha", "door",
             "railway station kahan hai", "hotel baayen taraf hai", "main train se safar karta hoon", "seedhe jaiye", "yeh kitne ka hai"],
    feelings: ["khush", "udaas", "thaka hua", "ghusse mein", "beemaar", "ghabraya hua", "purfakhr", "akela", "hairaan", "pursukoon",
               "aaj main bahut khush hoon", "vo udaas hai", "ham ghabraaye hue hain", "vo beemaar hai", "mujhe fakhr hai"]
  }},

  ar: { name: "Arabic", native: "العربية", tts: "ar-SA", noType: true, punct: { "?": "؟" }, units: {
    basics: ["مرحبا", "مع السلامة", "شكرا", "من فضلك", "نعم", "لا", "صباح الخير", "أراك لاحقا", "عذرا", "تصبح على خير",
             "اسمي آنا", "كيف حالك", "أنا بخير", "أنا من الهند", "هل تتكلم الإنجليزية"],
    food: ["الرجل", "المرأة", "الطفل", "الخبز", "الماء", "القهوة", "التفاحة", "الحليب", "الجبن", "الطعام",
           "أنا أشرب الماء", "المرأة تأكل تفاحة", "أريد قهوة", "الطفل يشرب الحليب", "نحن نأكل الخبز والجبن"],
    verbs: ["يكون", "يملك", "يذهب", "يفعل", "يتعلم", "يسكن", "يعمل", "يأتي", "يتكلم", "يفهم",
            "أنا متعب", "عندك كتاب", "نحن ذاهبون إلى البيت", "هو يعمل اليوم", "هم يتعلمون الإنجليزية"],
    time: ["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "اليوم", "غدا", "أمس", "الآن", "الأسبوع",
           "الساعة الثالثة", "عندي أخوان", "اليوم هو الاثنين", "نراك غدا", "غدا هو الثلاثاء"],
    places: ["المدينة", "البيت", "الشارع", "محطة القطار", "القطار", "الفندق", "يسار", "يمين", "مباشرة", "بعيد",
             "أين محطة القطار", "الفندق على اليسار", "أسافر بالقطار", "اذهب مباشرة", "بكم هذا"],
    feelings: ["سعيد", "حزين", "متعب", "غاضب", "مريض", "متوتر", "فخور", "وحيد", "مندهش", "هادئ",
               "اليوم أنا سعيد جدا", "هو حزين", "نحن متوترون", "هي مريضة", "أنا فخور"]
  }, roman: {
    basics: ["marhaban", "ma'a as-salama", "shukran", "min fadlak", "na'am", "la", "sabah al-khayr", "araka lahiqan", "'udhran", "tusbih 'ala khayr",
             "ismi Anna", "kayfa haluk", "ana bikhayr", "ana min al-hind", "hal tatakallam al-inkliziyya"],
    food: ["ar-rajul", "al-mar'a", "at-tifl", "al-khubz", "al-ma'", "al-qahwa", "at-tuffaha", "al-halib", "al-jubn", "at-ta'am",
           "ana ashrab al-ma'", "al-mar'a ta'kul tuffaha", "urid qahwa", "at-tifl yashrab al-halib", "nahnu na'kul al-khubz wa-l-jubn"],
    verbs: ["yakun", "yamlik", "yadhhab", "yaf'al", "yata'allam", "yaskun", "ya'mal", "ya'ti", "yatakallam", "yafham",
            "ana mut'ab", "'indak kitab", "nahnu dhahibun ila al-bayt", "huwa ya'mal al-yawm", "hum yata'allamun al-inkliziyya"],
    time: ["wahid", "ithnan", "thalatha", "arba'a", "khamsa", "al-yawm", "ghadan", "ams", "al-an", "al-usbu'",
           "as-sa'a ath-thalitha", "'indi akhawan", "al-yawm huwa al-ithnayn", "nara-ka ghadan", "ghadan huwa ath-thulatha'"],
    places: ["al-madina", "al-bayt", "ash-shari'", "mahattat al-qitar", "al-qitar", "al-funduq", "yasar", "yamin", "mubasharatan", "ba'id",
             "ayna mahattat al-qitar", "al-funduq 'ala al-yasar", "usafir bil-qitar", "idhhab mubasharatan", "bikam hadha"],
    feelings: ["sa'id", "hazin", "mut'ab", "ghadib", "marid", "mutawattir", "fakhur", "wahid", "mundahish", "hadi'",
               "al-yawm ana sa'id jiddan", "huwa hazin", "nahnu mutawattirun", "hiya marida", "ana fakhur"]
  }}
});
