function dummyModelModel(thinky) {
  const {r, type: {string, date}} = thinky
  return {
    name: 'DummyModel',
    table: 'dummys',
    schema: {
      id: string()
        .uuid(4)
        .allowNull(false),
      updatedAt: date()
        .allowNull(false)
        .default(r.now()),
    },
    associate: (DummyModel, models) => {
      DummyModel.hasOne(models.DummyModelTwo, 'twoDummys', 'id', 'dummyModelId', {init: false})
    },
  }
}

module.exports = dummyModelModel
