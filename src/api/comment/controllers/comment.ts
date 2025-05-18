'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour ajouter un commentaire.');
      }

      const { Content, article, hashtags = [] } = ctx.request.body.data;

      // Créer ou récupérer les hashtags
      const hashtagIds = [];

      for (const tag of hashtags) {
        let existing = await strapi.db.query('api::hashtag.hashtag').findOne({
          where: { name: tag },
        });

        if (!existing) {
          existing = await strapi.entityService.create('api::hashtag.hashtag', {
            data: { name: tag },
          });
        }

        hashtagIds.push(existing.id);
      }

      // Création du commentaire avec les hashtags et l'utilisateur
      const response = await strapi.entityService.create('api::comment.comment', {
        data: {
          Content,
          article,
          user: user.id,
          hashtags: hashtagIds.map(id => ({ id })), // association via relation
        },
        populate: ['user', 'hashtags'],
      });

      return ctx.send({ data: response });

    } catch (err) {
      console.error("Erreur lors de la création du commentaire :", err);
      ctx.throw(500, 'Erreur lors de la création du commentaire.');
    }
  },

  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour supprimer un commentaire.');
      }

      const { id } = ctx.params;

      const comment = await strapi.entityService.findOne('api::comment.comment', id, {
        populate: ['user'],
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé.');
      }

      if (comment.user.id !== user.id) {
        return ctx.forbidden('Vous ne pouvez supprimer que vos propres commentaires.');
      }

      await strapi.entityService.delete('api::comment.comment', id);
      return ctx.send({ message: 'Commentaire supprimé avec succès.' });
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire :", err);
      ctx.throw(500, 'Erreur lors de la suppression du commentaire.');
    }
  },
}));


