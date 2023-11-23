const fs = require('fs');
const readline = require('readline-sync');
const PDFDocument = require('pdfkit');

// Function to read questions from a JSON file
function readQuestionsFromFile(filePath) {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// Function to generate and save question paper PDF for a specific subject
function generateAndSaveSubjectQuestionPaperPDF(questionStore, totalQuestions, difficultyDistribution, selectedSubject) {
  const subjectQuestionPaper = generateSubjectQuestionPaper(questionStore, totalQuestions, difficultyDistribution, selectedSubject);

  if (subjectQuestionPaper.length === 0) {
    console.error(`No question paper generated for ${selectedSubject}. Exiting.`);
    process.exit(1);
  }

  const pdfFilePath = `${selectedSubject}_question_paper.pdf`;
  const pdfDocument = new PDFDocument();

  // Pipe the PDF output to a file
  pdfDocument.pipe(fs.createWriteStream(pdfFilePath));

  // Add heading to the PDF
  const currentTime = new Date().toLocaleTimeString();
  pdfDocument.fontSize(18).text(`Generated ${selectedSubject} Question Paper`, { align: 'center', y: 0 });
  // calculate total marks
  var tt=0;
  subjectQuestionPaper.forEach((question, index) => {
    const difficultyPoints = getDifficultyPoints(question.difficulty);
    tt+=difficultyPoints
    
  });

  //
  pdfDocument.fontSize(11).text(`Time:2:00 hours`, { align: 'left' });
  // Move down for the next content


  // total mark
  pdfDocument.fontSize(11).text(`Total Marks:${tt}`, { align: 'left' });
  pdfDocument.moveDown(); pdfDocument.moveDown();

  // Add questions to the PDF with difficulty points
  
  // var tt=0;
  subjectQuestionPaper.forEach((question, index) => {
    const difficultyPoints = getDifficultyPoints(question.difficulty);
    // tt+=difficultyPoints
    if(difficultyPoints==10){
      pdfDocument.fontSize(13).text(`Ques.${index + 1} : ${question.question} -(${+ difficultyPoints}marks)`); 
    }
    else{
      pdfDocument.fontSize(13).text(`Ques.${index + 1} : ${question.question} -(${'0'+ difficultyPoints}marks)`);
 
    } pdfDocument.moveDown(); // Move down for the next question
  });
  console.log(`total : ${tt}`);
  // Finalize the PDF
  pdfDocument.end();

  console.log(`Question paper for ${selectedSubject} generated and saved as ${pdfFilePath}`);
}

// Function to generate a question paper for a specific subject
function generateSubjectQuestionPaper(questionStore, totalQuestions, difficultyDistribution, selectedSubject) {
  const subjectQuestionPaper = [];
  const totalQuestionsBySubject = questionStore.filter(question => question.subject === selectedSubject).length;

  difficultyDistribution.forEach(({ difficulty, percentage }) => {
    const requiredQuestions = Math.floor((percentage / 100) * totalQuestions);
    const questionsBySubjectAndDifficulty = getQuestionsBySubjectAndDifficulty(questionStore, selectedSubject, difficulty);

    console.log(`Total questions for ${selectedSubject} - difficulty ${difficulty}: ${questionsBySubjectAndDifficulty.length}`);
    console.log(`Required questions for ${selectedSubject} - difficulty ${difficulty}: ${requiredQuestions}`);

    if (questionsBySubjectAndDifficulty.length < requiredQuestions) {
      // Handle insufficient questions gracefully
      console.error(`Insufficient questions for ${selectedSubject} - difficulty ${difficulty}`);
    } else {
      // Randomly select questions for the required difficulty and subject
      const selectedQuestions = getRandomQuestions(questionsBySubjectAndDifficulty, requiredQuestions);

      // Add selected questions to the question paper
      subjectQuestionPaper.push(...selectedQuestions);
    }
  });

  return subjectQuestionPaper;
}

// Function to get questions by subject and difficulty
function getQuestionsBySubjectAndDifficulty(questionStore, subject, difficulty) {
  return questionStore.filter((question) => question.subject === subject && question.difficulty === difficulty);
}

// Function to get difficulty points based on difficulty level
function getDifficultyPoints(difficulty) {
  // You can customize the points based on your requirements
  switch (difficulty) {
    case 'Easy':
      return 2;
    case 'Medium':
      return 5;
    case 'Hard':
      return 10;
    default:
      return 0;
  }
}

// Function to get a random subset of questions
function getRandomQuestions(questions, count) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

// Read questions from the JSON file
const questionsFilePath = 'questions.json'; // Replace with your actual JSON file path
const questionStore = readQuestionsFromFile(questionsFilePath);

// Get user input for the total number of questions
const totalQuestions = parseInt(readline.question('Enter the total number of questions to generate: '));

// Get user input for difficulty distribution percentages
const easyPercentage = parseInt(readline.question('Enter percentage of Easy questions: '));
const mediumPercentage = parseInt(readline.question('Enter percentage of Medium questions: '));
const hardPercentage = parseInt(readline.question('Enter percentage of Hard questions: '));

// Set the distribution of difficulty levels
const difficultyDistribution = [
  { difficulty: 'Easy', percentage: easyPercentage },
  { difficulty: 'Medium', percentage: mediumPercentage },
  { difficulty: 'Hard', percentage: hardPercentage },
];

// Validate if the total percentage is 100
const totalPercentage = easyPercentage + mediumPercentage + hardPercentage;
if (totalPercentage !== 100) {
  console.error('Error: The total percentage must be 100. Please adjust the percentages.');
  process.exit(1);
}

// Get user input for the subject
const selectedSubject = readline.question('Enter the subject for which you want to generate the question(eg.Math, English, Physics) paper: ');

// Generate and print the question paper for the selected subject
generateAndSaveSubjectQuestionPaperPDF(questionStore, totalQuestions, difficultyDistribution, selectedSubject);
