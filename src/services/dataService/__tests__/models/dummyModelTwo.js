function dummyModelModelTwo(thinky) {
  const {r, type: {string, date}} = thinky
  return {
    name: 'DummyModelTwo',
    table: 'twoDummys',
    schema: {
      id: string()
        .uuid(4)
        .allowNull(false),
      updatedAt: date()
        .allowNull(false)
        .default(r.now()),
      dummyModelId: string()
        .uuid(4)
        .allowNull(false),
      name: string()
        .allowNull(false)
        .default('dummyModel'),
    },
    associate: (DummyModelTwo, models) => {
      DummyModelTwo.belongsTo(models.DummyModel, 'dummys', 'dummyModelId', 'id', {init: false})
    },
  }
}

module.exports = dummyModelModelTwo
