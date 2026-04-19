const paginate = async (model, filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = [],
    select = "",
  } = options;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  let query = model.find(filter).sort(sort).skip(skip).limit(limitNum);

  if (select) query = query.select(select);

  if (Array.isArray(populate)) {
    populate.forEach((p) => {
      query = query.populate(p);
    });
  }

  const [data, total] = await Promise.all([
    query.lean(),
    model.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };
};

module.exports = { paginate };
