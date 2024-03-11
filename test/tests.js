var assert = require('assert');
var app = require('../usage-stats-handler/version');


describe('graphite version rewrite', function () {
  it('should remove -33922pre', function () {
    assert.equal(app.rewrite('8_2_0-33922pre'), '8_2_0');
  });

  it('should remove -12341343', function () {
    assert.equal(app.rewrite('8_2_0-33922pre'), '8_2_0');
  });

  it('should remove -beta1', function () {
    assert.equal(app.rewrite('8_2_0-33922pre'), '8_2_0');
  });

  it('should remove -', function () {
    assert.equal(app.rewrite('8_2_0-33922pre'), '8_2_0');
  });
});