const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    try {
      // Vérification si l'utilisateur est authentifié
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour ajouter un commentaire.');
      }

      // Ajouter l'ID de l'utilisateur dans la requête
      ctx.request.body.data.user = user.id;

      // Appel à la méthode `create` parente pour créer un commentaire
      const response = await super.create(ctx);
      return response;
    } catch (err) {
      ctx.throw(500, 'Erreur lors de la création du commentaire.');
    }
  },

  async delete(ctx) {
    try {
      // Récupérer l'utilisateur connecté
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour supprimer un commentaire.');
      }

      const { id } = ctx.params;

      // Récupérer le commentaire par ID
      const comment = await strapi.entityService.findOne('api::comment.comment', id, {
        populate: ['user'], // On s'assure de peupler l'utilisateur associé
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé.');
      }

      // Vérifier si l'utilisateur est l'auteur du commentaire
      if (comment.user.id !== user.id) {
        return ctx.forbidden('Vous ne pouvez supprimer que vos propres commentaires.');
      }

      // Supprimer le commentaire
      await strapi.entityService.delete('api::comment.comment', id);
      return ctx.send({ message: 'Commentaire supprimé avec succès.' });
    } catch (err) {
      ctx.throw(500, 'Erreur lors de la suppression du commentaire.');
    }
  },
}));


