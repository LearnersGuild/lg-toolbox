module.exports = {
  rules: {
    'flag-import': {
      create: function (context) {
        return {
          ImportDeclaration(node) {
            context.report(node, 'Cannot use Import in CommonJs Module')
          },
        }
      },
    },
  },
}
