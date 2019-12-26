import * as Yup from 'yup';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student_id = req.params.id;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const helpOrder = await HelpOrder.create({
      student_id,
      question: req.body.question,
    });

    return res.json(helpOrder);
  }

  async show(req, res) {
    const { page } = req.query;

    const offset = page * 4;
    const limit = 4;

    if (page) {
      const helpOrders = await HelpOrder.findAll({
        limit,
        offset,
        order: [['id', 'DESC']],
        where: { student_id: req.params.id },
      });

      return res.json(helpOrders);
    }

    const helpOrders = await HelpOrder.findAll({
      order: [['id', 'DESC']],
      where: { student_id: req.params.id },
    });

    return res.json(helpOrders);
  }
}

export default new HelpOrderController();
