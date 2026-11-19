/* Levels A2 to C2: shared English skeleton. Same shape as UNITS in data.js (10 words/phrases, then 5 sentences).
   `lvl` groups units into CEFR levels on the learning path. Packs add translations with addAdv(). */
window.LEVELS = [
  { id: "A1", name: "Beginner", blurb: "First words and everyday basics" },
  { id: "A2", name: "Elementary", blurb: "Routine, shopping, health" },
  { id: "B1", name: "Intermediate", blurb: "Travel, work, opinions" },
  { id: "B2", name: "Upper intermediate", blurb: "Society, science, culture" },
  { id: "C1", name: "Advanced", blurb: "Abstract ideas, professional and ethical topics" },
  { id: "C2", name: "Proficiency", blurb: "Nuance, argument, literary language" }
];
window.UNITS.forEach(function (u) { u.lvl = "A1"; });
window.UNITS.push(
  { id: "a2d", lvl: "A2", title: "Daily routine", blurb: "Mornings, meals, chores", color: "#0b6e8a",
    en: ["to wake up", "to sleep", "the breakfast", "the morning", "the evening", "to cook", "to clean", "the shower", "early", "late",
         "I wake up at seven", "She cooks dinner every evening", "We usually eat at home", "He is late for work today", "Do you clean the house on Sundays"],
    p: [".", ".", ".", ".", "?"] },
  { id: "a2s", lvl: "A2", title: "Shopping and money", blurb: "Prices, paying, sizes", color: "#b4541a",
    en: ["the shop", "the price", "the money", "cheap", "expensive", "to buy", "to pay", "the bag", "the size", "the receipt",
         "I want to buy a new bag", "This shirt is too expensive", "Can I pay by card", "Do you have a bigger size", "The shop closes at eight"],
    p: [".", ".", "?", "?", "."] },
  { id: "a2h", lvl: "A2", title: "Health and body", blurb: "Doctor, pain, medicine", color: "#5b4bb0",
    en: ["the head", "the hand", "the doctor", "the medicine", "the pain", "the fever", "the stomach", "to rest", "healthy", "the appointment",
         "I have a headache", "You should see a doctor", "My stomach has hurt since yesterday", "She takes medicine twice a day", "I need an appointment for tomorrow"],
    p: [".", ".", ".", ".", "."] },

  { id: "b1t", lvl: "B1", title: "Travel plans", blurb: "Tickets, flights, bookings", color: "#1f7a3d",
    en: ["the ticket", "the flight", "the luggage", "the passport", "the reservation", "the delay", "the journey", "the border", "to book", "to arrive",
         "I booked a room for three nights", "The flight was delayed by two hours", "We arrive in the city tomorrow evening", "Could you tell me where the baggage claim is", "I have never travelled abroad before"],
    p: [".", ".", ".", "?", "."] },
  { id: "b1w", lvl: "B1", title: "Work and study", blurb: "Jobs, meetings, deadlines", color: "#a02c3a",
    en: ["the job", "the colleague", "the meeting", "the salary", "the experience", "the degree", "the deadline", "the boss", "to apply", "to improve",
         "I am applying for a new job", "The meeting starts at nine tomorrow", "She has a lot of experience in marketing", "We must finish the project before the deadline", "I would like to improve my language skills"],
    p: [".", ".", ".", ".", "."] },
  { id: "b1o", lvl: "B1", title: "Opinions and plans", blurb: "Agree, decide, advise", color: "#8a5a00",
    en: ["the opinion", "the plan", "the problem", "the reason", "the advice", "the future", "the idea", "to agree", "to decide", "probably",
         "In my opinion this plan is good", "I agree with you completely", "I have not decided yet what to do", "If it rains tomorrow we will stay home", "You should ask her for advice"],
    p: [".", ".", ".", ".", "."] },

  { id: "b2s", lvl: "B2", title: "Society and media", blurb: "News, law, the economy", color: "#0b6e8a",
    en: ["the government", "the news", "the society", "the environment", "the law", "the election", "the economy", "the debate", "to influence", "to criticize",
         "The government announced new environmental laws", "Many people get their news from social media", "The economy has grown more slowly this year", "Experts are debating whether the law will work", "Young voters could influence the election"],
    p: [".", ".", ".", ".", "."] },
  { id: "b2t", lvl: "B2", title: "Science and technology", blurb: "Research, data, discoveries", color: "#b4541a",
    en: ["the research", "the evidence", "the invention", "the software", "the data", "the experiment", "the discovery", "the result", "to develop", "to analyze",
         "Scientists have developed a new vaccine", "The results of the experiment surprised everyone", "We need more evidence before we can draw conclusions", "This software analyzes large amounts of data", "The discovery could change how we treat the disease"],
    p: [".", ".", ".", ".", "."] },
  { id: "b2c", lvl: "B2", title: "Culture and ideas", blurb: "Traditions, art, beliefs", color: "#5b4bb0",
    en: ["the tradition", "the custom", "the identity", "the heritage", "the festival", "the artist", "the exhibition", "the belief", "to inherit", "to preserve",
         "Every region has its own traditions", "The museum is preserving the cultural heritage", "She became famous after her first exhibition", "Customs change as societies develop", "Not everyone shares the same beliefs"],
    p: [".", ".", ".", ".", "."] },

  { id: "c1a", lvl: "C1", title: "Abstract thinking", blurb: "Assumptions, perspective, dilemmas", color: "#1f7a3d",
    en: ["the consequence", "the assumption", "the contradiction", "the perspective", "the dilemma", "the bias", "the nuance", "the criterion", "to undermine", "to reinforce",
         "Every decision has unintended consequences", "His argument rests on a questionable assumption", "We should consider the issue from a different perspective", "The results reinforce our original hypothesis", "It is hard to resolve this dilemma without compromise"],
    p: [".", ".", ".", ".", "."] },
  { id: "c1w", lvl: "C1", title: "Professional life", blurb: "Strategy, negotiation, delegation", color: "#a02c3a",
    en: ["the negotiation", "the strategy", "the stakeholder", "the initiative", "the budget", "the proposal", "the outcome", "the commitment", "to implement", "to delegate",
         "The negotiations lasted far longer than expected", "She implemented a strategy that reduced costs significantly", "We have to involve all stakeholders from the beginning", "Delegating tasks effectively requires trust", "The proposal was rejected despite strong support"],
    p: [".", ".", ".", ".", "."] },
  { id: "c1e", lvl: "C1", title: "Law and ethics", blurb: "Rights, privacy, fairness", color: "#8a5a00",
    en: ["the responsibility", "the freedom", "the justice", "the inequality", "the privacy", "the ethics", "the policy", "the regulation", "to violate", "to uphold",
         "Everyone should be able to uphold their rights", "The new regulation violates our privacy", "Inequality has widened over the past decade", "Whether this policy is fair remains controversial", "Freedom of speech carries responsibility"],
    p: [".", ".", ".", ".", "."] },

  { id: "c2n", lvl: "C2", title: "Nuance and precision", blurb: "Fine shades of meaning", color: "#0b6e8a",
    en: ["ambiguous", "relentless", "meticulous", "profound", "ephemeral", "pragmatic", "eloquent", "resilient", "to scrutinize", "to elucidate",
         "Her eloquent speech left a profound impression", "He is meticulous about every detail", "The situation remains ambiguous despite repeated clarifications", "Their resilience in the face of adversity was remarkable", "The committee will scrutinize every proposal carefully"],
    p: [".", ".", ".", ".", "."] },
  { id: "c2a", lvl: "C2", title: "Argument and rhetoric", blurb: "Premises, paradox, rebuttal", color: "#b4541a",
    en: ["the premise", "the rebuttal", "the rhetoric", "the paradox", "the irony", "the discourse", "the hypothesis", "the inference", "to refute", "to concede",
         "He conceded that his premise was flawed", "The paradox is that progress creates new problems", "She refuted every claim with precise evidence", "Political rhetoric often obscures the real issues", "Nothing is more ironic than a cure that causes the disease"],
    p: [".", ".", ".", ".", "."] },
  { id: "c2l", lvl: "C2", title: "Literature and reflection", blurb: "Metaphor, narrative, solitude", color: "#5b4bb0",
    en: ["the metaphor", "the narrative", "the symbolism", "the narrator", "the theme", "the tragedy", "the allegory", "the nostalgia", "the solitude", "to evoke",
         "The novel evokes a deep sense of nostalgia", "Through metaphor the poet conveys the loneliness of exile", "The narrator gradually reveals the truth behind the tragedy", "Many readers interpret the story as an allegory of power", "Solitude can be both a refuge and a burden"],
    p: [".", ".", ".", ".", "."] }
);

/* addAdv("de", { a2d: [15 strings], ... }, { a2d: [15 romanizations], ... }) */
window.addAdv = function (id, units, roman) {
  var p = window.PACKS[id]; if (!p) throw new Error("addAdv: unknown pack " + id);
  Object.keys(units).forEach(function (k) { p.units[k] = units[k]; });
  if (roman) { p.roman = p.roman || {}; Object.keys(roman).forEach(function (k) { p.roman[k] = roman[k]; }); }
};
