const constants = require('./constants');

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || constants.PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    constants.PAGINATION.MAX_LIMIT,
    parseInt(query.limit, 10) || constants.PAGINATION.DEFAULT_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasMore: page * limit < total,
});

const getCursorPagination = (query) => {
  const limit = Math.min(
    constants.PAGINATION.MAX_LIMIT,
    parseInt(query.limit, 10) || constants.PAGINATION.DEFAULT_LIMIT
  );
  const cursor = query.cursor || null;

  return { cursor, limit };
};

module.exports = { getPagination, getPaginationMeta, getCursorPagination };
