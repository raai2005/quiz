const startBtn = document.getElementById("start-btn");
const topicsSelector = document.getElementById("topics");
const questionCountDisplay = document.getElementById("question-count");
const incrementBtn = document.getElementById("increment");
const decrementBtn = document.getElementById("decrement");
const quizSection = document.querySelector(".quiz");
const questionDiv = document.getElementById("question");
const optionsDiv = document.getElementById("options");
const submitBtn = document.getElementById("submit-btn");
const resultDiv = document.getElementById("result");
const difficultySelector = document.getElementById("difficulty");
const questionTypeSelector = document.getElementById("questionType");

let questions = [];
let currentQuestionIndex = 0;
let correctAnswer = "";
let questionLimit = 5; // Initial question limit
let score = 0;
let totalQuestions = 0;

// Increase question count
incrementBtn.addEventListener("click", () => {
  if (questionLimit < 20) {
    questionLimit++;
    questionCountDisplay.textContent = questionLimit;
  }
});

// Decrease question count
decrementBtn.addEventListener("click", () => {
  if (questionLimit > 1) {
    questionLimit--;
    questionCountDisplay.textContent = questionLimit;
  }
});

// Start the quiz
startBtn.addEventListener("click", async () => {
  score = 0;
  const topic = topicsSelector.value;
  const difficulty = difficultySelector.value;
  const type = questionTypeSelector.value;

  // Hide the quiz container content first
  document.querySelector(".quiz-container").innerHTML = "";
  
  // Create a new div for questions only
  const questionContainer = document.createElement('div');
  questionContainer.className = 'p-4';
  document.querySelector(".quiz-container").appendChild(questionContainer);
  
  questions = await fetchQuestions(topic, questionLimit, difficulty, type);

  if (questions.length > 0) {
    currentQuestionIndex = 0;
    loadQuestion(questions[currentQuestionIndex]);
    quizSection.classList.remove("hidden");
    startBtn.disabled = true;
  } else {
    alert("Failed to load questions. Please try again!");
  }
});

// Fetch questions from API
async function fetchQuestions(topic, limit, difficulty, type) {
  const url = `https://opentdb.com/api.php?amount=${limit}&category=${topic}&difficulty=${difficulty}&type=${type}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return [];
  }
}

// Load a question into the DOM
function loadQuestion(data) {
  const questionData = questions[currentQuestionIndex];
  correctAnswer = questionData.correct_answer;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const questionContainer = document.querySelector(".quiz-container");
  questionContainer.innerHTML = `
    <div class="max-w-2xl mx-auto relative">
      ${!isLastQuestion ? `
        <div id="timer-container" class="absolute -top-6 left-0 w-full h-1">
          <div id="timer-bar" class="w-full h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div class="h-full w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-xl transition-all duration-1000"></div>
          </div>
        </div>
      ` : ''}
      <div class="p-4">
        <div class="text-xl md:text-2xl font-bold mb-6 animate__animated animate__fadeInDown">
          ${currentQuestionIndex + 1}. ${questionData.question}
        </div>
        <div id="options" class="space-y-4"></div>
        <button id="submit-btn" class="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shine-effect">
          Submit Answer
        </button>
        <div id="result" class="mt-4 text-center font-bold hidden"></div>
      </div>
    </div>
  `;

  const optionsDiv = questionContainer.querySelector("#options");
  const answers = [...questionData.incorrect_answers, questionData.correct_answer];
  shuffleArray(answers);

  answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 option-hover";
    label.innerHTML = `
      <input type="radio" name="answer" value="${answer}" class="w-5 h-5 text-purple-600 mr-3">
      <span class="text-gray-700 flex-grow">${answer}</span>
    `;
    setTimeout(() => {
      label.classList.add('animate__animated', 'animate__fadeInUp');
    }, index * 100);
    optionsDiv.appendChild(label);
  });

  // Re-attach event listener to new submit button
  const newSubmitBtn = questionContainer.querySelector("#submit-btn");
  newSubmitBtn.addEventListener("click", handleSubmit);
}

// Shuffle answers for randomness
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// New function to handle submit
function handleSubmit() {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  const resultDiv = document.querySelector("#result");
  const timerDiv = document.querySelector("#timer");
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (selectedAnswer) {
    const allLabels = document.querySelectorAll('label');
    
    document.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);

    // Show answer highlighting
    allLabels.forEach(label => {
      const answerText = label.querySelector('span').textContent;
      if (answerText === correctAnswer) {
        label.className = "flex items-center p-3 border rounded-lg bg-emerald-200 border-emerald-600 transition-colors duration-200";
        if (selectedAnswer.value === correctAnswer) {
          label.innerHTML += '<span class="ml-2">🎉</span>';
        }
      }
      
      if (answerText === selectedAnswer.value && selectedAnswer.value !== correctAnswer) {
        label.className = "flex items-center p-3 border rounded-lg bg-rose-200 border-rose-600 transition-colors duration-200";
      }
    });

    if (selectedAnswer.value === correctAnswer) {
      score++;
      resultDiv.textContent = "Correct! 🎉";
      resultDiv.className = "mt-4 text-center font-bold text-emerald-600 animate-bounce";
    } else {
      resultDiv.textContent = "Wrong!";
      resultDiv.className = "mt-4 text-center font-bold text-rose-600";
    }

    resultDiv.classList.remove("hidden");
    document.querySelector("#submit-btn").disabled = true;

    // Handle timer and next question
    if (!isLastQuestion) {
        const timerBar = document.querySelector("#timer-bar div");
        let timeLeft = 3;

        timerBar.style.width = "100%";

        const countdown = setInterval(() => {
            timeLeft--;
            const percentage = (timeLeft / 3) * 100;
            timerBar.style.width = `${percentage}%`;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                currentQuestionIndex++;
                loadQuestion(questions[currentQuestionIndex]);
            }
        }, 1000);
    } else {
        // On last question, show result after a delay to allow seeing the answer
        setTimeout(() => {
            const percentage = Math.round((score / questions.length) * 100);
            const resultMessage = getResultMessage(percentage);
            showResultScreen(percentage, score, questions.length, resultMessage);
            createConfetti();
        }, 3000); // Increased delay to 3 seconds for last question
    }
  } else {
    alert("Please select an answer!");
  }
}

// Reset the quiz
function resetQuiz() {
  questions = [];
  currentQuestionIndex = 0;
  correctAnswer = "";
  quizSection.classList.add("hidden");
  startBtn.disabled = false;
  submitBtn.classList.add("hidden");

  // Show all hidden elements
  document.querySelector("header").classList.remove("hide");
  document.querySelector(".setup").classList.remove("hide");
  document.querySelector("footer").classList.remove("hide");
  startBtn.classList.remove("hide");
  
  // Restore original padding
  document.querySelector(".quiz-container").classList.remove("p-4");
  document.querySelector(".quiz-container").classList.add("p-8");
}

function showCompletionModal() {
    const modal = document.getElementById('completion-modal');
    const modalContent = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    // Add animation after a small delay
    setTimeout(() => {
        modalContent.classList.remove('scale-0');
        modalContent.classList.add('scale-100');
        // Add confetti effect
        createConfetti();
    }, 100);
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 3000);
    }
}

function getResultMessage(percentage) {
  if (percentage === 100) return "Perfect Score! You're a quiz master! 🏆";
  if (percentage >= 80) return "Excellent work! Almost perfect! 🌟";
  if (percentage >= 60) return "Good job! Keep practicing! 👍";
  if (percentage >= 40) return "Not bad! Room for improvement! 💪";
  return "Keep learning! You'll do better next time! 📚";
}

function shareResult(percentage) {
  const text = `I just scored ${percentage}% on the Dynamic Quiz! Can you beat my score? 🎯`;
  if (navigator.share) {
    navigator.share({
      title: 'My Quiz Result',
      text: text,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback to copying to clipboard
    navigator.clipboard.writeText(text)
      .then(() => alert('Result copied to clipboard!'))
      .catch(console.error);
  }
}

function showResultScreen(percentage, score, total, message) {
  document.querySelector(".quiz-container").innerHTML = `
    <div class="text-center p-8 animate__animated animate__fadeIn">
      <div class="text-7xl mb-6 floating">🏆</div>
      <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">Quiz Results</h2>
      <div class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 pulse">${percentage}%</div>
      <p class="text-xl text-gray-700 mb-4">You got ${score} out of ${total} questions correct!</p>
      <p class="text-lg text-gray-600 mb-8">${message}</p>
      <div class="space-y-4">
        <button onclick="location.reload()" 
          class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shine-effect">
          Try Another Quiz
        </button>
        <button onclick="shareResult(${percentage})" 
          class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shine-effect">
          Share Result 🔗
        </button>
      </div>
    </div>
  `;
}
