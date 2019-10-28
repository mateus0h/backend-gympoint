import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
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
    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
    });

    if (helpOrders === null) {
      return res.status(400).json({
        error: 'Student does not a have questions.',
      });
    }

    return res.json(helpOrders);
  }
}

export default new HelpOrderController();
