import DataLoader from 'dataloader';
import _ from 'lodash';

export default (models) => ({
  posts: new DataLoader(async keys => {
    const result = await models.Post.findAll({
      where: { id: keys },
    });
    return keys.map(key => result.find(r => r.id == key));
  }),
  users: new DataLoader(async keys => {
    const result = await models.User.findAll({
      where: { id: keys },
    });
    return keys.map(key => result.find(r => r.id == key));
  }),
});
