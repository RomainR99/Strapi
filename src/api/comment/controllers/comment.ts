'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour ajouter un commentaire.');
      }

      const { data } = ctx.request.body;
      const { Content, article, hashtags = [] } = data;

      if (!Content || !article) {
        return ctx.badRequest("Le contenu et l'article sont requis.");
      }

      const hashtagIds = [];

      for (const tag of hashtags) {
        let tagId;

        if (typeof tag === 'object' && tag.id) {
          tagId = tag.id;
        } else if (typeof tag === 'string') {
          let existing = await strapi.db.query('api::hashtag.hashtag').findOne({
            where: { Hashtag: tag },
          });

          if (!existing) {
            existing = await strapi.entityService.create('api::hashtag.hashtag', {
              data: { Hashtag: tag },
            });
          }

          tagId = existing.id;
        }

        if (tagId) {
          hashtagIds.push(tagId);
        
          const articleData = await strapi.entityService.findOne('api::article.article', article, {
            populate: ['hashtags'],
          });
        
          if (!articleData) {
            return ctx.badRequest("Article non trouvé.");
          }
        
          const alreadyLinked = articleData.hashtags?.some(h => h.id === tagId);
        
          if (!alreadyLinked) {
            await strapi.entityService.update('api::article.article', article, {
              data: {
                hashtags: [...(articleData.hashtags || []).map(h => h.id), tagId],
              },
            });
          }
        }
        
      }

      // Préparer les données à créer
      const newData = {
        Content,
        article,
        user: user.id,
        hashtags: hashtagIds.map(id => ({ id })),
      };

      ctx.request.body = { data: newData };

      const response = await super.create(ctx);
      return response;

    } catch (err) {
      console.error("Erreur lors de la création du commentaire :", err);
      return ctx.internalServerError('Erreur serveur lors de la création du commentaire : ' + err.message);
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
      return ctx.internalServerError('Erreur lors de la suppression du commentaire : ' + err.message);
    }
  },
}));





