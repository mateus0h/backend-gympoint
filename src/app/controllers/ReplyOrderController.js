import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import ReplyOrderMail from '../jobs/ReplyOrderMail';
import Queue from '../../lib/Queue';

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

    const student = await Student.findByPk(order.student_id, {
      attributes: ['name', 'email'],
    });

    await Queue.add(ReplyOrderMail.key, {
      student,
      order,
    });

    return res.json(order);
  }
}

export default new ReplyOrderController();
