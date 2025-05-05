/**
 * article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Vous devez être connecté pour créer un article.");
    }

    const { data } = ctx.request.body;

    try {
      const response = await strapi.entityService.create('api::article.article', {
        data: {
          ...data,
          user: user.id, // Associe automatiquement l'utilisateur connecté
        },
        populate: { user: true }, // Optionnel : inclure les infos user dans la réponse Pour le token
      });

      return ctx.send(response);
    } catch (err) {
      console.error("Erreur lors de la création d'un article :", err);
      return ctx.badRequest("Impossible de créer l'article.");
    }
  }
}));
