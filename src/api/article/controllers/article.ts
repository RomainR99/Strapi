import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    console.log('hello');

    ctx.request.body.data.user = user.id;

    const response = await strapi.controller('api::article.article').create(ctx, async () => {});
    return response;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const post = await strapi.entityService.findOne('api::article.article', id, {
      populate: ['user'],
    }) as { user?: { id: number } };

    if (!post || !post.user) {
      return ctx.notFound("Article ou auteur introuvable.");
    }

    if (post.user.id !== user.id) {
      return ctx.forbidden("Vous ne pouvez supprimer que vos propres articles.");
    }

    const response = await strapi.controller('api::article.article').delete(ctx, async () => {});
    return response;
  },
}));



