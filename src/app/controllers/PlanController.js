import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll();
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    if (title !== plan.title) {
      const planExists = await Plan.findOne({ where: { title } });

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exists.' });
      }
    }

    await plan.update(req.body);

    return res.json(plan);
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    await plan.destroy();

    return res.json();
  }
}

export default new PlanController();
