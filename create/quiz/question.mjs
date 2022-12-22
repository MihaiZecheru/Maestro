import { uuid4 } from "/api.mjs";

export default class Question {
  constructor(question, points, options, correctAnswer) {
    this.question = question; // string
    this.points = points; // float
    this.options = options; // arr[string]
    this.correctAnswer = correctAnswer; // char
    this.uuid = uuid4(); // string
  }

  getOptionA() {
    return this.options[0];
  }

  getOptionB() {
    return this.options[1];
  }

  getOptionC() {
    return this.options[2];
  }

  getOptionD() {
    return this.options[3];
  }

  isCorrectAnswer(c) {
    return this.correctAnswer === c;
  }
}