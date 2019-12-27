import { endOfDay, startOfDay, format, subDays, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;
    const { page } = req.query;

    const offset = page * 7;

    const dbQuery = {};
    if (page) {
      dbQuery.limit = 7;
      dbQuery.offset = offset;
    }

    const chekins = await Checkin.findAll({
      ...dbQuery,
      where: { student_id: id },
      order: [['id', 'DESC']],
    });

    return res.json(chekins);
  }

  async store(req, res) {
    const student_id = req.params.id;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollmentExists) {
      return res.status(400).json({ error: 'Student has not enrollment.' });
    }

    const oldDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const oldCheckins = await Checkin.count({
      where: {
        student_id,
        created_at: {
          [Op.between]: [startOfDay(parseISO(oldDate)), endOfDay(new Date())],
        },
      },
    });

    if (oldCheckins === 5) {
      return res.status(401).json({ error: 'maximum login reached.' });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }
}

export default new CheckinController();
