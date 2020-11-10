
import _ from 'lodash';

export default async (connectionArgs = {}, model, opts = {}, defaultSortBy = 'id', defaultDirection = 'ASC') => {
  const { first = 10, offset = 0, sortBy = defaultSortBy, sortOrder = defaultDirection } = connectionArgs;
  const crawlAll = first <= 0;

  const totalCount = await model.count(opts);
  const nodes = await model.findAll({
    ...opts,
    order: [[sortBy, sortOrder], ...opts.order || []],
    ...!crawlAll && { limit: first, },
    offset,
  });

  return {
    nodes,
    pageInfo: {
      hasPreviousPage: !!offset,
      hasNextPage: !crawlAll && totalCount > offset + first,
      totalCount,
    }
  }
}
