module.exports = {
    async beforeCreate(event) {
      const { data } = event.params;
      if (data.description) {
        const hashtags = extractHashtags(data.description);
        data.hashtags = await linkOrCreateHashtags(hashtags);
      }
    },
    async beforeUpdate(event) {
      const { data } = event.params;
      if (data.description) {
        const hashtags = extractHashtags(data.description);
        data.hashtags = await linkOrCreateHashtags(hashtags);
      }
    },
  };
  
  function extractHashtags(text) {
    const matches = text.match(/#\w+/g);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  }
  
  async function linkOrCreateHashtags(tags) {
    const hashtagService = strapi.entityService;
    const existing = await hashtagService.findMany('api::hashtag.hashtag', {
      filters: { name: { $in: tags } }
    });
  
    const existingNames = existing.map(tag => tag.name);
    const newTags = tags.filter(tag => !existingNames.includes(tag));
  
    const created = await Promise.all(
      newTags.map(name =>
        hashtagService.create('api::hashtag.hashtag', {
          data: { name }
        })
      )
    );
  
    return [...existing, ...created].map(tag => tag.id);
  }
  