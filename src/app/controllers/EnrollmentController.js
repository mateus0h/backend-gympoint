import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Plan from '../models/Plan';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'id'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'id'],
        },
      ],
    });
    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const enrollmentExists = await Enrollment.findOne({
      where: { student_id: req.body.student_id },
    });

    if (enrollmentExists) {
      return res.status(400).json({ error: 'Student already enrolled.' });
    }

    const { start_date, student_id, plan_id } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    const price = plan.price * plan.duration;

    const end_date = addMonths(parseISO(req.body.start_date), plan.duration);

    const student = await Student.findByPk(student_id, {
      attributes: ['name', 'email'],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const enrollment = await Enrollment.create({
      start_date,
      student_id,
      plan_id,
      end_date,
      price,
    });

    await Queue.add(EnrollmentMail.key, {
      student,
      enrollment,
      plan,
      price,
      end_date,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);
    // Checks if the Enrollment ID exists.
    if (enrollment === null) {
      return res.status(404).json({ error: 'Enrollment not exists.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    // Checks if the student already has enrollment.
    if (student_id !== enrollment.student_id) {
      const enrollmentExists = await Enrollment.findOne({
        where: { student_id },
      });

      if (enrollmentExists) {
        return res.status(400).json({ error: 'Student already enrolled.' });
      }
    }

    if (
      plan_id !== enrollment.plan_id ||
      enrollment.start_date !== start_date
    ) {
      const plan = await Plan.findOne({ where: { id: plan_id } });

      if (!plan) {
        return res.status(400).json({ error: 'Plan not exists.' });
      }

      req.body.price = plan.price * plan.duration;

      req.body.end_date = addMonths(
        parseISO(req.body.start_date),
        plan.duration
      );
    }

    await enrollment.update(req.body);

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    await enrollment.destroy();

    return res.json();
  }
}
export default new EnrollmentController();
