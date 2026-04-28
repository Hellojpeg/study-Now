const fs = require('fs');
const text = fs.readFileSync('/workspaces/study-Now/quiz_text.txt', 'utf8');

const lines = text.split('\n').map(l => l.trim());
let questions = [];
let currentQuestion = null;
let currentNumber = 1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // match '1.' or '1. ' 
  const numMatch = line.match(/^(\d+)\.$/) || line.match(/^(\d+)\.\s/);
  if (numMatch && parseInt(numMatch[1]) === currentNumber && !line.includes('SS.7.C')) {
    if (currentQuestion) questions.push(currentQuestion);
    
    let textPortion = '';
    if (line.match(/^(\d+)\.\s/)) {
        textPortion = line.substring(numMatch[0].length).trim();
    }
    
    currentQuestion = {
      benchmark: "",
      text: textPortion,
      options: [],
      answerMatch: "A"
    };
    
    for (let back = i - 1; back >= Math.max(0, i - 10); back--) {
       if (lines[back].match(/SS\.\d\.[A-Z]\.\d\.\d.*/)) {
          currentQuestion.benchmark = lines[back];
          break;
       }
    }
    currentNumber++;
  } else if (currentQuestion) {
    if (line.match(/^[A-D]\.\s/)) {
       currentQuestion.options.push(line.substring(3).trim());
    } else if (line.match(/^Answer:\s*/)) {
       // skip
    } else if (line.length > 0 && currentQuestion.options.length === 0 && !line.startsWith('Answer:')) {
       currentQuestion.text += (currentQuestion.text ? " " : "") + line;
    }
  }
}
if (currentQuestion) questions.push(currentQuestion);

// Parse answer key
let answers = {};
lines.forEach(line => {
  // answer key lines look like "1. A SS.7.C.1.1 15. B SS.7.C.2.1"
  [...line.matchAll(/(\d+)\.\s([A-D])/g)].forEach(m => {
     answers[parseInt(m[1])] = m[2];
  });
});

let output = "import { Question } from './types';\n\nexport const CIV_EOC_NEW: Question[] = [\n";
questions.forEach((q, idx) => {
   let opts = q.options.filter(o => o.length > 0);
   if (opts.length < 4) opts = [...opts, ...Array(4 - opts.length).fill("N/A")];
   opts = opts.slice(0, 4);
   let correctAns = answers[idx + 1] || "A";
   let correctIndex = correctAns.charCodeAt(0) - 65;
   
   output += `  {
    id: ${1000 + idx},
    unit: 'EOC Practice',
    benchmark: ${JSON.stringify(q.benchmark)},
    question: ${JSON.stringify(q.text.trim())},
    options: ${JSON.stringify(opts)},
    correctAnswerIndex: ${correctIndex},
    quarter: 'FIN'
  },\n`;
});
output += "];\n";

fs.writeFileSync('/workspaces/study-Now/parsed_questions.ts', output);
