export default class Question {
  constructor(question, points, options, correctAnswer) {
    this.question = question;
    this.points = points;
    this.options = options;
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