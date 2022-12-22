export default class Question {
  constructor(question, a, b, c, d, correctAnswer) {
    this.question = question;
    this.options = [a, b, c, d];
    this.correctAnswer = correctAnswer;
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

  isCorrectAnswer(answer) {
    return this.correctAnswer === answer;
  }
}