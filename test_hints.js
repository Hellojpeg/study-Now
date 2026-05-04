const hintsTests = [
  "Legislative, executive, judicial",
  "Limit the power of each branch",
  "Protect individual liberties",
  "Suspending trial by jury in many cases"
];

const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'with', 'to', 'of', 'for', 'by', 'as', 'is', 'are', 'was', 'were', 'it', 'that', 'this', 'from', 'at', 'about', 'be', 'will', 'would', 'can', 'could', 'should', 'have', 'has', 'had', 'not', 'no', 'they', 'their', 'them', 'each', 'many', 'all', 'some', 'any', 'which', 'what', 'who']);

hintsTests.forEach(correctAns => {
  const words = correctAns.replace(/[^\w\s-]/g, '').split(/\s+/);
  const keywords = words.filter(w => !stopWords.has(w.toLowerCase()) && w.length > 2);
  const selectedKeywords = keywords.slice(0, 2).map(w => w.toUpperCase()).join(' and ');
  console.log(`Think about how the concepts of ${selectedKeywords} relate to the question.`);
});
