import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class ReplyOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    req.body.answer_at = new Date();

    const order = await HelpOrder.findByPk(req.params.id);

    await order.update(req.body);

    const student = await Student.findByPk(req.params.id, {
      attributes: ['name', 'email'],
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Resposta | GYM Point',
      text: 'Sua pergunta foi respondida, verifique abaixo',
    });

    return res.json(order);
  }
}

export default new ReplyOrderController();
