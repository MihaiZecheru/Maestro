export default class Question {
  constructor(question, a, b, c, d, correctAnswer) {
    this.question = question;
    this.a = a; this.b = b;
    this.c = c; this.d = d;
    this.correctAnswer = correctAnswer;
  }

  getAnswers() {
    return [this.a, this.b, this.c, this.d];
  }

  isCorrectAnswer(answer) {
    return this.correctAnswer === answer;
  }
}