/**
 * comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;
      ctx.request.body.data.user = user.id;

      const response = await super.create(ctx);
      return response;
    } catch (err) {
      ctx.throw(500, 'Erreur lors de la création du commentaire.');
    }
  },

  async delete(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;

      const comment = await strapi.entityService.findOne('api::comment.comment', id, {
        populate: ['user'],
      }) as { user?: { id: number } };
      

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé.');
      }

      if (!comment.user || comment.user.id !== user.id) {
        return ctx.forbidden('Vous ne pouvez supprimer que vos propres commentaires.');
      }

      await strapi.entityService.delete('api::comment.comment', id);
      return ctx.send({ message: 'Commentaire supprimé avec succès.' });
    } catch (err) {
      ctx.throw(500, 'Erreur lors de la suppression du commentaire.');
    }
  },
}));

