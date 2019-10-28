import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class ReplyOrderMail {
  get key() {
    return 'ReplyOrderMail';
  }

  async handle({ data }) {
    const { order, student } = data;
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Resposta | GYM Point',
      template: 'replyorder',
      context: {
        student: student.name,
        question: order.question,
        answer: order.answer,
        answer_at: format(parseISO(order.answer_at), "dd 'de' MMMM'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new ReplyOrderMail();
