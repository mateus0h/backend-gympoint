import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, price, end_date } = data;
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula | GYM Point',
      template: 'enrollment',
      context: {
        student: student.name,
        plan: plan.title,
        duration:
          plan.duration === 1
            ? `${plan.duration} Mês`
            : `${plan.duration} Meses`,
        price: `R$ ${price}`,
        end_date: format(parseISO(end_date), "dd 'de' MMMM'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollmentMail();
