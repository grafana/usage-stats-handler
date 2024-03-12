module.exports = {
    rewrite: function(input) {
      return input.replace(/-.*/, '');
    }
  }