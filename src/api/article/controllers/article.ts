/**
 * article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    // if (!user) {
    //   return ctx.unauthorized("Vous devez être connecté pour créer un article.");
    // } pas besoin car le user à un controlleur sur trapi sur sa route avant d'arriver à cette étape
    console.log('hello')

    ctx.request.body.data.user = user.id


    return await super.create(ctx)
  }
}));
