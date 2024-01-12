import { createContext, useReducer } from "react";
import questions from "../data/questions_complete";//Importa um conjunto de perguntas do arquivo questions_complete

//estágios do jogo
const STAGES = ["Start", "Category", "Playing", "End"];

const initialState = {
  gameStage: STAGES[0],//Representa a fase atual do jogo, inicializada como a primeira fase (Start).
  questions,// perguntas dentro de "data - questions.js"
  currentQuestion: 0,//Representa o índice da pergunta atual no array de perguntas.
  answerSelected: false,//Indica se uma resposta foi selecionada pelo usuário.
  score: 0,//Armazena a pontuação do jogador.
  help: false,//Indica se o jogador pediu ajuda ou não.
  optionToHide: null,//Armazena a opção que deve ser escondida, se aplicável.
};

console.log(initialState);// verificar se o estado está sendo corretamente inicializado

//Reducer
const quizReducer = (state, action) => {
  switch (action.type) {
    //Muda a fase do jogo para a próxima fase.
    case "CHANGE_STAGE":
      return {
        ...state,//operador spread é utilizado para criar uma cópia do estado atual.
        gameStage: STAGES[1],
      };

    //Inicia o jogo com perguntas de uma categoria específica.  
    case "START_GAME":
      let quizQuestions = null;

      state.questions.forEach((question) => {
        if (question.category === action.payload) {
          quizQuestions = question.questions;
        }
      });

      return {
        ...state,
        questions: quizQuestions,
        gameStage: STAGES[2],
      };

      // Reordena aleatoriamente as perguntas do jogo.
    case "REORDER_QUESTIONS":
      const reorderedQuestions = state.questions.sort(() => {
        return Math.random() - 0.5;
      });

      return {
        ...state,
        questions: reorderedQuestions,
      };

      //Move para a próxima pergunta ou encerra o jogo se não houver mais perguntas.
    case "CHANGE_QUESTION": {
      const nextQuestion = state.currentQuestion + 1;
      let endGame = false;

      if (!state.questions[nextQuestion]) {
        endGame = true;
      }

      return {
        ...state,
        currentQuestion: nextQuestion,
        gameStage: endGame ? STAGES[3] : state.gameStage,
        answerSelected: false,
        help: false,
      };
    }

    //Reinicia o jogo, retornando ao estado inicial.
    case "NEW_GAME": {
      console.log(questions);
      console.log(initialState);
      return initialState;
    }

    //Verifica se a resposta selecionada é correta e atualiza a pontuação.
    case "CHECK_ANSWER": {
      if (state.answerSelected) return state;

      const answer = action.payload.answer;
      const option = action.payload.option;
      let correctAnswer = 0;

      if (answer === option) correctAnswer = 1;

      return {
        ...state,
        score: state.score + correctAnswer,
        answerSelected: option,
      };
    }

    //Exibe uma dica para a pergunta atual.
    case "SHOW_TIP": {
      return {
        ...state,
        help: "tip",
      };
    }

    //Remove uma opção errada da pergunta atual.
    case "REMOVE_OPTION": {
      const questionWithoutOption = state.questions[state.currentQuestion];

      console.log(state.currentQuestion);

      console.log(questionWithoutOption);

      let repeat = true;
      let optionToHide;

      questionWithoutOption.options.forEach((option) => {
        if (option !== questionWithoutOption.answer && repeat) {
          optionToHide = option;
          repeat = false;
        }
      });

      return {
        ...state,
        optionToHide,
        help: true,
      };
    }

    default:
      return state;
  }
};

export const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const value = useReducer(quizReducer, initialState);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};