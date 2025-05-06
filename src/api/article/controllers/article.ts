/**
 * article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => {
  return {
    async create(ctx) {
      const user = ctx.state.user;

      // Si on est ici, le user est déjà authentifié (pas besoin de vérification)
      console.log('hello');

      ctx.request.body.data.user = user.id;

      // Appel de la méthode de base via super
      return await super.create(ctx);
    },

    async delete(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
      
        const post = await strapi.entityService.findOne('api::article.article', id, {
          populate: ['user'],
        }) as { user?: { id: number } };
      
        if (!post || !post.user || post.user.id !== user.id) {
          return ctx.forbidden("Vous ne pouvez supprimer que vos propres articles.");
        }
      
        // Suppression réelle depuis la base de données (Neon)
        await strapi.entityService.delete('api::article.article', id);
      
        return ctx.send({ message: "Article supprimé de la base de données." });
      }
      
  };
});

