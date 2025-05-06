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
    }
  };
});





