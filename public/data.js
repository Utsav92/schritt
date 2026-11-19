/* Course content for Schritt (original A1 material, learners speak English).
   UNITS: shared English skeleton. Each unit has 15 items: indexes 0-9 are words/phrases,
   10-14 are sentences. `p` is the closing punctuation for the 5 sentences.
   PACKS: one entry per target language. `units[id]` is an array of 15 strings aligned to UNITS[id].en.
   Sentences are written without closing punctuation. Languages that write with spaces between words
   work as-is; add more through Profile > Import language pack (same JSON shape as one PACKS entry). */
window.UNITS = [
  { id: "basics", title: "Greetings and basics", blurb: "Say hello, thank people, introduce yourself", color: "#0b6e8a",
    en: ["Hello", "Bye", "Thank you", "Please", "Yes", "No", "Good morning", "See you later", "Excuse me", "Good night",
         "My name is Anna", "How are you", "I am doing well", "I come from India", "Do you speak English"],
    p: [".", "?", ".", ".", "?"] },
  { id: "food", title: "People and food", blurb: "Order a coffee, talk about who is eating what", color: "#b4541a",
    en: ["the man", "the woman", "the child", "the bread", "the water", "the coffee", "the apple", "the milk", "the cheese", "the food",
         "I drink water", "The woman eats an apple", "I would like a coffee", "The child drinks milk", "We eat bread and cheese"],
    p: [".", ".", ".", ".", "."] },
  { id: "verbs", title: "Everyday verbs", blurb: "Be, have, go, work, learn", color: "#5b4bb0",
    en: ["to be", "to have", "to go", "to do", "to learn", "to live", "to work", "to come", "to speak", "to understand",
         "I am tired", "You have a book", "We are going home", "He works today", "They learn English"],
    p: [".", ".", ".", ".", "."] },
  { id: "time", title: "Numbers and time", blurb: "Count, talk about days and the week", color: "#1f7a3d",
    en: ["one", "two", "three", "four", "five", "today", "tomorrow", "yesterday", "now", "the week",
         "It is three o'clock", "I have two brothers", "Today is Monday", "We will see each other tomorrow", "Tomorrow is Tuesday"],
    p: [".", ".", ".", ".", "."] },
  { id: "places", title: "Places and travel", blurb: "Find the station, ask for directions", color: "#a02c3a",
    en: ["the city", "the house", "the street", "the train station", "the train", "the hotel", "left", "right", "straight ahead", "far",
         "Where is the train station", "The hotel is on the left", "I travel by train", "Go straight ahead", "How much does this cost"],
    p: ["?", ".", ".", ".", "?"] },
  { id: "feelings", title: "Feelings", blurb: "Say how you feel", color: "#8a5a00",
    en: ["happy", "sad", "tired", "angry", "sick", "nervous", "proud", "alone", "surprised", "calm",
         "Today I am very happy", "He is sad", "We are nervous", "She is sick", "I am proud"],
    p: [".", ".", ".", ".", "."] }
];

window.PACKS = {
  de: { name: "German", native: "Deutsch", tts: "de-DE", units: {
    basics: ["Hallo", "Tschüss", "Danke", "Bitte", "Ja", "Nein", "Guten Morgen", "Bis später", "Entschuldigung", "Gute Nacht",
             "Ich heiße Anna", "Wie geht es dir", "Mir geht es gut", "Ich komme aus Indien", "Sprichst du Englisch"],
    food: ["der Mann", "die Frau", "das Kind", "das Brot", "das Wasser", "der Kaffee", "der Apfel", "die Milch", "der Käse", "das Essen",
           "Ich trinke Wasser", "Die Frau isst einen Apfel", "Ich möchte einen Kaffee", "Das Kind trinkt Milch", "Wir essen Brot und Käse"],
    verbs: ["sein", "haben", "gehen", "machen", "lernen", "wohnen", "arbeiten", "kommen", "sprechen", "verstehen",
            "Ich bin müde", "Du hast ein Buch", "Wir gehen nach Hause", "Er arbeitet heute", "Sie lernen Englisch"],
    time: ["eins", "zwei", "drei", "vier", "fünf", "heute", "morgen", "gestern", "jetzt", "die Woche",
           "Es ist drei Uhr", "Ich habe zwei Brüder", "Heute ist Montag", "Wir sehen uns morgen", "Morgen ist Dienstag"],
    places: ["die Stadt", "das Haus", "die Straße", "der Bahnhof", "der Zug", "das Hotel", "links", "rechts", "geradeaus", "weit",
             "Wo ist der Bahnhof", "Das Hotel ist links", "Ich fahre mit dem Zug", "Gehen Sie geradeaus", "Wie viel kostet das"],
    feelings: ["glücklich", "traurig", "müde", "wütend", "krank", "nervös", "stolz", "allein", "überrascht", "ruhig",
               "Heute bin ich sehr glücklich", "Er ist traurig", "Wir sind nervös", "Sie ist krank", "Ich bin stolz"]
  }},
  es: { name: "Spanish", native: "Español", tts: "es-ES", units: {
    basics: ["Hola", "Adiós", "Gracias", "Por favor", "Sí", "No", "Buenos días", "Hasta luego", "Perdón", "Buenas noches",
             "Me llamo Anna", "Cómo estás", "Estoy bien", "Vengo de India", "Hablas inglés"],
    food: ["el hombre", "la mujer", "el niño", "el pan", "el agua", "el café", "la manzana", "la leche", "el queso", "la comida",
           "Bebo agua", "La mujer come una manzana", "Quisiera un café", "El niño bebe leche", "Comemos pan y queso"],
    verbs: ["ser", "tener", "ir", "hacer", "aprender", "vivir", "trabajar", "venir", "hablar", "entender",
            "Estoy cansado", "Tienes un libro", "Vamos a casa", "Él trabaja hoy", "Ellos aprenden inglés"],
    time: ["uno", "dos", "tres", "cuatro", "cinco", "hoy", "mañana", "ayer", "ahora", "la semana",
           "Son las tres", "Tengo dos hermanos", "Hoy es lunes", "Nos vemos mañana", "Mañana es martes"],
    places: ["la ciudad", "la casa", "la calle", "la estación", "el tren", "el hotel", "izquierda", "derecha", "todo recto", "lejos",
             "Dónde está la estación", "El hotel está a la izquierda", "Viajo en tren", "Siga todo recto", "Cuánto cuesta esto"],
    feelings: ["feliz", "triste", "cansado", "enfadado", "enfermo", "nervioso", "orgulloso", "solo", "sorprendido", "tranquilo",
               "Hoy estoy muy feliz", "Él está triste", "Estamos nerviosos", "Ella está enferma", "Estoy orgulloso"]
  }},
  fr: { name: "French", native: "Français", tts: "fr-FR", units: {
    basics: ["Salut", "Au revoir", "Merci", "S'il vous plaît", "Oui", "Non", "Bonjour", "À tout à l'heure", "Excusez-moi", "Bonne nuit",
             "Je m'appelle Anna", "Comment ça va", "Je vais bien", "Je viens d'Inde", "Tu parles anglais"],
    food: ["l'homme", "la femme", "l'enfant", "le pain", "l'eau", "le café", "la pomme", "le lait", "le fromage", "la nourriture",
           "Je bois de l'eau", "La femme mange une pomme", "Je voudrais un café", "L'enfant boit du lait", "Nous mangeons du pain et du fromage"],
    verbs: ["être", "avoir", "aller", "faire", "apprendre", "habiter", "travailler", "venir", "parler", "comprendre",
            "Je suis fatigué", "Tu as un livre", "Nous rentrons à la maison", "Il travaille aujourd'hui", "Ils apprennent l'anglais"],
    time: ["un", "deux", "trois", "quatre", "cinq", "aujourd'hui", "demain", "hier", "maintenant", "la semaine",
           "Il est trois heures", "J'ai deux frères", "Aujourd'hui c'est lundi", "On se voit demain", "Demain c'est mardi"],
    places: ["la ville", "la maison", "la rue", "la gare", "le train", "l'hôtel", "à gauche", "à droite", "tout droit", "loin",
             "Où est la gare", "L'hôtel est à gauche", "Je voyage en train", "Allez tout droit", "Combien ça coûte"],
    feelings: ["heureux", "triste", "fatigué", "en colère", "malade", "nerveux", "fier", "seul", "surpris", "calme",
               "Aujourd'hui je suis très heureux", "Il est triste", "Nous sommes nerveux", "Elle est malade", "Je suis fier"]
  }},
  it: { name: "Italian", native: "Italiano", tts: "it-IT", units: {
    basics: ["Ciao", "Arrivederci", "Grazie", "Per favore", "Sì", "No", "Buongiorno", "A dopo", "Scusi", "Buonanotte",
             "Mi chiamo Anna", "Come stai", "Sto bene", "Vengo dall'India", "Parli inglese"],
    food: ["l'uomo", "la donna", "il bambino", "il pane", "l'acqua", "il caffè", "la mela", "il latte", "il formaggio", "il cibo",
           "Bevo acqua", "La donna mangia una mela", "Vorrei un caffè", "Il bambino beve latte", "Mangiamo pane e formaggio"],
    verbs: ["essere", "avere", "andare", "fare", "imparare", "vivere", "lavorare", "venire", "parlare", "capire",
            "Sono stanco", "Hai un libro", "Andiamo a casa", "Lui lavora oggi", "Loro imparano l'inglese"],
    time: ["uno", "due", "tre", "quattro", "cinque", "oggi", "domani", "ieri", "adesso", "la settimana",
           "Sono le tre", "Ho due fratelli", "Oggi è lunedì", "Ci vediamo domani", "Domani è martedì"],
    places: ["la città", "la casa", "la strada", "la stazione", "il treno", "l'hotel", "sinistra", "destra", "dritto", "lontano",
             "Dov'è la stazione", "L'hotel è a sinistra", "Viaggio in treno", "Vada dritto", "Quanto costa questo"],
    feelings: ["felice", "triste", "stanco", "arrabbiato", "malato", "nervoso", "orgoglioso", "solo", "sorpreso", "calmo",
               "Oggi sono molto felice", "Lui è triste", "Siamo nervosi", "Lei è malata", "Sono orgoglioso"]
  }},
  pt: { name: "Portuguese", native: "Português", tts: "pt-BR", units: {
    basics: ["Olá", "Tchau", "Obrigado", "Por favor", "Sim", "Não", "Bom dia", "Até logo", "Com licença", "Boa noite",
             "Meu nome é Anna", "Como você está", "Estou bem", "Eu venho da Índia", "Você fala inglês"],
    food: ["o homem", "a mulher", "a criança", "o pão", "a água", "o café", "a maçã", "o leite", "o queijo", "a comida",
           "Eu bebo água", "A mulher come uma maçã", "Eu queria um café", "A criança bebe leite", "Nós comemos pão e queijo"],
    verbs: ["ser", "ter", "ir", "fazer", "aprender", "morar", "trabalhar", "vir", "falar", "entender",
            "Estou cansado", "Você tem um livro", "Nós vamos para casa", "Ele trabalha hoje", "Eles aprendem inglês"],
    time: ["um", "dois", "três", "quatro", "cinco", "hoje", "amanhã", "ontem", "agora", "a semana",
           "São três horas", "Eu tenho dois irmãos", "Hoje é segunda-feira", "Nos vemos amanhã", "Amanhã é terça-feira"],
    places: ["a cidade", "a casa", "a rua", "a estação", "o trem", "o hotel", "esquerda", "direita", "em frente", "longe",
             "Onde fica a estação", "O hotel fica à esquerda", "Eu viajo de trem", "Siga em frente", "Quanto custa isto"],
    feelings: ["feliz", "triste", "cansado", "zangado", "doente", "nervoso", "orgulhoso", "sozinho", "surpreso", "calmo",
               "Hoje eu estou muito feliz", "Ele está triste", "Nós estamos nervosos", "Ela está doente", "Eu estou orgulhoso"]
  }}
};
